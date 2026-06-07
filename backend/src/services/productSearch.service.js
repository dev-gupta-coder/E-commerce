// ============================================================
//  src/services/productSearch.service.js
//
//  Responsibility:
//    Build and execute optimised MongoDB Aggregation Pipeline
//    queries for the product catalogue — search, filter, sort,
//    and paginate in a SINGLE database round-trip using $facet.
//
//  Why Aggregation Pipeline instead of .find() + .countDocuments()?
//    .find() approach = 2 DB commands per request (query + count).
//    $facet pipeline  = 1 DB command for products + count + facets.
//
//  Pipeline stage order (performance-critical):
//    $match   → filter FIRST to leverage indexes and reduce docs
//    $sort    → sort the filtered (small) set, not the whole collection
//    $facet   → split into parallel sub-pipelines in one pass:
//               "data"           → $skip + $limit (the current page)
//               "meta"           → $count (total matching docs)
//               "categoryFacets" → $group by category (sidebar counts)
//               "priceRange"     → $min/$max price (slider bounds)
//    $project → reshape $facet output into the API response format
//
//  Indexes leveraged (defined in Product.model.js):
//    { name, description, brand }  — text index (weighted)
//    { category, isActive, price } — compound (catalogue filters)
//    { ratings: -1 }               — ratings sort
//    { stock: 1 }                  — in-stock filter
//    { createdAt: -1 }             — newest sort
//
//  Exported:
//    searchProducts(queryParams)  → { products, pagination, facets }
//    buildSearchPipeline(params)  → raw pipeline Array (for testing)
//    SORT_OPTIONS                 → valid sort key enum
//    DEFAULT_PAGINATION           → page/limit constants
// ============================================================

import { Product, PRODUCT_CATEGORIES } from "../models/Product.model.js";
import { ApiError }                    from "../utils/ApiError.js";

// ============================================================
//  CONSTANTS
// ============================================================

export const SORT_OPTIONS = Object.freeze({
  PRICE_ASC:   "price-asc",
  PRICE_DESC:  "price-desc",
  RATING_DESC: "rating-desc",
  NEWEST:      "newest",
  POPULAR:     "popular",
  RELEVANCE:   "relevance",
});

export const DEFAULT_PAGINATION = Object.freeze({
  PAGE:      1,
  LIMIT:     12,
  MAX_LIMIT: 50,
});

const MAX_PRICE_PAISE = 10_000_000;   // ₹1 lakh ceiling

// ============================================================
//  HELPER — sanitizePaginationParams
//  Converts raw query strings to safe integers with bounds.
// ============================================================
const sanitizePaginationParams = (rawPage, rawLimit) => {
  const page = Math.max(
    DEFAULT_PAGINATION.PAGE,
    parseInt(rawPage, 10) || DEFAULT_PAGINATION.PAGE
  );
  const limit = Math.min(
    DEFAULT_PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(rawLimit, 10) || DEFAULT_PAGINATION.LIMIT)
  );
  return { page, limit, skip: (page - 1) * limit };
};

// ============================================================
//  HELPER — sanitizePrice
//  Returns a valid paise integer, or null if input is absent/invalid.
// ============================================================
const sanitizePrice = (raw) => {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.floor(Math.min(n, MAX_PRICE_PAISE));
};

// ============================================================
//  STAGE 1 — buildMatchStage
//  Constructs the $match expression from validated parameters.
//
//  MUST be first in the pipeline so MongoDB uses indexes.
//  Placing any other stage before $match forces a collection scan.
// ============================================================
const buildMatchStage = (params) => {
  const { keyword, category, brand, minPrice, maxPrice, inStock } = params;

  const match = {
    isActive: true,   // always hide soft-deleted / draft products
  };

  // ── Full-text keyword search ────────────────────────────
  // Uses the weighted text index: name×10, brand×5, description×1.
  // $text must appear in the FIRST $match stage — cannot be used
  // in later pipeline stages or after any non-$match stage.
  if (keyword?.trim()) {
    match.$text = { $search: keyword.trim() };
  }

  // ── Category exact match ────────────────────────────────
  // Uses the leading field of compound index { category, isActive, price }.
  if (category) {
    match.category = category;
  }

  // ── Brand partial match (case-insensitive) ──────────────
  // RegExp with "i" flag.  Cannot use a B-tree index efficiently
  // because of the mid-string match.  Falls back to text index
  // when keyword is also present (brand has weight 5 in the index).
  if (brand?.trim()) {
    match.brand = { $regex: brand.trim(), $options: "i" };
  }

  // ── Price range ─────────────────────────────────────────
  // Combining $gte + $lte in one object allows MongoDB to use
  // a single index range scan instead of intersecting two scans.
  const min = sanitizePrice(minPrice);
  const max = sanitizePrice(maxPrice);

  if (min !== null && max !== null && min > max) {
    throw new ApiError(400, `minPrice (${min}) cannot exceed maxPrice (${max}).`);
  }

  if (min !== null || max !== null) {
    match.price = {};
    if (min !== null) match.price.$gte = min;   // inclusive lower bound
    if (max !== null) match.price.$lte = max;   // inclusive upper bound
  }

  // ── In-stock filter ─────────────────────────────────────
  // { stock: { $gt: 0 } } uses the { stock: 1 } index.
  if (inStock === true || inStock === "true") {
    match.stock = { $gt: 0 };
  }

  return match;
};

// ============================================================
//  STAGE 2 — buildSortStage
//  Maps the sort option string to a MongoDB $sort expression.
//
//  Sort runs AFTER $match so we only sort the filtered subset.
//
//  _id is appended as a tiebreaker on every sort to guarantee
//  stable pagination — without it, products with equal sort
//  values can shift between pages.
//
//  When keyword is present and no sort is requested, default to
//  relevance order using { $meta: "textScore" }.
// ============================================================
const buildSortStage = (sortBy, hasText) => {
  if (hasText && (!sortBy || sortBy === SORT_OPTIONS.RELEVANCE)) {
    // $meta: "textScore" reads MongoDB's computed relevance score.
    // Higher = more relevant to the search term.
    return { score: { $meta: "textScore" }, createdAt: -1, _id: 1 };
  }

  const sortMap = {
    [SORT_OPTIONS.PRICE_ASC]:   { price:      1,  _id: 1 },
    [SORT_OPTIONS.PRICE_DESC]:  { price:     -1,  _id: 1 },
    [SORT_OPTIONS.RATING_DESC]: { ratings:   -1,  _id: 1 },
    [SORT_OPTIONS.NEWEST]:      { createdAt: -1,  _id: 1 },
    [SORT_OPTIONS.POPULAR]:     { numReviews: -1, _id: 1 },
    [SORT_OPTIONS.RELEVANCE]:   { createdAt: -1,  _id: 1 },
  };

  return sortMap[sortBy] ?? { createdAt: -1, _id: 1 };
};

// ============================================================
//  STAGE 3 — buildProjectionStage
//  Defines the output shape of each product document inside
//  the $facet data sub-pipeline.
//
//  Virtuals (effectivePrice, isInStock, discountPercent) are
//  NOT available inside aggregation pipelines — Mongoose model
//  virtuals only run on hydrated documents.
//  We replicate them here as $cond/$round expressions.
// ============================================================
const buildProjectionStage = (hasText) => ({
  name:          1,
  category:      1,
  brand:         1,
  price:         1,
  discountPrice: 1,
  stock:         1,
  images:        { $slice: ["$images", 1] },   // only first image in listing
  ratings:       1,
  numReviews:    1,
  createdAt:     1,

  // effectivePrice — discountPrice when valid, else full price
  effectivePrice: {
    $cond: {
      if:   { $and: [{ $ne: ["$discountPrice", null] }, { $lt: ["$discountPrice", "$price"] }] },
      then: "$discountPrice",
      else: "$price",
    },
  },

  // isInStock — stock > 0
  isInStock: { $gt: ["$stock", 0] },

  // discountPercent — powers "X% off" badges on product cards
  discountPercent: {
    $cond: {
      if: {
        $and: [
          { $ne: ["$discountPrice", null] },
          { $lt: ["$discountPrice", "$price"] },
          { $gt: ["$price", 0] },
        ],
      },
      then: {
        $round: [
          { $multiply: [{ $divide: [{ $subtract: ["$price", "$discountPrice"] }, "$price"] }, 100] },
          0,
        ],
      },
      else: 0,
    },
  },

  // Include relevance score only when a keyword search is active
  ...(hasText && { score: { $meta: "textScore" } }),
});

// ============================================================
//  buildSearchPipeline (exported for unit testing)
//  Assembles all pipeline stages into the final array.
//
//  @param  {Object} params  — validated query params
//  @returns {Array}          — MongoDB aggregation pipeline
// ============================================================
export const buildSearchPipeline = (params) => {
  const hasText = Boolean(params.keyword?.trim());
  const { skip, limit } = params;

  return [
    // ── Stage 1: $match ─────────────────────────────────
    // First stage — uses indexes.  Reduces the working set
    // for all subsequent stages.
    { $match: buildMatchStage(params) },

    // ── Stage 2: $sort ──────────────────────────────────
    // Sorts the already-filtered subset.
    { $sort: buildSortStage(params.sortBy, hasText) },

    // ── Stage 3: $addFields (text only) ─────────────────
    // Materialises textScore as a named field so it survives
    // the $facet boundary into sub-pipelines.
    ...(hasText ? [{ $addFields: { score: { $meta: "textScore" } } }] : []),

    // ── Stage 4: $facet ─────────────────────────────────
    // Runs 4 sub-pipelines on the same input documents in one pass.
    {
      $facet: {
        // Current page of products
        data: [
          { $skip:    skip },
          { $limit:   limit },
          { $project: buildProjectionStage(hasText) },
        ],

        // Total count of matched documents (before skip/limit)
        meta: [
          { $count: "total" },
        ],

        // Per-category counts for the filter sidebar
        // e.g., [{ category: "Electronics", count: 12 }, ...]
        categoryFacets: [
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort:  { count: -1 } },
        ],

        // Min/max price of filtered results — sets slider bounds
        // to current-filter range, not global catalogue range.
        priceRange: [
          {
            $group: {
              _id:      null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ],
      },
    },

    // ── Stage 5: $project (reshape $facet output) ────────
    // $arrayElemAt[0] extracts the scalar from single-element arrays.
    // $ifNull provides safe defaults when sub-pipelines return [].
    {
      $project: {
        products:      "$data",
        totalProducts: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
        categoryFacets: {
          $map: {
            input: "$categoryFacets",
            as:    "cf",
            in:    { category: "$$cf._id", count: "$$cf.count" },
          },
        },
        priceRange: { $arrayElemAt: ["$priceRange", 0] },
      },
    },
  ];
};

// ============================================================
//  searchProducts — main public export
//  Validates params, builds pipeline, executes, returns result.
//
//  @param  {Object} queryParams  — raw req.query
//  @returns {Promise<{
//    products:   Array,
//    pagination: Object,
//    facets:     Object,
//  }>}
// ============================================================
export const searchProducts = async (queryParams) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
    page:  rawPage,
    limit: rawLimit,
  } = queryParams;

  // ── Validate category ─────────────────────────────────
  if (category && !PRODUCT_CATEGORIES.includes(category)) {
    throw new ApiError(
      400,
      `Invalid category "${category}". Valid: ${PRODUCT_CATEGORIES.join(", ")}.`
    );
  }

  // ── Validate sortBy ───────────────────────────────────
  if (sortBy && !Object.values(SORT_OPTIONS).includes(sortBy)) {
    throw new ApiError(
      400,
      `Invalid sort option "${sortBy}". Valid: ${Object.values(SORT_OPTIONS).join(", ")}.`
    );
  }

  // ── Sanitize pagination ───────────────────────────────
  const { page, limit, skip } = sanitizePaginationParams(rawPage, rawLimit);

  // ── Build and execute pipeline ────────────────────────
  const pipeline = buildSearchPipeline({
    keyword, category, brand, minPrice, maxPrice, inStock, sortBy,
    page, limit, skip,
  });

  // aggregate() always returns an array; our pipeline produces
  // exactly one output document from the $facet + reshape stages.
  const [result] = await Product.aggregate(pipeline);

  // Empty collection edge case
  if (!result) {
    return {
      products: [],
      pagination: { totalProducts: 0, totalPages: 0, currentPage: page, limit, hasNextPage: false, hasPrevPage: false },
      facets: { categories: [], priceRange: null },
    };
  }

  const { products, totalProducts, categoryFacets, priceRange } = result;
  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    pagination: {
      totalProducts,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      firstPage:   1,
      lastPage:    totalPages,
    },
    facets: {
      categories: categoryFacets,
      priceRange: priceRange
        ? { min: priceRange.minPrice, max: priceRange.maxPrice }
        : null,
    },
  };
};
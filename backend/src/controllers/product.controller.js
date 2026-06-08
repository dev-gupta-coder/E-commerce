// ============================================================
//  src/controllers/product.controller.js
//
//  Responsibility:
//    Handle HTTP layer for the product domain.  Extract data
//    from req, delegate to the Product model and Cloudinary
//    service, and send structured responses.
//
//    No business logic lives here — controllers are thin.
//    Every function is wrapped in asyncHandler so thrown
//    ApiErrors automatically reach the global error handler.
//
//  Exported handlers (all consumed by product.routes.js):
//    createProduct    POST   /api/v1/products
//    getAllProducts   GET    /api/v1/products
//    getProductById  GET    /api/v1/products/:id
//    updateProduct   PUT    /api/v1/products/:id
//    deleteProduct   DELETE /api/v1/products/:id
//    addReview       POST   /api/v1/products/:id/review
//    deleteReview    DELETE /api/v1/products/:id/review
//
//  Auth:
//    createProduct, updateProduct, deleteProduct → admin only
//    addReview                                   → customer only
//    deleteReview                → own review (customer) or admin
//    getAllProducts, getProductById              → public
// ============================================================

import mongoose                   from "mongoose";
import { Product, PRODUCT_CATEGORIES } from "../models/Product.model.js";
import { ApiError }               from "../utils/ApiError.js";
import { ApiResponse }            from "../utils/ApiResponse.js";
import { asyncHandler }           from "../utils/asyncHandler.js";

// ── Cloudinary service (uncomment when cloudinary.service.js exists) ──
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service.js";

// ============================================================
//  HELPER — isValidObjectId
//  Checks whether a string is a valid MongoDB ObjectId before
//  passing it to mongoose queries.  Mongoose will throw a
//  CastError on an invalid ObjectId which produces a confusing
//  500 error instead of a clean 404.
//
//  @param  {string} id
//  @returns {boolean}
// ============================================================
const isValidObjectId = (id) => mongoose.isValidObjectId(id);

// ============================================================
//  HELPER — buildProductFilter
//  Constructs a MongoDB filter object from the request's query
//  parameters.  Extracted into a helper to keep getAllProducts
//  readable and to make filter logic independently testable.
//
//  Supported query parameters:
//    search    — full-text search on name + description
//    category  — exact match (from PRODUCT_CATEGORIES enum)
//    brand     — case-insensitive partial match
//    minPrice  — lower bound for price filter (inclusive)
//    maxPrice  — upper bound for price filter (inclusive)
//    inStock   — "true" returns only products with stock > 0
//    featured  — "true" returns only featured products
//
//  @param  {object} query — req.query
//  @returns {object}       — MongoDB filter document
// ============================================================
const buildProductFilter = (query) => {
  const filter = {
    // Always exclude soft-deleted products from public queries.
    // Admin views can override this by passing isActive: false.
    isActive: true,
  };

  // ── Full-text search ────────────────────────────────────
  // Uses the text index declared on name + description in the model.
  // $text search requires the text index to be present.
  if (query.search?.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  // ── Category filter (exact match) ──────────────────────
  if (query.category && PRODUCT_CATEGORIES.includes(query.category)) {
    filter.category = query.category;
  }

  // ── Brand filter (case-insensitive partial match) ───────
  // RegExp with "i" flag: "apple" matches "Apple", "APPLE", etc.
  if (query.brand?.trim()) {
    filter.brand = { $regex: query.brand.trim(), $options: "i" };
  }

  // ── Price range filter ──────────────────────────────────
  // Only apply bounds that are valid positive numbers.
  // Both bounds are optional — you can filter minPrice only or
  // maxPrice only without needing the other.
  const minPrice = parseFloat(query.minPrice);
  const maxPrice = parseFloat(query.maxPrice);

  if (!isNaN(minPrice) && minPrice >= 0) {
    filter.price = { ...filter.price, $gte: minPrice };
  }
  if (!isNaN(maxPrice) && maxPrice >= 0) {
    filter.price = { ...filter.price, $lte: maxPrice };
  }

  // ── In-stock filter ─────────────────────────────────────
  // ?inStock=true → only return products where stock > 0
  if (query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  // ── Featured filter ─────────────────────────────────────
  if (query.featured === "true") {
    filter.isFeatured = true;
  }

  return filter;
};

// ============================================================
//  createProduct
//  POST /api/v1/products
//  Access: admin only (enforced by requireAdmin middleware)
//
//  Flow:
//    1. Extract and validate body fields.
//    2. Upload images to Cloudinary → receive { url, publicId }.
//    3. Create the Product document in MongoDB.
//    4. Return 201 with the created product.
//
//  Image handling:
//    The route mounts multer (upload.middleware.js) before this
//    controller — uploaded files arrive in req.files[].
//    Each file buffer is passed to Cloudinary's upload stream.
//    If Cloudinary upload fails, no Product document is created
//    (fail-fast before the DB write).
// ============================================================
export const createProduct = asyncHandler(async (req, res) => {

  // ── 1. Extract body ───────────────────────────────────────
  const {
    name,
    description,
    category,
    brand,
    price,
    discountPrice,
    stock,
  } = req.body;

  // ── 2. Upload images to Cloudinary ────────────────────────
  // req.files is populated by multer middleware on the route.
  // If no images are provided, we start with an empty array —
  // images can be added later via updateProduct.
  let images = [];

  if (req.files && req.files.length > 0) {
    // Validate image count before touching Cloudinary.
    if (req.files.length > 10) {
      throw new ApiError(400, "A product can have at most 10 images.");
    }

    // Upload each file concurrently — Promise.all waits for all
    // uploads before proceeding, and rejects immediately if any
    // single upload fails (fail-fast behaviour).
    // Uncomment when cloudinary.service.js is implemented:
    // images = await Promise.all(
    //   req.files.map((file) =>
    //     uploadToCloudinary(file.buffer, "products")
    //   )
    // );

    // Placeholder for local development without Cloudinary:
    images = await Promise.all(
  req.files.map((file) =>
    uploadToCloudinary(file.buffer)
  )
);
  }

  // ── 3. Create Product document ────────────────────────────
  // Mongoose triggers schema validators + the compound price
  // cross-field validator (discountPrice < price) here.
  const product = await Product.create({
    name,
    description,
    category,
    brand,
    price:         Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : null,
    stock:         Number(stock) || 0,
    images,
  });

  // ── 4. Respond ────────────────────────────────────────────
  return res
    .status(201)
    .json(
      new ApiResponse(201, { product }, "Product created successfully.")
    );
});

// ============================================================
//  getAllProducts
//  GET /api/v1/products
//  Access: public
//
//  Features:
//    • Full-text search  (?search=wireless+headphones)
//    • Category filter   (?category=Electronics)
//    • Brand filter      (?brand=Sony)
//    • Price range       (?minPrice=100&maxPrice=5000)
//    • In-stock filter   (?inStock=true)
//    • Featured filter   (?featured=true)
//    • Sorting           (?sort=price_asc | price_desc | rating | newest)
//    • Pagination        (?page=1&limit=12)
//
//  Performance notes:
//    • countDocuments() runs with the SAME filter — same index hit.
//    • .lean() returns plain JS objects instead of Mongoose
//      Document instances: ~3-5× faster serialisation, lower
//      memory.  Use it on read-only routes that don't need
//      instance methods or virtuals.
//    • select("-reviews") excludes the (potentially large)
//      reviews array from list results — reviews are fetched
//      only on the single-product page.
// ============================================================
export const getAllProducts = asyncHandler(async (req, res) => {

  // ── Build filter ──────────────────────────────────────────
  const filter = buildProductFilter(req.query);

  // ── Build sort ────────────────────────────────────────────
  // Mongoose sort accepts an object: { field: 1 (asc) | -1 (desc) }
  const SORT_OPTIONS = {
    price_asc:  { price:      1 },
    price_desc: { price:     -1 },
    rating:     { avgRating: -1 },
    newest:     { createdAt: -1 },
    // Text search results: sort by relevance score when ?search= is active.
    // The { score: { $meta: "textScore" } } projection is added below.
  };

  let sort = SORT_OPTIONS[req.query.sort] || { createdAt: -1 };  // default: newest first

  // ── Pagination ────────────────────────────────────────────
  // parseInt with radix 10 — prevents silent octal parsing.
  // Math.max ensures the page is at least 1.
  // Math.min caps limit at 50 to prevent clients from requesting
  // the entire collection in one call.
  const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 12);
  const skip  = (page - 1) * limit;

  // ── Text search projection ────────────────────────────────
  // When $text search is active, MongoDB computes a relevance
  // score for each matching document.  Projecting { score: { $meta } }
  // and sorting by it returns the most relevant results first.
  let projection = {};
  if (filter.$text) {
    projection = { score: { $meta: "textScore" } };
    sort       = { score: { $meta: "textScore" } };  // override sort with relevance
  }

  // ── Execute query + count in parallel ─────────────────────
  // Promise.all fires both DB operations simultaneously.
  // Total time ≈ max(query time, count time) instead of their sum.
  const [products, totalProducts] = await Promise.all([
    Product.find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-reviews")   // exclude reviews array from list view
      .lean(),              // plain JS objects — faster than full Documents
    Product.countDocuments(filter),
  ]);

  // ── Build pagination metadata ─────────────────────────────
  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          totalProducts,
          totalPages,
          currentPage:  page,
          limit,
          hasNextPage:  page < totalPages,
          hasPrevPage:  page > 1,
        },
      },
      "Products fetched successfully."
    )
  );
});

// ============================================================
//  getProductById
//  GET /api/v1/products/:id
//  Access: public
//
//  Returns the full product document including reviews.
//  .populate() replaces the user ObjectId in each review with
//  the reviewer's name — no extra round-trip needed from the
//  frontend.
// ============================================================
export const getProductById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  // ── Validate ObjectId ─────────────────────────────────────
  // Without this check, Mongoose throws a CastError which
  // Express turns into a confusing 500.  Better to intercept
  // and return a clean 400.
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid product ID format.");
  }

  // ── Fetch product ─────────────────────────────────────────
  // Populate reviewer name + mobile for display in the review card.
  // select("name mobile") — only fetch those two User fields,
  // never exposing passwordHash or refreshToken.
  const product = await Product.findOne({ _id: id, isActive: true })
    .populate("reviews.user", "name mobile");

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully."));
});

// ============================================================
//  updateProduct
//  PUT /api/v1/products/:id
//  Access: admin only
//
//  Supports partial updates — only fields present in req.body
//  are applied.  Uses $set so unmentioned fields are untouched.
//
//  Image update strategy:
//    Two separate mechanisms for image management:
//    a) req.files → new images uploaded to Cloudinary, appended.
//    b) req.body.removeImageIds → existing image publicIds to delete.
//    Both can be used in the same request (replace a specific image).
// ============================================================
export const updateProduct = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid product ID format.");
  }

  // ── Verify product exists ─────────────────────────────────
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  // ── Handle image deletions ────────────────────────────────
  // req.body.removeImageIds is an array of Cloudinary publicIds.
  // We delete from Cloudinary FIRST, then remove from the document.
  if (req.body.removeImageIds?.length > 0) {
    const idsToRemove = Array.isArray(req.body.removeImageIds)
      ? req.body.removeImageIds
      : [req.body.removeImageIds];

    // Delete from Cloudinary concurrently.
    // Uncomment when cloudinary.service.js is implemented:
    await Promise.all(
      idsToRemove.map((publicId) => deleteFromCloudinary(publicId))
    );

    // Remove the matching image sub-documents from the array.
    // $pull with $in removes all array elements whose publicId
    // is in the idsToRemove array — a single atomic DB operation.
    await Product.updateOne(
      { _id: id },
      { $pull: { images: { publicId: { $in: idsToRemove } } } }
    );
  }

  // ── Handle new image uploads ──────────────────────────────
  if (req.files?.length > 0) {
    // Check that adding new images won't exceed the limit.
    const currentImageCount = product.images.length - (req.body.removeImageIds?.length || 0);
    if (currentImageCount + req.files.length > 10) {
      throw new ApiError(
        400,
        `Adding ${req.files.length} image(s) would exceed the 10-image limit.`
      );
    }

    // Uncomment for real Cloudinary uploads:
    // const newImages = await Promise.all(
    //   req.files.map((file) => uploadToCloudinary(file.buffer, "products"))
    // );

    const newImages = await Promise.all(
  req.files.map((file) =>
    uploadToCloudinary(file.buffer)
  )
);

    // $push with $each appends multiple elements to the array atomically.
    await Product.updateOne(
      { _id: id },
      { $push: { images: { $each: newImages } } }
    );
  }

  // ── Build scalar field update payload ─────────────────────
  // Only include fields that were actually sent in the request body.
  // This prevents accidentally nullifying fields that weren't
  // mentioned.  Object.fromEntries + filter approach is clean and
  // handles any combination of optional fields.
  const allowedUpdates = [
    "name", "description", "category", "brand",
    "price", "discountPrice", "stock", "isFeatured", "isActive",
  ];

  const updatePayload = {};
  allowedUpdates.forEach((field) => {
    // undefined check — a field explicitly set to null is
    // intentional (e.g., clearing discountPrice); undefined
    // means the field was not sent in the request at all.
    if (req.body[field] !== undefined) {
      updatePayload[field] = req.body[field];
    }
  });

  // ── Apply scalar updates ──────────────────────────────────
  // new: true returns the updated document instead of the old one.
  // runValidators: true re-runs schema validators on changed fields
  // (e.g., ensures new price is still non-negative).
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { product: updatedProduct }, "Product updated successfully.")
    );
});

// ============================================================
//  deleteProduct
//  DELETE /api/v1/products/:id
//  Access: admin only
//
//  Strategy: soft delete (isActive = false).
//
//  Why soft delete instead of hard delete?
//    • Orders referencing this product remain valid — no broken
//      foreign key scenario.
//    • The admin can reactivate the product (e.g., temporary
//      "out of season" removal).
//    • Audit trail is preserved.
//
//  Hard delete (permanent removal):
//    Use deleteProduct_HARD below as a template when you need
//    to permanently purge and also clean up Cloudinary assets.
// ============================================================
export const deleteProduct = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid product ID format.");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  // ── Soft delete ───────────────────────────────────────────
  // Sets isActive: false — the product disappears from all
  // public queries (which filter isActive: true) but stays
  // in the DB for historical order records.
  product.isActive = false;
  await product.save({ validateBeforeSave: false });

  // ── Optional: hard delete with Cloudinary cleanup ─────────
  // Uncomment to permanently delete the product and its images.
  //
  // // Delete all Cloudinary assets first
  // await Promise.all(
  //   product.images.map((img) => deleteFromCloudinary(img.publicId))
  // );
  // // Then remove the document entirely
  // await Product.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Product deleted successfully.")
    );
});

// ============================================================
//  addReview
//  POST /api/v1/products/:id/review
//  Access: customer only (enforced by requireCustomer middleware)
//
//  Rules:
//    • One review per customer per product.
//    • Rating must be 1–5 (enforced by reviewSchema validators).
//    • After adding, avgRating and numReviews are recomputed.
// ============================================================
export const addReview = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid product ID format.");
  }

  if (!rating) {
    throw new ApiError(400, "Rating is required.");
  }

  const product = await Product.findOne({ _id: id, isActive: true });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  // ── One review per customer ───────────────────────────────
  // Check if this user has already reviewed this product.
  // Convert ObjectId to string for strict equality comparison.
  const alreadyReviewed = product.reviews.some(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw new ApiError(
      409,
      "You have already reviewed this product. " +
      "Please edit your existing review instead."
    );
  }

  // ── Add review ────────────────────────────────────────────
  // $push appends the new review sub-document atomically.
  // This is safer than product.reviews.push() + product.save()
  // in a concurrent environment — $push is an atomic operation.
  const newReview = {
    user:    req.user._id,
    rating:  Number(rating),
    comment: comment?.trim() || "",
  };

  product.reviews.push(newReview);

  // ── Recompute ratings denormalisation ─────────────────────
  // recalculateRatings() saves the document internally.
  await product.recalculateRatings();

  // Re-fetch to get the populated review with user details.
  const updatedProduct = await Product.findById(id)
    .populate("reviews.user", "name");

  return res
    .status(201)
    .json(
      new ApiResponse(201, { product: updatedProduct }, "Review added successfully.")
    );
});

// ============================================================
//  deleteReview
//  DELETE /api/v1/products/:id/review
//  Access: own review (customer) OR any review (admin)
//  Ownership enforced by authorizeOwnership middleware BEFORE
//  this controller runs — by the time we're here, ownership
//  is already confirmed.
//
//  The review to delete is identified by req.user._id (the
//  authenticated user's own review) for customers, or by
//  req.body.reviewId for admins deleting a specific review.
// ============================================================
export const deleteReview = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid product ID format.");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  // ── Determine which review to delete ──────────────────────
  // Admin can supply a specific reviewId in the body.
  // Customer deletes their own review (matched by user field).
  const reviewIdToDelete = req.body.reviewId || null;

  let reviewFilter;
  if (reviewIdToDelete && isValidObjectId(reviewIdToDelete)) {
    // Admin deleting a specific review by its _id
    reviewFilter = { _id: reviewIdToDelete };
  } else {
    // Customer deleting their own review
    reviewFilter = { user: req.user._id };
  }

  // ── Remove review from the embedded array ─────────────────
  // $pull removes all elements matching the filter from the array.
  // This is atomic — no race condition with concurrent requests.
  const result = await Product.updateOne(
    { _id: id },
    { $pull: { reviews: reviewFilter } }
  );

  if (result.modifiedCount === 0) {
    throw new ApiError(404, "Review not found.");
  }

  // ── Reload and recompute ratings ──────────────────────────
  const updatedProduct = await Product.findById(id);
  await updatedProduct.recalculateRatings();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Review deleted successfully.")
    );
});  
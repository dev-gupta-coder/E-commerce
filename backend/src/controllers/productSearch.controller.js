// ============================================================
//  src/controllers/productSearch.controller.js
//
//  Responsibility:
//    Thin HTTP layer — extract query params from req.query,
//    delegate entirely to productSearch.service.js, and send
//    the structured response.  Zero query-building logic here.
//
//  Routes handled:
//    GET /api/v1/products/search
//
//  Query parameters (all optional):
//    keyword   {string}  — full-text search term
//    category  {string}  — exact category enum value
//    brand     {string}  — partial, case-insensitive
//    minPrice  {number}  — lower price bound in paise
//    maxPrice  {number}  — upper price bound in paise
//    inStock   {boolean} — "true" = only in-stock products
//    sortBy    {string}  — price-asc | price-desc | rating-desc
//                          | newest | popular | relevance
//    page      {number}  — page number (default 1)
//    limit     {number}  — per page (default 12, max 50)
//
//  Example request:
//    GET /api/v1/products/search
//        ?keyword=running+shoes
//        &category=Footwear
//        &minPrice=100000
//        &maxPrice=500000
//        &inStock=true
//        &sortBy=rating-desc
//        &page=1&limit=12
// ============================================================

import { searchProducts, SORT_OPTIONS } from "../services/productSearch.service.js";
import { PRODUCT_CATEGORIES }           from "../models/Product.model.js";
import { ApiResponse }                  from "../utils/ApiResponse.js";
import { asyncHandler }                 from "../utils/asyncHandler.js";

export const searchProductsHandler = asyncHandler(async (req, res) => {

  // Delegate entirely — controller has no query logic.
  const result = await searchProducts(req.query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...result,
        // Expose available filter options so frontends don't
        // hard-code category/sort lists in client code.
        meta: {
          availableCategories:  PRODUCT_CATEGORIES,
          availableSortOptions: Object.values(SORT_OPTIONS),
        },
      },
      result.products.length === 0
        ? "No products found matching your criteria."
        : `Found ${result.pagination.totalProducts} product(s).`
    )
  );
});
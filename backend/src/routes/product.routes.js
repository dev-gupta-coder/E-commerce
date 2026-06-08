// ============================================================
//  src/routes/product.routes.js
//
//  Responsibility:
//    Wire HTTP endpoints for the product domain and apply the
//    correct authentication + authorization middleware to each.
//
//  This file is the clearest demonstration of the RBAC system:
//    • Public routes  — no middleware (anyone can browse)
//    • Protected      — verifyJWT (must be logged in)
//    • Admin-only     — verifyJWT + requireAdmin (must be admin)
//    • Ownership      — verifyJWT + requireAnyRole + authorizeOwnership
//
//  Mounted in app.js as:
//    app.use("/api/v1/products", productRoutes);
//
//  Full URL map:
//    GET    /api/v1/products          → getAllProducts     (public)
//    GET    /api/v1/products/:id      → getProductById     (public)
//    POST   /api/v1/products          → createProduct      (admin only)
//    PUT    /api/v1/products/:id      → updateProduct      (admin only)
//    DELETE /api/v1/products/:id      → deleteProduct      (admin only)
//    POST   /api/v1/products/:id/review → addReview        (customer only)
//    DELETE /api/v1/products/:id/review → deleteReview     (ownership check)
// ============================================================

import { Router }         from "express";
import { upload } from "../middleware/upload.middleware.js";

// ── Auth middleware (who are you?) ───────────────────────────
import { verifyJWT }      from "../middleware/auth.middleware.js";

// ── RBAC middleware (what can you do?) ───────────────────────
import {
  requireAdmin, 
  requireCustomer,
  requireAnyRole,
  authorizeOwnership,
  authorizeRoles,
  ROLES,
}                         from "../middleware/authorize.middleware.js";

// ── Controllers (stub imports — implement separately) ────────
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
}                         from "../controllers/product.controller.js";

// ── Middleware that fetches the resource and sets res.locals ─
// Used as the "fetch" step before authorizeOwnership().
// import { fetchReview }    from "../middleware/fetchResource.middleware.js";//hidden

const router = Router();
console.log("✅ Product Routes Loaded");  //hidden temp put
// ============================================================
//  PUBLIC ROUTES
//  No authentication required — anyone (guest or logged-in)
//  can browse the product catalogue.
//
//  optionalAuth could be added here if personalisation is needed
//  (e.g., showing "In your wishlist ♥" for logged-in users).
// ============================================================

// GET /api/v1/products
// Returns paginated product list with filters (price, category, stock).
router.get("/", getAllProducts);

// GET /api/v1/products/:id
// Returns a single product's full details.
router.get("/:id", getProductById);

// ============================================================
//  ADMIN-ONLY ROUTES
//  Chain: verifyJWT → requireAdmin → controller
//
//  verifyJWT  — ensures the request carries a valid Access token
//               and populates req.user = { _id, mobile, role }.
//  requireAdmin — checks req.user.role === "admin".
//               Returns 403 if the user is a customer.
//
//  Reading the route declaration aloud:
//    "POST /  — verify the token, then require admin role,
//               then run createProduct"
// ============================================================

// POST /api/v1/products
// Admin creates a new product (with images via Cloudinary).
// router.post(
//   "/",
//   verifyJWT,         // Step 1 — authenticate
//   requireAdmin,      // Step 2 — must be admin
//   createProduct      // Step 3 — handle the request
// );

router.post(
  "/",
  verifyJWT,
  requireAdmin,
  upload.array("images", 10),
  createProduct
);

// PUT /api/v1/products/:id
// Admin updates an existing product's details, price, or stock.
// router.put(
//   "/:id",
//   verifyJWT,
//   requireAdmin,
//   updateProduct
// );
router.put(
  "/:id",
  verifyJWT,
  requireAdmin,
  upload.array("images", 10),
  updateProduct
);

// DELETE /api/v1/products/:id
// Admin permanently removes a product (also deletes Cloudinary images).
router.delete(
  "/:id",
  verifyJWT,
  requireAdmin,
  deleteProduct
);

// ============================================================
//  CUSTOMER-ONLY ROUTES
//  Chain: verifyJWT → requireCustomer → controller
//
//  requireCustomer blocks admins from the action.
//  Why block admins from writing reviews?
//    Reviews are customer-generated content.  An admin posting
//    a review would distort the product's genuine rating.
//    This is a business rule enforced at the middleware layer.
// ============================================================

// POST /api/v1/products/:id/review
// Authenticated customer submits a star rating + written review.
router.post(
  "/:id/review",
  verifyJWT,
  requireCustomer,   // admins explicitly blocked
  addReview
);

// ============================================================
//  OWNERSHIP-PROTECTED ROUTES
//  Chain: verifyJWT → requireAnyRole → fetchReview
//         → authorizeOwnership → controller
//
//  Step-by-step:
//    1. verifyJWT        — must be logged in
//    2. requireAnyRole   — role must be "admin" or "customer"
//    3. fetchReview      — fetches the review document from DB
//                          and stores it in res.locals.resource
//    4. authorizeOwnership — if customer: checks review.user === req.user._id
//                            if admin:    bypasses check (admin can delete any review)
//    5. deleteReview     — performs the deletion
//
//  This prevents IDOR: customer A cannot delete customer B's
//  review by guessing the product ID.
// ============================================================

// DELETE /api/v1/products/:id/review
// Customer deletes their own review; admin can delete any review.
// router.delete(  //hidden
//   "/:id/review",
//   verifyJWT,
//   requireAnyRole,
//   // fetchReview,  //hidden     // populates res.locals.resource = reviewDocument
//   // authorizeOwnership((review) => review.user.toString()), //hidden
//   // ↑ selector tells the middleware which field holds the owner ID
//   deleteReview
// );
router.delete(
  "/:id/review",
  verifyJWT,
  requireAnyRole,
  deleteReview
); 

// ============================================================
//  ADVANCED EXAMPLE — dynamic role from config
//  Shows authorizeRoles() factory used directly when neither
//  shorthand covers the requirement.
//
//  Example: only admins AND a future "moderator" role can
//  feature/unfeature a product. Using the factory directly
//  keeps this one-liner instead of creating another shorthand.
// ============================================================

// PATCH /api/v1/products/:id/feature
// Toggle featured status — admin only (plus "moderator" when added).
router.patch(
  "/:id/feature",
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),  // expand to authorizeRoles(ROLES.ADMIN, "moderator") later
  updateProduct                 // reuse the update controller with a body flag
);


export default router; 
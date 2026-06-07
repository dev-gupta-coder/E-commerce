// ============================================================
//  src/routes/cart.routes.js
//
//  Responsibility:
//    Wire HTTP endpoints for the cart domain and apply the
//    correct middleware to each route.
//    Zero business logic — pure wiring layer.
//
//  Mounted in app.js as:
//    app.use("/api/v1/cart", cartRoutes);
//
//  All routes are protected by verifyJWT + requireCustomer:
//    verifyJWT       — validates the Access token, populates req.user
//    requireCustomer — ensures the user is a customer (not admin)
//
//  Why block admins from cart routes?
//    An admin placing test orders would pollute sales analytics,
//    inventory records, and financial reports.  The cart (and
//    checkout) is a customer-only workflow by business design.
//
//  Full URL map:
//    GET    /api/v1/cart                  → getCart
//    POST   /api/v1/cart/items            → addToCart
//    PATCH  /api/v1/cart/items/:itemId    → updateCartItem
//    DELETE /api/v1/cart/items/:itemId    → removeCartItem
//    DELETE /api/v1/cart                  → clearCart
//
//  Route ordering note:
//    DELETE /api/v1/cart          (clear entire cart)
//    DELETE /api/v1/cart/items/:id (remove one item)
//    Express matches routes in declaration order.  Both DELETE
//    routes start with the same prefix, but Express matches the
//    more specific path ("/items/:itemId") correctly before "/"
//    as long as they are mounted on the same router.
// ============================================================

import { Router }          from "express";
import { verifyJWT }       from "../middleware/auth.middleware.js";
import { requireCustomer } from "../middleware/authorize.middleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
}                          from "../controllers/cart.controller.js";

const router = Router();

// ============================================================
//  Apply shared middleware to ALL cart routes at once.
//  Router-level middleware runs before any route handler below.
//
//  router.use(fn) is equivalent to adding fn as the first
//  argument on every router.get / router.post / etc.
//  Using it here avoids repeating the two middleware arguments
//  on every route definition — DRY and harder to accidentally omit.
//
//  Chain: verifyJWT → requireCustomer → route handler
// ============================================================
router.use(verifyJWT, requireCustomer);

// ============================================================
//  ROUTES
// ============================================================

// GET /api/v1/cart
// Returns the user's cart (empty-cart shape when no cart exists).
router.get("/", getCart);

// POST /api/v1/cart/items
// Adds a product to the cart (or increments quantity if present).
// Body: { productId: string, quantity: number }
router.post("/items", addToCart);

// PATCH /api/v1/cart/items/:itemId
// Updates the quantity of a specific cart line item.
// Body: { quantity: number }
// :itemId — the sub-document _id of the cart item (NOT productId)
router.patch("/items/:itemId", updateCartItem);

// DELETE /api/v1/cart/items/:itemId
// Removes a single item from the cart.
// :itemId — the sub-document _id of the cart item
router.delete("/items/:itemId", removeCartItem);

// DELETE /api/v1/cart
// Empties the entire cart (called after successful checkout).
// Declared AFTER /items/:itemId to avoid path ambiguity —
// Express will not confuse "DELETE /cart" with "DELETE /cart/items/123".
router.delete("/", clearCart);

export default router;
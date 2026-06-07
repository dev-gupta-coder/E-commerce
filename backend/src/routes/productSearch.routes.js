// ============================================================
//  src/routes/productSearch.routes.js
//
//  Responsibility:
//    Declare the search endpoint and mount it in the router.
//    Merged into product.routes.js in app.js — the search
//    route lives at GET /api/v1/products/search.
//
//  CRITICAL: This router must be mounted BEFORE "/:id" in the
//  parent router so Express does not interpret "search" as an
//  ObjectId parameter.
//
//  Route order matters:
//    router.use("/search", searchRouter)  ← must come first
//    router.get("/:id", getProductById)  ← otherwise "search"
//                                           is caught as id param
//
//  Mounted in product.routes.js as:
//    import searchRouter from "./productSearch.routes.js";
//    router.use("/search", searchRouter);
//    router.get("/:id", getProductById);
// ============================================================

import { Router }                 from "express";
import { optionalAuth }           from "../middleware/authorize.middleware.js";
import { searchProductsHandler }  from "../controllers/productSearch.controller.js";

const router = Router();

// ============================================================
//  GET /api/v1/products/search
//  Public — no auth required.
//  optionalAuth enriches req.user when a valid token is
//  present so the controller can personalise results
//  (e.g., mark products already in the user's wishlist).
// ============================================================
router.get("/", optionalAuth, searchProductsHandler);

export default router;
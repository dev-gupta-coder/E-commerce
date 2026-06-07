import { Router }          from "express";
import { verifyJWT }       from "../middleware/auth.middleware.js";
import { requireCustomer } from "../middleware/authorize.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
}                          from "../controllers/wishlist.controller.js";

const router = Router();

router.use(verifyJWT, requireCustomer);

router.get("/",              getWishlist);
router.post("/",             addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
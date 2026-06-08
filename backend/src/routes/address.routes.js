import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { requireCustomer } from "../middleware/authorize.middleware.js";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";

const router = Router();

router.use(verifyJWT, requireCustomer);

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);
router.patch("/:addressId/default", setDefaultAddress);

export default router;
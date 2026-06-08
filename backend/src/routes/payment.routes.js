import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { requireCustomer } from "../middleware/authorize.middleware.js";

import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.use(verifyJWT, requireCustomer);

router.post("/create-order", createRazorpayOrder);

router.post("/verify", verifyPayment);

export default router;
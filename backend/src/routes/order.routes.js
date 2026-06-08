// src/routes/order.routes.js

import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  requireCustomer,
  requireAdmin,
} from "../middleware/authorize.middleware.js";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

// Customer routes
router.post("/", verifyJWT, requireCustomer, createOrder);

router.get("/", verifyJWT, requireCustomer, getMyOrders);

router.get("/:orderId", verifyJWT, requireCustomer, getOrderById);

//by chatgpt
router.get(
  "/admin/all",
  verifyJWT,
  requireAdmin,
  getAllOrders
);

router.patch(
  "/:orderId/status",
  verifyJWT,
  requireAdmin,
  updateOrderStatus
);

export default router;
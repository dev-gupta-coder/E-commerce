import crypto from "crypto";

import { razorpay } from "../config/razorpay.js";

import { Order } from "../models/Order.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//create Razorpay order
export const createRazorpayOrder = asyncHandler(async (req, res) => {

  const { orderId } = req.body;
  if (!orderId) {
  throw new ApiError(400, "Order ID is required.");
}
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.razorpayOrderId) {
  throw new ApiError(
    400,
    "Razorpay order already created for this order."
  );
}
  const razorpayOrder = await razorpay.orders.create({ 
    amount: order.totalAmount * 100,
    currency: "INR",
    receipt: order._id.toString(),
  });

  order.razorpayOrderId = razorpayOrder.id;

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        razorpayOrder,
      },
      "Razorpay order created successfully."
    )
  );
});

//verify Razorpay payment
export const verifyPayment = asyncHandler(async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      razorpay_order_id + "|" + razorpay_payment_id
    )
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature.");
  }

  const order = await Order.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  order.paymentStatus = "paid";

  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        order,
      },
      "Payment verified successfully."
    )
  );
});
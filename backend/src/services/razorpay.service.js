// PATH: src/services/razorpay.service.js

import crypto           from "crypto";
import { razorpay }     from "../config/razorpay.config.js";
import { Order }        from "../models/Order.model.js";
import { ApiError }     from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse }  from "../utils/ApiResponse.js";

console.log("BODY =", req.body);
console.log("USER =", req.user);
console.log("ORDER_ID =", req.body.orderId);

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required.");
  }



  const order = await Order.findOne({ _id: orderId, user: req.user._id });





  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.paymentMethod !== "razorpay") {
    throw new ApiError(400, "This order is not set up for Razorpay payment.");
  }

  if (order.paymentStatus === "paid") {
    throw new ApiError(400, "This order has already been paid.");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount:   order.totalAmount,
    currency: process.env.RAZORPAY_CURRENCY ?? "INR",
    receipt:  order._id.toString(),
    notes:    { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        razorpayOrderId: razorpayOrder.id,
        amount:          razorpayOrder.amount,
        currency:        razorpayOrder.currency,
        key:             process.env.RAZORPAY_KEY_ID,
        orderId:         order._id,
      },
      "Razorpay order created successfully."
    )
  );
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    throw new ApiError(400, "All payment verification fields are required.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment verification failed. Invalid signature.");
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  order.paymentStatus     = "paid";
  order.orderStatus       = "confirmed";
  order.statusHistory.push({ status: "confirmed", note: "Payment verified." });

  await order.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, { order }, "Payment verified successfully.")
  );
});

import { verifyRazorpayPayment } from "../services/razorpay.service.js";
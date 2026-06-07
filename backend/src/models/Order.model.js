import mongoose          from "mongoose";
import { cartItemSchema } from "./Cart.model.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    items: {
      type:     [cartItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message:   "Order must contain at least one item.",
      },
    },

    totalAmount: {
      type:     Number,
      required: true,
      min:      [0, "Total amount cannot be negative."],
    },

    shippingAddress: {
      street:  { type: String, required: true, trim: true },
      city:    { type: String, required: true, trim: true },
      state:   { type: String, required: true, trim: true },
      pincode: { type: String, required: true, match: /^\d{6}$/ },
      country: { type: String, default: "India", trim: true },
    },

    paymentMethod: {
      type:     String,
      required: true,
      enum: {
        values:  ["razorpay", "cod"],
        message: "Payment method must be 'razorpay' or 'cod'.",
      },
    },

    paymentStatus: {
      type:    String,
      enum: {
        values:  ["pending", "paid", "failed", "refunded"],
        message: "Invalid payment status.",
      },
      default: "pending",
    },

    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    orderStatus: {
      type:    String,
      enum: {
        values:  ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
        message: "Invalid order status.",
      },
      default: "pending",
    },

    statusHistory: [
      {
        status:    { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String, default: "" },
      },
    ],

    deliveredAt:  { type: Date, default: null },
    cancelledAt:  { type: Date, default: null },
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });

export const Order = mongoose.models.Order
  ?? mongoose.model("Order", orderSchema);
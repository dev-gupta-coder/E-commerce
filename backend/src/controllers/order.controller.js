// PATH: src/controllers/order.controller.js

import mongoose         from "mongoose";
import { Order }        from "../models/Order.model.js";
import { Cart }         from "../models/Cart.model.js";
import { Product }      from "../models/Product.model.js";
import { ApiError }     from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    throw new ApiError(400, "Shipping address and payment method are required.");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path:   "items.product",
    select: "name price discountPrice stock isActive",
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty. Add items before placing an order.");
  }

  const orderItems = [];
  let   totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${product?.name ?? item.product}" is no longer available.`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for "${product.name}". Available: ${product.stock}.`);
    }

    orderItems.push({
      product:         product._id,
      quantity:        item.quantity,
      priceAtAddition: item.priceAtAddition,
    });
 
    totalAmount += item.priceAtAddition * item.quantity;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      if (!updated) {
        throw new ApiError(400, "Stock changed during checkout. Please review your cart.");
      }
    }

    const [order] = await Order.create(
      [
        {
          user:            req.user._id,
          items:           orderItems,
          totalAmount,
          shippingAddress,
          paymentMethod,
          paymentStatus:   paymentMethod === "cod" ? "pending" : "pending",
          orderStatus:     "pending",
          statusHistory:   [{ status: "pending", note: "Order placed." }],
        },
      ],
      { session }
    );

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { session }
    );

    await session.commitTransaction();

    return res
      .status(201)
      .json(new ApiResponse(201, { order }, "Order placed successfully."));

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip  = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (req.query.status) filter.orderStatus = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate({ path: "items.product", select: "name images" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          totalPages:  Math.ceil(total / limit),
          currentPage: page,
          limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      "Orders fetched successfully."
    )
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID.");
  }

  const order = await Order.findOne({
    _id:  orderId,
    user: req.user._id,
  }).populate({ path: "items.product", select: "name images price" });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, "Order fetched successfully."));
}); 

//by chatgpt
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name mobile")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      { orders },
      "All orders fetched successfully."
    )
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(orderStatus)) {
    throw new ApiError(400, "Invalid order status.");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  order.orderStatus = orderStatus;

  order.statusHistory.push({
    status: orderStatus,
    note: `Status changed to ${orderStatus}`,
  });

  if (orderStatus === "delivered") {
    order.deliveredAt = new Date();
  }

  if (orderStatus === "cancelled") {
    order.cancelledAt = new Date();
  }

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { order },
      "Order status updated successfully."
    )
  );
});
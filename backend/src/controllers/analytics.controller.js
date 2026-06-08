// PATH: src/controllers/analytics.controller.js

import { Order }        from "../models/Order.model.js";
import { Product }      from "../models/Product.model.js";
import { User }         from "../models/User.model.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const [
    revenueData,
    orderStats,
    productCount,
    customerCount,
    revenueByMonth,
    ordersByStatus,
    topProducts,
  ] = await Promise.all([

    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),

    Order.aggregate([
      {
        $group: {
          _id:   "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]),

    Product.countDocuments({ isActive: true }),

    User.countDocuments({ role: "customer", isActive: true }),

    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
      {
        $project: {
          _id:     0,
          year:    "$_id.year",
          month:   "$_id.month",
          revenue: 1,
          orders:  1,
        },
      },
    ]),

    Order.aggregate([
      {
        $group: {
          _id:   "$orderStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id:    0,
          status: "$_id",
          count:  1,
        },
      },
    ]),

    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id:      "$items.product",
          revenue:  { $sum: { $multiply: ["$items.priceAtAddition", "$items.quantity"] } },
          unitsSold:{ $sum: "$items.quantity" },
          orders:   { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         "products",
          localField:   "_id",
          foreignField: "_id",
          as:           "product",
          pipeline:     [{ $project: { name: 1, images: { $slice: ["$images", 1] } } }],
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmpty: false } },
      {
        $project: {
          _id:       0,
          product:   1,
          revenue:   1,
          unitsSold: 1,
          orders:    1,
        },
      },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue ?? 0;
  const paidOrders   = revenueData[0]?.count        ?? 0;
  const totalOrders  = orderStats.reduce((sum, s) => sum + s.count, 0);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalRevenue,
          totalOrders,
          paidOrders,
          totalProducts: productCount,
          totalCustomers: customerCount,
        },
        revenueByMonth,
        ordersByStatus,
        topProducts,
      },
      "Analytics fetched successfully."
    )
  );
});    
// PATH: src/models/review.model.js

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },

    rating: {
      type:     Number,
      required: true,
      min:      [1, "Rating must be at least 1."],
      max:      [5, "Rating cannot exceed 5."],
      validate: {
        validator: Number.isInteger,
        message:   "Rating must be a whole number.",
      },
    },

    comment: {
      type:      String,
      trim:      true,
      maxlength: [500, "Comment cannot exceed 500 characters."],
      default:   "",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

export const Review = mongoose.models.Review
  ?? mongoose.model("Review", reviewSchema);
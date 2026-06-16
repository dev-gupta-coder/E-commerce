import mongoose         from "mongoose";
import { Wishlist }     from "../models/wishlist.model.js";
import { Product }      from "../models/Product.model.js";
import { ApiError }     from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateWishlist = (query) =>
  query.populate({
    path:   "products",
    select: "name images price discountPrice stock isActive ratings",
    match:  { isActive: true },
  });

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await populateWishlist(
    Wishlist.findOne({ user: req.user._id })
  );

  if (!wishlist) {
    return res
      .status(200)
      .json(new ApiResponse(200, { products: [], count: 0 }, "Wishlist is empty."));
  }

  const products = wishlist.products.filter(Boolean);

  return res.status(200).json(
    new ApiResponse(
      200,
      { products, count: products.length },
      "Wishlist fetched successfully."
    )
  );
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId || !isValidObjectId(productId)) {
    throw new ApiError(400, "A valid product ID is required.");
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, "Product not found or unavailable.");
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  );

  const populated = await populateWishlist(Wishlist.findById(wishlist._id));
  const products  = populated.products.filter(Boolean);

  return res.status(200).json(
    new ApiResponse(
      200,
      { products, count: products.length },
      "Product added to wishlist."
    )
  );
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId || !isValidObjectId(productId)) {
    throw new ApiError(400, "A valid product ID is required.");
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: productId } },
    { new: true }
  );

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found.");
  }

  const populated = await populateWishlist(Wishlist.findById(wishlist._id));
  const products  = populated.products.filter(Boolean);

  return res.status(200).json(
    new ApiResponse(
      200,
      { products, count: products.length },
      "Product removed from wishlist."
    )
  );
});
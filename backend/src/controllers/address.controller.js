import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAddresses = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, [], "Addresses fetched."));
});

export const addAddress = asyncHandler(async (req, res) => {
  return res
    .status(201)
    .json(new ApiResponse(201, null, "Address added."));
});

export const updateAddress = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Address updated."));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Address deleted."));
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Default address updated."));
}); 
import axiosClient from "../../api/axiosClient";

export const getWishlistAPI = async () => {
  const { data } = await axiosClient.get("/wishlist");
  return data;
};

export const addWishlistAPI = async (payload) => {
  const { data } = await axiosClient.post("/wishlist", payload);
  return data;
};

export const removeWishlistAPI = async (productId) => {
  const { data } = await axiosClient.delete(`/wishlist/${productId}`);
  return data;
};
import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

export const wishlistService = {
  getWishlist: ()           => api.get(API_ENDPOINTS.WISHLIST.BASE),
  addItem:     (productId)  => api.post(API_ENDPOINTS.WISHLIST.BASE, { productId }),
  removeItem:  (productId)  => api.delete(API_ENDPOINTS.WISHLIST.ITEM(productId)),
};

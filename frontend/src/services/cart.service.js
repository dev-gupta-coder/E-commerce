// import api from "./axios.instance";
// import { API_ENDPOINTS } from "@/constants/api.constants";

// export const cartService = {
//   getCart:    ()             => api.get(API_ENDPOINTS.CART.BASE),
//   addItem:    (data)         => api.post(API_ENDPOINTS.CART.ITEMS, data),
//   updateItem: (id, data)     => api.patch(API_ENDPOINTS.CART.ITEM(id), data),
//   removeItem: (id)           => api.delete(API_ENDPOINTS.CART.ITEM(id)),
//   clearCart:  ()             => api.delete(API_ENDPOINTS.CART.BASE),
// };

// by codex chatgpt
import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

const unwrap = async (request) => {
  const res = await request;
  return res.data.data;
};

export const cartService = {
  getCart: () => unwrap(api.get(API_ENDPOINTS.CART.BASE)),
  addItem: (data) => unwrap(api.post(API_ENDPOINTS.CART.ITEMS, data)),
  updateItem: (id, data) => unwrap(api.patch(API_ENDPOINTS.CART.ITEM(id), data)),
  removeItem: (id) => unwrap(api.delete(API_ENDPOINTS.CART.ITEM(id))),
  clearCart: () => unwrap(api.delete(API_ENDPOINTS.CART.BASE)),
};
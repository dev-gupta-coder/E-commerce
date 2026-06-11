import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

export const orderService = {
  create:        (data)          => api.post(API_ENDPOINTS.ORDERS.BASE, data),
  getMyOrders:   (params)        => api.get(API_ENDPOINTS.ORDERS.MY_ORDERS, { params }),
  getById:       (id)            => api.get(API_ENDPOINTS.ORDERS.BY_ID(id)),
  updateStatus:  (id, data)      => api.patch(API_ENDPOINTS.ORDERS.BY_ID(id), data),
  getAll:        (params)        => api.get(API_ENDPOINTS.ORDERS.BASE, { params }),
};

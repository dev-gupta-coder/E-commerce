import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

export const paymentService = {
  createOrder:    (data) => api.post(API_ENDPOINTS.PAYMENT.CREATE, data),
  verifyPayment:  (data) => api.post(API_ENDPOINTS.PAYMENT.VERIFY, data),
};

import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

export const analyticsService = {
  getDashboard: () => api.get(API_ENDPOINTS.ANALYTICS.DASHBOARD),
};

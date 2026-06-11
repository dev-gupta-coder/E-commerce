// import api from "./axios.instance";
// import { API_ENDPOINTS } from "@/constants/api.constants";

// export const authService = {
//   register: (data)  => api.post(API_ENDPOINTS.AUTH.REGISTER, data),
//   login:    (data)  => api.post(API_ENDPOINTS.AUTH.LOGIN, data),
//   logout:   ()      => api.post(API_ENDPOINTS.AUTH.LOGOUT),
//   getMe:    ()      => api.get(API_ENDPOINTS.AUTH.ME),
//   refresh:  ()      => api.post(API_ENDPOINTS.AUTH.REFRESH),
// };

// by codex chatgpt
import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

const unwrap = async (request) => {
  const res = await request;
  return res.data.data;
};

export const authService = {
  register: (data) => unwrap(api.post(API_ENDPOINTS.AUTH.REGISTER, data)),
  login: (data) => unwrap(api.post(API_ENDPOINTS.AUTH.LOGIN, data)),
  getMe: () => unwrap(api.get(API_ENDPOINTS.AUTH.ME)),
  refresh: () => unwrap(api.post(API_ENDPOINTS.AUTH.REFRESH)),

  logout: async () => {
    const res = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return res.data;
  },
};
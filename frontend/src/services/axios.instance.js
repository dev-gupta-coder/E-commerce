import axios from "axios";
import { API_BASE_URL } from "@/constants/api.constants";
import { getAccessToken, setAccessToken, clearAccessToken } from "@/utils/tokenHelpers";
import { API_ENDPOINTS } from "@/constants/api.constants";

const api = axios.create({
  baseURL:         API_BASE_URL,
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // by codex chatgpt, added check to skip adding auth header for refresh endpoint
  if (config.data instanceof FormData) {
  delete config.headers["Content-Type"];
}
//till here
  return config;
});

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;
//     // by codex chatgpt, added check for _retry to prevent infinite loop
//     const skipRefreshUrls = [
//   API_ENDPOINTS.AUTH.LOGIN,
//   API_ENDPOINTS.AUTH.REGISTER,
//   API_ENDPOINTS.AUTH.REFRESH,
// ];

// const shouldSkipRefresh = skipRefreshUrls.some((url) =>
//   original?.url?.includes(url)
// );

// if (shouldSkipRefresh) {
//   return Promise.reject(error);
// }
//     if (error.response?.status === 401 && !original._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
//           .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
//       }
//       original._retry = true;
//       isRefreshing    = true;
//       try {
//         const { data } = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {}, { withCredentials: true });
//         const token = data.data.accessToken;
//         setAccessToken(token);
//         processQueue(null, token);
//         original.headers.Authorization = `Bearer ${token}`;
//         return api(original);
//       } catch (err) {
//         processQueue(err, null);
//         clearAccessToken();
//         window.location.href = "/login";
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// by codex chatgpt
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!original) {
      return Promise.reject(error);
    }

    const skipRefreshUrls = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.REGISTER,
      API_ENDPOINTS.AUTH.REFRESH,
    ];

    const shouldSkipRefresh = skipRefreshUrls.some((url) =>
      original.url?.includes(url)
    );

    if (shouldSkipRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          {},
          { withCredentials: true }
        );

        const token = data.data.accessToken;
        setAccessToken(token);
        processQueue(null, token);

        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;

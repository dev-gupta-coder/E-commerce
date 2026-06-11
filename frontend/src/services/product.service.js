// import api from "./axios.instance";
// import { API_ENDPOINTS } from "@/constants/api.constants";

// export const productService = {
//   getAll:   (params) => api.get(API_ENDPOINTS.PRODUCTS.BASE, { params }),
//   search:   (params) => api.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params }),
//   getById:  (id)     => api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id)),
//   create:   (data)   => api.post(API_ENDPOINTS.PRODUCTS.BASE, data),
//   update:   (id, data) => api.put(API_ENDPOINTS.PRODUCTS.BY_ID(id), data),
//   delete:   (id)     => api.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id)),
// };

// by codex chatgpt
import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

const unwrap = async (request) => {
  const res = await request;
  return res.data.data;
};

const toFormData = (data) => {
  if (data instanceof FormData) return data;

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (key === "images") {
      Array.from(value).forEach((file) => formData.append("images", file));
      return;
    }

    if (key === "removeImageIds" && Array.isArray(value)) {
      value.forEach((id) => formData.append("removeImageIds", id));
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

export const productService = {
  getAll: (params) => unwrap(api.get(API_ENDPOINTS.PRODUCTS.BASE, { params })),

  search: (params) =>
    unwrap(api.get(API_ENDPOINTS.PRODUCTS.BASE, { params })),

  getById: (id) =>
    unwrap(api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id))),

  create: (data) =>
    unwrap(api.post(API_ENDPOINTS.PRODUCTS.BASE, toFormData(data))),

  update: (id, data) =>
    unwrap(api.put(API_ENDPOINTS.PRODUCTS.BY_ID(id), toFormData(data))),

  delete: async (id) => {
    await api.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return id;
  },
};
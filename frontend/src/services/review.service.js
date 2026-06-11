// import api from "./axios.instance";
// import { API_ENDPOINTS } from "@/constants/api.constants";

// export const reviewService = {
//   getReviews: (productId)        => api.get(API_ENDPOINTS.REVIEWS.BASE(productId)),
//   addReview:  (productId, data)  => api.post(API_ENDPOINTS.REVIEWS.BASE(productId), data),
//   delete:     (productId, id)    => api.delete(API_ENDPOINTS.REVIEWS.BY_ID(productId, id)),
// };

// by codex chatgpt
import api from "./axios.instance";
import { API_ENDPOINTS } from "@/constants/api.constants";

const unwrap = async (request) => {
  const res = await request;
  return res.data.data;
};

export const reviewService = {
  addReview: (productId, data) =>
    unwrap(api.post(API_ENDPOINTS.REVIEWS.BASE(productId), data)),

  deleteReview: (productId, reviewId) =>
    unwrap(
      api.delete(API_ENDPOINTS.REVIEWS.BASE(productId), {
        data: reviewId ? { reviewId } : {},
      })
    ),
};
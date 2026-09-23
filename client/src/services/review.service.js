import api from "./api";

export const createReview = (data) => api.post("/reviews", data).then((r) => r.data);
export const listReviewsByProduct = (productId, params) =>
  api.get(`/reviews/product/${productId}`, { params }).then((r) => r.data);
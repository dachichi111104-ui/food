import api from "./api";

// Shop approval
export const listShopsForReview = (params) =>
  api.get("/admin/shops", { params }).then((r) => r.data);
export const approveShop = (id, status) =>
  api.patch(`/admin/shops/${id}/approve`, { status }).then((r) => r.data);

// Category
export const listCategories = () => api.get("/categories").then((r) => r.data);
export const createCategory = (data) => api.post("/categories", data).then((r) => r.data);
export const updateCategory = (id, data) =>
  api.patch(`/admin/categories/${id}`, data).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data);

// Reports
export const listReports = (params) => api.get("/reports", { params }).then((r) => r.data);
export const resolveReport = (id, resolution_note) =>
  api.patch(`/reports/${id}/resolve`, { resolution_note }).then((r) => r.data);

// Orders + refund
export const listAllOrders = (params) => api.get("/admin/orders", { params }).then((r) => r.data);
export const markRefunding = (shopOrderId) =>
  api.patch(`/admin/shop-orders/${shopOrderId}/refunding`).then((r) => r.data);
export const markRefunded = (shopOrderId, note) =>
  api.patch(`/admin/shop-orders/${shopOrderId}/refunded`, { note }).then((r) => r.data);
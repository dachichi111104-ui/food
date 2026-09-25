import api from "./api";

export const checkout = (payload) => api.post("/orders/checkout", payload).then((r) => r.data);
export const listMyOrders = (params) => api.get("/orders", { params }).then((r) => r.data);
export const getOrderDetail = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`).then((r) => r.data);
export const completeShopOrder = (shopOrderId) =>
  api.patch(`/orders/shop-orders/${shopOrderId}/complete`).then((r) => r.data);
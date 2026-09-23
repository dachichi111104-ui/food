import api from "./api";

export const listMyShopOrders = (params) =>
  api.get("/shop-orders", { params }).then((r) => r.data);
export const startPreparing = (id) =>
  api.patch(`/shop-orders/${id}/prepare`).then((r) => r.data);
export const handToShipper = (id) =>
  api.patch(`/shop-orders/${id}/hand-to-shipper`).then((r) => r.data);
export const cancelShopOrder = (id, reason) =>
  api.patch(`/shop-orders/${id}/cancel`, { reason }).then((r) => r.data);
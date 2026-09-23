import api from "./api";

export const listAvailableShipments = (params) =>
  api.get("/shipments/available", { params }).then((r) => r.data);
export const listMyShipments = (params) =>
  api.get("/shipments/assigned", { params }).then((r) => r.data);
export const claimShipment = (id) => api.patch(`/shipments/${id}/claim`).then((r) => r.data);
export const confirmPickup = (id) => api.patch(`/shipments/${id}/pickup`).then((r) => r.data);
export const markDelivered = (id) => api.patch(`/shipments/${id}/deliver`).then((r) => r.data);
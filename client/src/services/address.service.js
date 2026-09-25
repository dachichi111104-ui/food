import api from "./api";

export const listAddresses = () => api.get("/addresses").then((r) => r.data);
export const createAddress = (data) => api.post("/addresses", data).then((r) => r.data);
export const updateAddress = (id, data) => api.patch(`/addresses/${id}`, data).then((r) => r.data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`).then((r) => r.data);
export const setDefaultAddress = (id) => api.patch(`/addresses/${id}/default`).then((r) => r.data);

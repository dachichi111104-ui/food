import api from "./api";

export const listPublicVouchers = (shopId) =>
  api.get("/vouchers/public", { params: { shop_id: shopId } }).then((r) => r.data);
export const applyVoucher = (data) => api.post("/vouchers/apply", data).then((r) => r.data);
export const listAllVouchers = () => api.get("/vouchers").then((r) => r.data);
export const createVoucher = (data) => api.post("/vouchers", data).then((r) => r.data);
export const deleteVoucher = (id) => api.delete(`/vouchers/${id}`).then((r) => r.data);

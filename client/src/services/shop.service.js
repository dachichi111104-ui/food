import api from "./api";

export const listShops = (params) => api.get("/shops", { params }).then((r) => r.data);
export const getShop = (id) => api.get(`/shops/${id}`).then((r) => r.data);

// Seller-side
export const getMyShop = () => api.get("/shops/me/own").then((r) => r.data);
export const createShop = (data) => api.post("/shops", data).then((r) => r.data);
export const updateMyShop = (data) => api.patch("/shops/me/own", data).then((r) => r.data);

// Public categories — dùng cho filter trang chủ
export const listPublicCategories = () => api.get("/categories").then((r) => r.data);
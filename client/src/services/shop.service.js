import api from "./api";

export const listShops = (params) => api.get("/shops", { params }).then((r) => r.data);
export const listPublicShops = listShops;
export const getShop = (id) => api.get(`/shops/${id}`).then((r) => r.data);

// Seller-side
export const getMyShop = (shopId) =>
  api.get("/shops/me/own", { params: shopId ? { shop_id: shopId } : {} }).then((r) => r.data);
export const getMyShops = () => api.get("/shops/me/list").then((r) => r.data);
export const createShop = (data) => api.post("/shops", data).then((r) => r.data);
export const updateMyShop = (data, shopId) =>
  api.patch("/shops/me/own", data, { params: shopId ? { shop_id: shopId } : {} }).then((r) => r.data);

// Public categories — dùng cho filter trang chủ
export const listPublicCategories = () => api.get("/categories").then((r) => r.data);
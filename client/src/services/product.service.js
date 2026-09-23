import api from "./api";

export const listProducts = (params) => api.get("/products", { params }).then((r) => r.data);
export const getProductDetail = (id) => api.get(`/products/${id}`).then((r) => r.data);

// Seller-side
export const getMyShopProducts = () => api.get("/products/me/own").then((r) => r.data);
export const createProduct = (data) => api.post("/products", data).then((r) => r.data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);
import api from "./api";

export const getCart = () => api.get("/cart").then((r) => r.data);
export const addToCart = (variant_id, quantity) =>
  api.post("/cart/items", { variant_id, quantity }).then((r) => r.data);
export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data);
export const removeCartItem = (itemId) =>
  api.delete(`/cart/items/${itemId}`).then((r) => r.data);
export const getCheckoutPreview = (shopId = null) =>
  api.get("/cart/checkout-preview", { params: shopId ? { shop_id: shopId } : {} }).then((r) => r.data);
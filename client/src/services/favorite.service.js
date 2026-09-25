import api from "./api";

export const listFavorites = () => api.get("/favorites").then((r) => r.data);
export const toggleFavorite = (shopId) => api.post(`/favorites/toggle/${shopId}`).then((r) => r.data);
export const checkIsFavorite = (shopId) => api.get(`/favorites/check/${shopId}`).then((r) => r.data);

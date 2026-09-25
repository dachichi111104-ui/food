import api from "./api";

export const listPublicBanners = () => api.get("/banners/public").then((r) => r.data);
export const listAllBanners = () => api.get("/banners").then((r) => r.data);
export const createBanner = (formData) => api.post("/banners", formData).then((r) => r.data);
export const deleteBanner = (id) => api.delete(`/banners/${id}`).then((r) => r.data);

import api from "./api";

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email }).then((r) => r.data);

export const resetPassword = (token, newPassword) =>
  api.post("/auth/reset-password", { token, newPassword }).then((r) => r.data);

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email/${token}`).then((r) => r.data);

export const loginWithGoogle = (id_token) =>
  api.post("/auth/google", { id_token }).then((r) => r.data);

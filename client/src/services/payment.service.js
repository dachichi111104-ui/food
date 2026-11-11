import api from "./api";

export const createPayment = (order_id) =>
  api.post("/payments/create", { order_id }).then((r) => r.data);
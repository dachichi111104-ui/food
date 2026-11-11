import api from "./api";

export const createPayment = (order_id, bank_code) =>
  api.post("/payments/create", { order_id, bank_code }).then((r) => r.data);
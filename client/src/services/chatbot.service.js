import api from "./api";

export const sendChatMessage = (message) => api.post("/chatbot/message", { message }).then((r) => r.data);

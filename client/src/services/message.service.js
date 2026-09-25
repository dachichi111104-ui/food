import api from "./api";

export const getMessages = async (params) => {
  const queryParams = typeof params === "string" ? { target_role: params } : params;
  const res = await api.get("/messages", { params: queryParams });
  return res.data;
};

export const sendMessage = async (data, textArg) => {
  const payload = typeof data === "string" ? { target_role: data, text: textArg } : data;
  const res = await api.post("/messages", payload);
  return res.data;
};

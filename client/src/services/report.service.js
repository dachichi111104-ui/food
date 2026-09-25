import api from "./api";

export const createReport = async (data) => {
  const res = await api.post("/reports", data);
  return res.data;
};

export const listReports = async (params) => {
  const res = await api.get("/reports", { params });
  return res.data;
};

export const resolveReport = async (reportId, resolution_note) => {
  const res = await api.patch(`/reports/${reportId}/resolve`, { resolution_note });
  return res.data;
};

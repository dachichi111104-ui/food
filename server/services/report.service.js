const { Report } = require("../models");
const ApiError = require("../utils/ApiError");

const createReport = async (userId, { shop_order_id, reason, description }) => {
  return Report.create({ user_id: userId, shop_order_id, reason, description });
};

const listReports = async ({ status, page = 1, limit = 10 }) => {
  const filter = {};
  if (status) filter.status = status;

  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Report.countDocuments(filter);
  return { reports, total, page: Number(page), limit: Number(limit) };
};

const resolveReport = async (reportId, resolution_note) => {
  const report = await Report.findById(reportId);
  if (!report) throw new ApiError(404, "Report not found");

  report.status = "RESOLVED";
  report.resolution_note = resolution_note;
  await report.save();
  return report;
};

module.exports = { createReport, listReports, resolveReport };
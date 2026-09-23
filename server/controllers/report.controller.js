const reportService = require("../services/report.service");

const createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.user.id, req.body);
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
};

const listReports = async (req, res, next) => {
  try {
    const result = await reportService.listReports(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const report = await reportService.resolveReport(req.params.id, req.body.resolution_note);
    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, listReports, resolveReport };
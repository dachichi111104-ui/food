const adminService = require("../services/admin.service");

const listShopsForReview = async (req, res, next) => {
  try {
    const result = await adminService.listShopsForReview(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const approveShop = async (req, res, next) => {
  try {
    const shop = await adminService.approveShop(req.params.id, req.body.status);
    res.status(200).json({ shop });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await adminService.updateCategory(req.params.id, req.body);
    res.status(200).json({ category });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await adminService.deleteCategory(req.params.id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};

const listAllOrders = async (req, res, next) => {
  try {
    const result = await adminService.listAllOrders(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const markRefunding = async (req, res, next) => {
  try {
    const shopOrder = await adminService.markRefunding(req.params.id);
    res.status(200).json({ shopOrder });
  } catch (err) {
    next(err);
  }
};

const markRefunded = async (req, res, next) => {
  try {
    const shopOrder = await adminService.markRefunded(req.params.id, req.body.note);
    res.status(200).json({ shopOrder });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listShopsForReview,
  approveShop,
  updateCategory,
  deleteCategory,
  listAllOrders,
  markRefunding,
  markRefunded,
  getStats,
};
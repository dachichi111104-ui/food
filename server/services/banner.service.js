const { Banner } = require("../models");
const ApiError = require("../utils/ApiError");

const listPublicBanners = async () => {
  const now = new Date();
  return await Banner.find({
    is_active: true,
    $or: [{ start_date: { $lte: now } }, { start_date: null }],
    $or: [{ end_date: { $gte: now } }, { end_date: null }],
  }).sort({ priority: -1, createdAt: -1 });
};

const listAllBanners = async () => {
  return await Banner.find().sort({ priority: -1, createdAt: -1 });
};

const createBanner = async (data) => {
  return await Banner.create(data);
};

const updateBanner = async (id, data) => {
  const banner = await Banner.findByIdAndUpdate(id, data, { new: true });
  if (!banner) throw new ApiError(404, "Banner không tồn tại");
  return banner;
};

const deleteBanner = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw new ApiError(404, "Banner không tồn tại");
  return { message: "Xoá banner thành công" };
};

module.exports = {
  listPublicBanners,
  listAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};

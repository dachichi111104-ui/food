const bannerService = require("../services/banner.service");

const listPublicBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.listPublicBanners();
    res.status(200).json({ banners });
  } catch (err) {
    next(err);
  }
};

const listAllBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.listAllBanners();
    res.status(200).json({ banners });
  } catch (err) {
    next(err);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image_url = req.file.path;
    const banner = await bannerService.createBanner(data);
    res.status(201).json({ banner });
  } catch (err) {
    next(err);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image_url = req.file.path;
    const banner = await bannerService.updateBanner(req.params.id, data);
    res.status(200).json({ banner });
  } catch (err) {
    next(err);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const result = await bannerService.deleteBanner(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPublicBanners,
  listAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};

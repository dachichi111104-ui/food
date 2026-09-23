const shopService = require("../services/shop.service");

const createShop = async (req, res, next) => {
  try {
    const data = { ...req.body };
    // upload.fields -> req.files.logo[0] / req.files.cover[0]
    if (req.files?.logo?.[0]) {
      data.logo_url = req.files.logo[0].path; // Cloudinary trả url tại req.file.path
    }
    if (req.files?.cover?.[0]) {
      data.cover_url = req.files.cover[0].path;
    }
    const shop = await shopService.createShop(req.user.id, data);
    res.status(201).json({ shop });
  } catch (err) {
    next(err);
  }
};

const getMyShop = async (req, res, next) => {
  try {
    const shop = await shopService.getMyShop(req.user.id);
    res.status(200).json({ shop });
  } catch (err) {
    next(err);
  }
};

const updateMyShop = async (req, res, next) => {
  try {
    const data = { ...req.body };
    // upload.fields -> req.files.logo[0] / req.files.cover[0]
    if (req.files?.logo?.[0]) {
      data.logo_url = req.files.logo[0].path;
    }
    if (req.files?.cover?.[0]) {
      data.cover_url = req.files.cover[0].path;
    }
    const shop = await shopService.updateMyShop(req.user.id, data);
    res.status(200).json({ shop });
  } catch (err) {
    next(err);
  }
};

const getPublicShop = async (req, res, next) => {
  try {
    const shop = await shopService.getPublicShop(req.params.id);
    res.status(200).json({ shop });
  } catch (err) {
    next(err);
  }
};

const listPublicShops = async (req, res, next) => {
  try {
    const result = await shopService.listPublicShops(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createShop, getMyShop, updateMyShop, getPublicShop, listPublicShops };
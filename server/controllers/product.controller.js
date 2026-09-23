const productService = require("../services/product.service");

const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image_url = req.file.path;
    }
    const result = await productService.createProduct(req.shop._id, data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image_url = req.file.path;
    }
    const product = await productService.updateProduct(req.shop._id, req.params.id, data);
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.shop._id, req.params.id);
    res.status(200).json({ message: "Product deactivated" });
  } catch (err) {
    next(err);
  }
};

const getMyShopProducts = async (req, res, next) => {
  try {
    const products = await productService.getMyShopProducts(req.shop._id);
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
};

const listPublicProducts = async (req, res, next) => {
  try {
    const result = await productService.listPublicProducts(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getPublicProductDetail = async (req, res, next) => {
  try {
    const result = await productService.getPublicProductDetail(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getMyShopProducts,
  listPublicProducts,
  getPublicProductDetail,
};
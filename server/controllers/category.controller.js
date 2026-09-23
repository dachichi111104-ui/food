const categoryService = require("../services/category.service");

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

const listCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories();
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCategory, listCategories };
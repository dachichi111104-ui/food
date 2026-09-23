const { Category } = require("../models");

const createCategory = async (data) => {
  return Category.create(data);
};

const listCategories = async () => {
  return Category.find().sort({ name: 1 });
};

module.exports = { createCategory, listCategories };
const cartService = require("../services/cart.service");

const getCart = async (req, res, next) => {
  try {
    const result = await cartService.getCartDetail(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const item = await cartService.addItem(req.user.id, req.body);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await cartService.updateItem(req.user.id, req.params.id, req.body.quantity);
    res.status(200).json({ item });
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    await cartService.removeItem(req.user.id, req.params.id);
    res.status(200).json({ message: "Item removed" });
  } catch (err) {
    next(err);
  }
};

// Preview: xem trước Order sẽ được tách thành các ShopOrder như thế nào
const previewCheckout = async (req, res, next) => {
  try {
    const result = await cartService.getCartGroupedByShop(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, previewCheckout };
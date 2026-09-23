const orderService = require("../services/order.service");

const checkout = async (req, res, next) => {
  try {
    const result = await orderService.checkout(req.user.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const listMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.listMyOrders(req.user.id, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const result = await orderService.getOrderDetail(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const result = await orderService.cancelOrder(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const completeShopOrder = async (req, res, next) => {
  try {
    const shopOrder = await orderService.completeShopOrder(req.user.id, req.params.shopOrderId);
    res.status(200).json({ shopOrder });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkout, listMyOrders, getOrderDetail, cancelOrder, completeShopOrder };

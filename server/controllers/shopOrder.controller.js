const shopOrderService = require("../services/shopOrder.service");

const listMyShopOrders = async (req, res, next) => {
  try {
    const result = await shopOrderService.listMyShopOrders(req.user.id, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const confirmOrder = async (req, res, next) => {
  try {
    const shopOrder = await shopOrderService.confirmOrder(req.user.id, req.params.id);
    res.status(200).json({ shopOrder });
  } catch (err) {
    next(err);
  }
};

const startPreparing = async (req, res, next) => {
  try {
    const shopOrder = await shopOrderService.startPreparing(req.user.id, req.params.id);
    res.status(200).json({ shopOrder });
  } catch (err) {
    next(err);
  }
};

const handToShipper = async (req, res, next) => {
  try {
    const shopOrder = await shopOrderService.handToShipper(req.user.id, req.params.id);
    res.status(200).json({ shopOrder });
  } catch (err) {
    next(err);
  }
};

const cancelByShop = async (req, res, next) => {
  try {
    const shopOrder = await shopOrderService.cancelByShop(
      req.user.id,
      req.params.id,
      req.body.reason
    );
    res.status(200).json({ shopOrder });
  } catch (err) {
    next(err);
  }
};

module.exports = { listMyShopOrders, confirmOrder, startPreparing, handToShipper, cancelByShop };
const shipmentService = require("../services/shipment.service");

const listAvailable = async (req, res, next) => {
  try {
    const result = await shipmentService.listAvailableShipments(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const listMine = async (req, res, next) => {
  try {
    const result = await shipmentService.listMyShipments(req.user.id, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const claim = async (req, res, next) => {
  try {
    const shipment = await shipmentService.claimShipment(req.user.id, req.params.id);
    res.status(200).json({ shipment });
  } catch (err) {
    next(err);
  }
};

const confirmPickup = async (req, res, next) => {
  try {
    const shipment = await shipmentService.confirmPickup(req.user.id, req.params.id);
    res.status(200).json({ shipment });
  } catch (err) {
    next(err);
  }
};

const markDelivered = async (req, res, next) => {
  try {
    const shipment = await shipmentService.markDelivered(req.user.id, req.params.id);
    res.status(200).json({ shipment });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAvailable, listMine, claim, confirmPickup, markDelivered };
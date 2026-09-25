const addressService = require("../services/address.service");

const listAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.listAddresses(req.user.id);
    res.status(200).json({ addresses });
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({ address });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const result = await addressService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(req.user.id, req.params.id);
    res.status(200).json({ address });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

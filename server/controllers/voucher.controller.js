const voucherService = require("../services/voucher.service");

const listPublicVouchers = async (req, res, next) => {
  try {
    const vouchers = await voucherService.listPublicVouchers(req.query.shop_id);
    res.status(200).json({ vouchers });
  } catch (err) {
    next(err);
  }
};

const applyVoucher = async (req, res, next) => {
  try {
    const result = await voucherService.applyVoucher(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const listAllVouchers = async (req, res, next) => {
  try {
    const vouchers = await voucherService.listAllVouchers();
    res.status(200).json({ vouchers });
  } catch (err) {
    next(err);
  }
};

const createVoucher = async (req, res, next) => {
  try {
    const voucher = await voucherService.createVoucher(req.body);
    res.status(201).json({ voucher });
  } catch (err) {
    next(err);
  }
};

const deleteVoucher = async (req, res, next) => {
  try {
    const result = await voucherService.deleteVoucher(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPublicVouchers,
  applyVoucher,
  listAllVouchers,
  createVoucher,
  deleteVoucher,
};

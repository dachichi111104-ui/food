const { Voucher } = require("../models");
const ApiError = require("../utils/ApiError");

const listPublicVouchers = async (shopId) => {
  const now = new Date();
  const filter = {
    is_active: true,
    valid_from: { $lte: now },
    valid_to: { $gte: now },
  };

  if (shopId) {
    filter.$or = [{ shop_id: null }, { shop_id: shopId }];
  } else {
    filter.shop_id = null;
  }

  return await Voucher.find(filter).sort({ discount_value: -1 });
};

const applyVoucher = async ({ code, order_subtotal, shop_id }) => {
  if (!code) throw new ApiError(400, "Vui lòng nhập mã ưu đãi");
  const voucher = await Voucher.findOne({ code: code.trim().toUpperCase(), is_active: true });
  if (!voucher) throw new ApiError(404, "Mã ưu đãi không tồn tại hoặc đã hết hạn");

  const now = new Date();
  if (voucher.valid_from && now < voucher.valid_from) {
    throw new ApiError(400, "Mã ưu đãi chưa đến thời gian sử dụng");
  }
  if (voucher.valid_to && now > voucher.valid_to) {
    throw new ApiError(400, "Mã ưu đãi đã hết hạn sử dụng");
  }
  if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
    throw new ApiError(400, "Mã ưu đãi đã hết lượt sử dụng");
  }
  if (voucher.shop_id && shop_id && voucher.shop_id.toString() !== shop_id.toString()) {
    throw new ApiError(400, "Mã ưu đãi không áp dụng cho quán ăn này");
  }
  if (voucher.min_order_amount && order_subtotal < voucher.min_order_amount) {
    throw new ApiError(
      400,
      `Đơn hàng tối thiểu ${voucher.min_order_amount.toLocaleString()}đ để dùng mã này`
    );
  }

  let discountAmount = 0;
  if (voucher.discount_type === "PERCENT") {
    discountAmount = Math.round((order_subtotal * voucher.discount_value) / 100);
    if (voucher.max_discount_amount && discountAmount > voucher.max_discount_amount) {
      discountAmount = voucher.max_discount_amount;
    }
  } else {
    discountAmount = voucher.discount_value;
  }

  // Chặn discount lớn hơn subtotal
  if (discountAmount > order_subtotal) {
    discountAmount = order_subtotal;
  }

  return {
    voucher_id: voucher._id,
    code: voucher.code,
    discount_amount: discountAmount,
    discount_type: voucher.discount_type,
    discount_value: voucher.discount_value,
  };
};

const createVoucher = async (data) => {
  const existing = await Voucher.findOne({ code: data.code.trim().toUpperCase() });
  if (existing) throw new ApiError(409, "Mã voucher đã tồn tại");
  return await Voucher.create({
    ...data,
    code: data.code.trim().toUpperCase(),
  });
};

const listAllVouchers = async () => {
  return await Voucher.find().sort({ createdAt: -1 });
};

const deleteVoucher = async (id) => {
  const voucher = await Voucher.findByIdAndDelete(id);
  if (!voucher) throw new ApiError(404, "Voucher không tồn tại");
  return { message: "Xoá voucher thành công" };
};

module.exports = {
  listPublicVouchers,
  applyVoucher,
  createVoucher,
  listAllVouchers,
  deleteVoucher,
};

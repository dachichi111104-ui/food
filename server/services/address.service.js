const { Address } = require("../models");
const ApiError = require("../utils/ApiError");

const listAddresses = async (userId) => {
  return await Address.find({ user_id: userId }).sort({ is_default: -1, createdAt: -1 });
};

const createAddress = async (userId, data) => {
  if (data.is_default) {
    await Address.updateMany({ user_id: userId }, { is_default: false });
  }

  // Nếu là địa chỉ đầu tiên thì mặc định cho làm default
  const existingCount = await Address.countDocuments({ user_id: userId });
  const isDefault = existingCount === 0 ? true : Boolean(data.is_default);

  const fullAddress = [data.house_number, data.street, data.ward, data.district, data.city]
    .filter(Boolean)
    .join(", ");

  const address = await Address.create({
    user_id: userId,
    label: data.label || "Nhà",
    recipient_name: data.recipient_name,
    recipient_phone: data.recipient_phone,
    city: data.city,
    district: data.district,
    ward: data.ward,
    street: data.street || "",
    house_number: data.house_number || "",
    full_address: data.full_address || fullAddress,
    latitude: data.latitude,
    longitude: data.longitude,
    delivery_note: data.delivery_note || "",
    is_default: isDefault,
  });

  return address;
};

const updateAddress = async (userId, addressId, data) => {
  const address = await Address.findOne({ _id: addressId, user_id: userId });
  if (!address) {
    throw new ApiError(404, "Địa chỉ không tồn tại");
  }

  if (data.is_default) {
    await Address.updateMany({ user_id: userId }, { is_default: false });
  }

  Object.assign(address, data);

  address.full_address = [address.house_number, address.street, address.ward, address.district, address.city]
    .filter(Boolean)
    .join(", ");

  await address.save();
  return address;
};

const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOneAndDelete({ _id: addressId, user_id: userId });
  if (!address) {
    throw new ApiError(404, "Địa chỉ không tồn tại");
  }

  // Nếu lỡ xoá địa chỉ mặc định, tự động set địa chỉ còn lại gần nhất làm mặc định
  if (address.is_default) {
    const nextDefault = await Address.findOne({ user_id: userId }).sort({ createdAt: -1 });
    if (nextDefault) {
      nextDefault.is_default = true;
      await nextDefault.save();
    }
  }

  return { message: "Xoá địa chỉ thành công" };
};

const setDefaultAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, user_id: userId });
  if (!address) {
    throw new ApiError(404, "Địa chỉ không tồn tại");
  }

  await Address.updateMany({ user_id: userId }, { is_default: false });
  address.is_default = true;
  await address.save();

  return address;
};

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

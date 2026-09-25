const bcrypt = require("bcryptjs");
const { User, Cart } = require("../models");
const { signToken } = require("../utils/jwt.util");
const ApiError = require("../utils/ApiError");

const register = async ({ name, email, password, role, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email này đã được sử dụng");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password_hash,
    role: role || "buyer",
    phone,
  });

  if (user.role === "buyer") {
    await Cart.create({ user_id: user._id });
  }

  const token = signToken({ id: user._id, role: user.role });

  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  if (!user.is_active) {
    throw new ApiError(403, "Tài khoản của bạn đã bị khóa");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  const token = signToken({ id: user._id, role: user.role });

  return { user: sanitizeUser(user), token };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return sanitizeUser(user);
};

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Chặn sửa các field nhạy cảm
  if (data.name !== undefined) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.address !== undefined) user.address = data.address;
  if (data.city !== undefined) user.city = data.city;
  if (data.district !== undefined) user.district = data.district;
  if (data.ward !== undefined) user.ward = data.ward;
  if (data.street !== undefined) user.street = data.street;
  if (data.house_number !== undefined) user.house_number = data.house_number;
  if (data.avatar_url !== undefined) user.avatar_url = data.avatar_url;

  await user.save();
  return sanitizeUser(user);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new ApiError(400, "Mật khẩu hiện tại không đúng");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, "Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Đổi mật khẩu thành công" };
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address || "",
  city: user.city || "",
  district: user.district || "",
  ward: user.ward || "",
  street: user.street || "",
  house_number: user.house_number || "",
  avatar_url: user.avatar_url || "",
  is_active: user.is_active,
  createdAt: user.createdAt,
});

module.exports = { register, login, getMe, updateProfile, changePassword };
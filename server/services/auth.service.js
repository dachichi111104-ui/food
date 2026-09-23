const bcrypt = require("bcryptjs");
const { User, Cart } = require("../models");
const { signToken } = require("../utils/jwt.util");
const ApiError = require("../utils/ApiError");

const register = async ({ name, email, password, role, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email already in use");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password_hash,
    role: role || "buyer",
    phone,
  });

  // Buyer thì tự động có Cart rỗng để dùng ngay
  if (user.role === "buyer") {
    await Cart.create({ user_id: user._id });
  }

  const token = signToken({ id: user._id, role: user.role });

  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.is_active) {
    throw new ApiError(403, "Account is disabled");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
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

// Không bao giờ trả password_hash về client
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  is_active: user.is_active,
  createdAt: user.createdAt,
});

module.exports = { register, login, getMe };
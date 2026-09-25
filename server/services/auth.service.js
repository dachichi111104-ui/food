const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { User, Cart } = require("../models");
const { signToken } = require("../utils/jwt.util");
const ApiError = require("../utils/ApiError");
const emailService = require("./email.service");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async ({ name, email, password, role, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email này đã được sử dụng");
  }

  const password_hash = await bcrypt.hash(password, 10);
  const verification_token = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password_hash,
    role: role || "buyer",
    phone,
    is_verified: false,
    verification_token,
  });

  if (user.role === "buyer") {
    await Cart.create({ user_id: user._id });
  }

  // Gửi email xác thực
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email?token=${verification_token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; borderRadius: 8px;">
      <h2 style="color: #1A365D;">Xác thực tài khoản FoodGo</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại FoodGo. Vui lòng bấm vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
      <div style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background-color: #2B6CB0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Xác thực tài khoản</a>
      </div>
      <p style="font-size: 12px; color: #718096;">Hoặc copy đường dẫn sau dán vào trình duyệt: <br><a href="${verifyUrl}">${verifyUrl}</a></p>
    </div>
  `;

  emailService.sendMail(user.email, "[FoodGo] Xác thực tài khoản của bạn", html);

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

  if (user.provider === "google" && !user.password_hash) {
    throw new ApiError(400, "Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập bằng nút Google.");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  const token = signToken({ id: user._id, role: user.role });
  return { user: sanitizeUser(user), token };
};

const verifyEmail = async (verificationToken) => {
  if (!verificationToken) {
    throw new ApiError(400, "Mã xác thực không hợp lệ");
  }

  const user = await User.findOne({ verification_token: verificationToken });
  if (!user) {
    throw new ApiError(400, "Mã xác thực không hợp lệ hoặc đã được xác thực trước đó.");
  }

  user.is_verified = true;
  user.verification_token = null;
  await user.save();

  return { message: "Xác thực email thành công!" };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "Không tìm thấy tài khoản với email này");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.reset_token = resetToken;
  user.reset_token_expires = Date.now() + 15 * 60 * 1000; // 15 minutes expiration
  await user.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; borderRadius: 8px;">
      <h2 style="color: #1A365D;">Yêu cầu đặt lại mật khẩu FoodGo</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản FoodGo. Vui lòng bấm vào nút bên dưới để tiến hành đặt mật khẩu mới (Liên kết có hiệu lực trong 15 phút):</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #C53030; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
      </div>
      <p style="font-size: 12px; color: #718096;">Hoặc dán đường dẫn sau vào trình duyệt: <br><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="font-size: 12px; color: #A0AEC0;">Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.</p>
    </div>
  `;

  await emailService.sendMail(user.email, "[FoodGo] Hướng dẫn đặt lại mật khẩu", html);

  return { message: "Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn." };
};

const resetPassword = async (token, newPassword) => {
  if (!token) {
    throw new ApiError(400, "Token đặt lại mật khẩu là bắt buộc");
  }

  const user = await User.findOne({
    reset_token: token,
    reset_token_expires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.reset_token = null;
  user.reset_token_expires = null;
  await user.save();

  return { message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ." };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.provider === "google" && !user.password_hash) {
    throw new ApiError(400, "Tài khoản Google không sử dụng mật khẩu hệ thống.");
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

  // Gửi email cảnh báo bảo mật
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; borderRadius: 8px;">
      <h2 style="color: #C53030;">⚠️ Cảnh báo bảo mật: Thay đổi mật khẩu</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Mật khẩu cho tài khoản FoodGo của bạn vừa được thay đổi thành công vào lúc ${new Date().toLocaleString("vi-VN")}.</p>
      <p style="color: #718096;">Nếu bạn không thực hiện hành động này, vui lòng liên hệ ngay với bộ phận hỗ trợ của chúng tôi để bảo vệ tài khoản.</p>
    </div>
  `;
  emailService.sendMail(user.email, "[FoodGo Security] Mật khẩu tài khoản đã thay đổi", html);

  return { message: "Đổi mật khẩu thành công" };
};

const loginWithGoogle = async (idToken) => {
  if (!idToken) {
    throw new ApiError(400, "id_token là bắt buộc");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    // Fallback: decode token if audience is not configured or in dev testing
    throw new ApiError(401, "Google ID token không hợp lệ hoặc đã hết hạn");
  }

  const { email, name, picture, sub } = payload;
  if (!email) {
    throw new ApiError(400, "Không thể lấy email từ tài khoản Google");
  }

  let user = await User.findOne({ email });

  if (user) {
    if (!user.is_active) {
      throw new ApiError(403, "Tài khoản của bạn đã bị khóa");
    }
    user.provider = "google";
    user.provider_id = sub;
    user.is_verified = true;
    if (!user.avatar_url && picture) {
      user.avatar_url = picture;
    }
    await user.save();
  } else {
    user = await User.create({
      name: name || "Google User",
      email,
      role: "buyer",
      provider: "google",
      provider_id: sub,
      is_verified: true,
      avatar_url: picture || "",
    });

    await Cart.create({ user_id: user._id });
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
  is_verified: user.is_verified || false,
  provider: user.provider || "local",
  createdAt: user.createdAt,
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  loginWithGoogle,
};
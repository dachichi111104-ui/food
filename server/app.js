const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const healthRoute = require("./routes/health.route");
const authRoute = require("./routes/auth.route");
const shopRoute = require("./routes/shop.route");
const categoryRoute = require("./routes/category.route");
const productRoute = require("./routes/product.route");
const errorHandler = require("./middlewares/errorHandler.middleware");
const cartRoute = require("./routes/cart.route");
const orderRoute = require("./routes/order.route");
const paymentRoute = require("./routes/payment.route");
const shopOrderRoute = require("./routes/shopOrder.route");
const shipmentRoute = require("./routes/shipment.route");
const adminRoute = require("./routes/admin.route");
const reportRoute = require("./routes/report.route");
const reviewRoute = require("./routes/review.route");
const addressRoute = require("./routes/address.route");
const favoriteRoute = require("./routes/favorite.route");
const bannerRoute = require("./routes/banner.route");
const voucherRoute = require("./routes/voucher.route");
const chatbotRoute = require("./routes/chatbot.route");
const messageRoute = require("./routes/message.route");

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiter for sensitive Auth routes (5 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// Routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/shops", shopRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/shop-orders", shopOrderRoute);
app.use("/api/shipments", shipmentRoute);
app.use("/api/admin", adminRoute);
app.use("/api/reports", reportRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/addresses", addressRoute);
app.use("/api/favorites", favoriteRoute);
app.use("/api/banners", bannerRoute);
app.use("/api/vouchers", voucherRoute);
app.use("/api/chatbot", chatbotRoute);
app.use("/api/messages", messageRoute);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
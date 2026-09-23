const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

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

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

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
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
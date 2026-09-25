require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { cancelExpiredUnpaidOrders } = require("./services/order.service");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Run 24h payment timeout check on startup and then every 15 minutes
  cancelExpiredUnpaidOrders().catch((err) =>
    console.error("[OrderTimeout] Initial check error:", err.message)
  );
  setInterval(() => {
    cancelExpiredUnpaidOrders().catch((err) =>
      console.error("[OrderTimeout] Interval check error:", err.message)
    );
  }, 15 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
};

startServer();
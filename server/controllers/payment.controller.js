const paymentService = require("../services/payment.service");

const getClientIp = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  // Localhost IPv6 -> IPv4
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  // IPv4-mapped IPv6
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  return ip;
};

const createPayment = async (req, res, next) => {
  try {
    const ipAddr = getClientIp(req);

    const result = await paymentService.createPayment(
      req.user.id,
      req.body.order_id,
      ipAddr
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const handleReturn = async (req, res, next) => {
  let clientUrl = process.env.CLIENT_URL || "https://food-lemon-seven.vercel.app";

  if (clientUrl.includes("<") || clientUrl.includes(">")) {
    clientUrl = clientUrl
      .replace(/<frontend-domain>/gi, "food-lemon-seven")
      .replace(/<.*?>/g, "food-lemon-seven")
      .replace(/[<>]/g, "");
  }

  if (process.env.RENDER && (clientUrl.includes("localhost") || clientUrl.includes("127.0.0.1") || !clientUrl.startsWith("http"))) {
    clientUrl = "https://food-lemon-seven.vercel.app";
  }

  try {
    const result = await paymentService.handleReturn(req.query);
    const isSuccess = result.status === "SUCCESS";

    res.redirect(
      `${clientUrl}/payment-result?status=${result.status}&order_id=${result.order_id}&vnp_ResponseCode=${isSuccess ? "00" : "99"}&success=${isSuccess}`
    );
  } catch (err) {
    console.error("[handleReturn error]:", err);
    const orderIdCandidate = req.query?.vnp_TxnRef ? req.query.vnp_TxnRef.split("_")[0] : "";
    res.redirect(
      `${clientUrl}/payment-result?status=FAILED&order_id=${orderIdCandidate}&success=false&error=${encodeURIComponent(
        err.message || "Lỗi xử lý giao dịch"
      )}`
    );
  }
};

module.exports = {
  createPayment,
  handleReturn,
};
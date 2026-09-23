const moment = require("moment");
const qs = require("qs");

const {
  sortObject,
  createSecureHash,
} = require("../utils/vnpayHelpers");

const buildPaymentUrl = ({
  orderId,
  amount,
  txnRef,
  ipAddr,
}) => {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  if (!tmnCode) {
    throw new Error("VNPAY_TMN_CODE is missing");
  }

  if (!secretKey) {
    throw new Error("VNPAY_HASH_SECRET is missing");
  }

  if (!vnpUrl) {
    throw new Error("VNPAY_URL is missing");
  }

  if (!returnUrl) {
    throw new Error("VNPAY_RETURN_URL is missing");
  }

  const createDate = moment().format("YYYYMMDDHHmmss");

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_OrderType: "other",
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: createDate,
  };

  // Chuẩn hóa IP localhost
  if (vnp_Params.vnp_IpAddr === "::1") {
    vnp_Params.vnp_IpAddr = "127.0.0.1";
  }

  if (vnp_Params.vnp_IpAddr.startsWith("::ffff:")) {
    vnp_Params.vnp_IpAddr =
      vnp_Params.vnp_IpAddr.replace("::ffff:", "");
  }

  // Sort + encode theo format VNPay
  vnp_Params = sortObject(vnp_Params);

  // Tạo chữ ký từ dữ liệu đã encode
  const secureHash = createSecureHash(
    vnp_Params,
    secretKey
  );

  // Thêm chữ ký
  vnp_Params.vnp_SecureHash = secureHash;

  // Quan trọng:
  // Các value đã được encode ở sortObject()
  // nên KHÔNG encode thêm lần nữa.
  const paymentUrl =
    `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;

  return paymentUrl;
};


// Verify chữ ký khi VNPay redirect về
const verifyReturnUrl = (query) => {
  const secretKey = process.env.VNPAY_HASH_SECRET;

  if (!secretKey) {
    throw new Error("VNPAY_HASH_SECRET is missing");
  }

  const receivedHash = query.vnp_SecureHash;

  if (!receivedHash) {
    return false;
  }

  const params = { ...query };

  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);

  const computedHash = createSecureHash(
    sorted,
    secretKey
  );

  return computedHash.toLowerCase() === receivedHash.toLowerCase();
};

module.exports = {
  buildPaymentUrl,
  verifyReturnUrl,
};
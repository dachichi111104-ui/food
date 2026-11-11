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
  bankCode,
}) => {
  const tmnCode = process.env.VNPAY_TMN_CODE || "5ZRFSRU0";
  const secretKey = process.env.VNPAY_HASH_SECRET || "IRYOLRNMCEZMBMEWQENQOIKOQITKQFMN";
  const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  let returnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:5000/api/payments/vnpay/return";

  // Tự động làm sạch returnUrl nếu chứa placeholder dạng <backend-domain> hoặc ký tự nguy hiểm <>
  if (returnUrl.includes("<") || returnUrl.includes(">")) {
    returnUrl = returnUrl
      .replace(/<backend-domain>/gi, "food-f18t")
      .replace(/<.*?>/g, "food-f18t")
      .replace(/[<>]/g, "");
  }

  // Nếu deploy trên Render mà returnUrl vẫn là localhost hoặc chưa đủ chuẩn, tự động gán domain thật của Render
  if (process.env.RENDER && (returnUrl.includes("localhost") || returnUrl.includes("127.0.0.1") || !returnUrl.startsWith("http"))) {
    returnUrl = "https://food-f18t.onrender.com/api/payments/vnpay/return";
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

  if (bankCode) {
    vnp_Params.vnp_BankCode = bankCode;
  }

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
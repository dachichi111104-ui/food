const crypto = require("crypto");

const sortObject = (obj) => {
  const sorted = {};
  const str = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (let i = 0; i < str.length; i++) {
    const key = str[i];

    // Decode key để lấy lại key gốc trong object
    const originalKey = decodeURIComponent(key);

    sorted[key] = encodeURIComponent(obj[originalKey])
      .replace(/%20/g, "+");
  }

  return sorted;
};

const createSecureHash = (params, secret) => {
  if (!secret) {
    throw new Error("VNPAY_HASH_SECRET is missing");
  }

  const signData = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
};

module.exports = {
  sortObject,
  createSecureHash,
};
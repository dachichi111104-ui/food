/**
 * Định nghĩa các transition hợp lệ cho ShopOrder.
 * Mọi module (Seller, Shipper, Admin) đều phải dùng hàm này để validate,
 * không được tự ý set status trực tiếp.
 */
const VALID_TRANSITIONS = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["HANDED_TO_SHIPPER", "CANCELLED"],
  HANDED_TO_SHIPPER: ["DELIVERED"],
  DELIVERED: ["COMPLETED", "REFUNDING"],
  COMPLETED: ["REFUNDING"],
  CANCELLED: [],
  REFUNDING: ["REFUNDED"],
  REFUNDED: [],
};

const canTransition = (fromStatus, toStatus) => {
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
};

module.exports = { VALID_TRANSITIONS, canTransition };
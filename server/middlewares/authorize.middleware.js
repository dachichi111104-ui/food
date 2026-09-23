const ApiError = require("../utils/ApiError");

// Dùng: authorize("seller", "admin")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission for this action"));
    }
    next();
  };
};

module.exports = authorize;
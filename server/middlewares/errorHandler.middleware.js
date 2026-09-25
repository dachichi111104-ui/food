const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi hệ thống máy chủ. Vui lòng thử lại sau!";

  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
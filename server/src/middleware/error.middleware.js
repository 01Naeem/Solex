// error.middleware.js
const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err); // log full stack

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
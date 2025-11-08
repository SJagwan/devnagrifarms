const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Something went wrong on the server";

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;

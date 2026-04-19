const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes/index");
const logger = require("./config/logger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Morgan HTTP request logging piped to Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(`[HTTP] ${message.trim()}`),
    },
  })
);

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;

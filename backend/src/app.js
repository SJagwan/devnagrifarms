import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import logger from "./config/logger.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

export default app;

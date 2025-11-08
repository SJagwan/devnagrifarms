import dotenv from "dotenv";
import app from "./src/app.js";
import logger from "./src/config/logger.js";
import db from "./src/models/index.js";
const { sequelize } = db;

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Unable to start server:", err);
    process.exit(1);
  }
};

startServer();

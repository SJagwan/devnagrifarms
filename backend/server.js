const dotenv = require("dotenv");
const app = require("./src/app");
const logger = require("./src/config/logger");
const db = require("./src/models");
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

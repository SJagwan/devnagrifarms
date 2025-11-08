const express = require("express");
const router = express.Router();

router.use("/example", (req, res) => {
  res.send("Example route working");
});

module.exports = router;

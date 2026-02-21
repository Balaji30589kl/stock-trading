const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { getForecast } = require("../controllers/forecastController");

// Validation middleware
const validateForecastRequest = (req, res, next) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({
      success: false,
      message: "Symbol is required in request body",
    });
  }

  if (typeof symbol !== "string") {
    return res.status(400).json({
      success: false,
      message: "Symbol must be a string",
    });
  }

  if (symbol.length > 10) {
    return res.status(400).json({
      success: false,
      message: "Symbol must be 10 characters or less",
    });
  }

  next();
};

router.post("/forecast", verifyToken, validateForecastRequest, getForecast);

module.exports = router;

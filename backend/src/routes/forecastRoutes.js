const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { getForecast } = require("../controllers/forecastController");

router.post("/forecast", verifyToken, getForecast);

module.exports = router;

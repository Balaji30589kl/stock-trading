const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");

const { getAllHoldings, getAllPositions } = require("../controllers/portfolio.controller");

router.get("/allHoldings", verifyToken, getAllHoldings);
router.get("/allPositions", verifyToken, getAllPositions);

module.exports = router;

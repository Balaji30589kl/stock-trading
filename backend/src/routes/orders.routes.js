const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");

const { createOrder, getAllOrders } = require("../controllers/orders.controller");

router.post("/newOrder", verifyToken, createOrder);
router.get("/allOrders", verifyToken, getAllOrders);

module.exports = router;

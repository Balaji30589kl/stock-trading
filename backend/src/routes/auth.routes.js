const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

/**
 * @route   POST /register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /login
 * @desc    Login user and get token
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   GET /profile
 * @desc    Get current user profile
 * @access  Private (requires JWT token)
 */
router.get("/profile", verifyToken, authController.getProfile);

module.exports = router;

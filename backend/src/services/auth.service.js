const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthService {
  /**
   * Hash a plain text password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare plain text password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} - True if passwords match
   */
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate JWT token
   * @param {object} payload - Data to encode in token (e.g., user id, email)
   * @returns {string} - JWT token
   */
  generateToken(payload) {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {object|null} - Decoded token payload or null if invalid
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthService();

const express = require("express");
const c = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const verifyCaptcha = require("../middleware/verifyCaptcha");
const { authLimiter } = require("../middleware/rateLimiter");
const { signupRules, loginRules, resetRules, validate } = require("../validators/authValidator");

const router = express.Router();

router.post("/signup", authLimiter, verifyCaptcha, signupRules, validate, c.signup);
router.post("/login", authLimiter, verifyCaptcha, loginRules, validate, c.login);
router.post("/forgot-password", authLimiter, verifyCaptcha, c.forgotPassword);
router.post("/reset-password/:token", resetRules, validate, c.resetPassword);
router.post("/logout", c.logout);
router.get("/me", protect, c.getMe);

module.exports = router;
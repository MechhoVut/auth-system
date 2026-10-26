const { body, validationResult } = require("express-validator");

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const passwordMsg =
  "Password must be 8+ characters with uppercase, lowercase, number and special character";

const confirmRule = body("confirmPassword")
  .custom((v, { req }) => v === req.body.password)
  .withMessage("Passwords do not match");

exports.signupRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").matches(strongPassword).withMessage(passwordMsg),
  confirmRule,
];

exports.loginRules = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.resetRules = [
  body("password").matches(strongPassword).withMessage(passwordMsg),
  confirmRule,
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};
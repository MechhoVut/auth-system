const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 min

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      message: "Signup successful. Please login",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // still locked?
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${mins} minute(s)` });
    }

    // lock time over, fresh start
    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.failedAttempts = 0;
      user.lockUntil = undefined;
    }

    const ok = await user.matchPassword(password);

    if (!ok) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        await user.save();
        return res.status(423).json({ message: "Too many failed attempts. Account locked for 15 minutes" });
      }
      await user.save();
      const left = MAX_ATTEMPTS - user.failedAttempts;
      return res.status(401).json({ message: `Invalid email or password. ${left} attempt(s) left` });
    }

    // success
    user.failedAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    generateToken(res, user._id);
    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out" });
};

exports.getMe = (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ user: { id: _id, name, email, role } });
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      // store only the hash in DB, send the raw token by email
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
      await user.save();

      const url = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click this link to set a new password (valid for 15 minutes):\n${url}`,
      });
    }

    // same reply whether email exists or not
    res.json({ message: "If that email is registered, a reset link has been sent" });
  } catch (err) {
    res.status(500).json({ message: "Could not send email" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Reset link is invalid or expired" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.failedAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please login" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

router.get("/", isAdmin, (req, res) => {
  res.json({ success: true, message: "Admin Dashboard Access" });
});

router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

router.get("/stats", isAdmin, async (req, res) => {
  try {
    res.json({
      users: 100,
      stores: 50,
      ratings: 200
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

module.exports = router;
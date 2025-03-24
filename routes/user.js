const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");

const User = db.User;
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware to check authentication
const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Middleware to check if user is an Admin
const isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

// Get user profile
router.get("/profile", isAuthenticated, (req, res) => {
  const { password, ...userWithoutPassword } = req.user.toJSON();
  res.json({ success: true, user: userWithoutPassword });
});

// Update user profile
router.put("/update-profile", isAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  try {
    req.user.name = name;
    await req.user.save();
    
    const { password, ...userWithoutPassword } = req.user.toJSON();
    res.json({ success: true, message: "Profile updated successfully", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role: "user" });

    res.status(201).json({ 
      success: true, 
      message: "Signup successful", 
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

module.exports = router;

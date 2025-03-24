const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../models"); // Import database models
const Store = db.Store; // Assuming a Store model exists
const Rating = db.Rating; // Assuming a Rating model exists
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
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Get all stores from the database
router.get("/", async (req, res) => {
  try {
    const stores = await Store.findAll();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

// Get a single store by ID
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

// Rate a store
router.post("/:id/rate", isAuthenticated, async (req, res) => {
  const { rating } = req.body;
  const storeId = parseInt(req.params.id);

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  try {
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // Save rating to the database
    await Rating.create({
      storeId,
      userId: req.user.id,
      rating,
      comment: req.body.comment || "",
    });

    res.json({ success: true, message: "Rating submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

module.exports = router;

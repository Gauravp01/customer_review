const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../models"); // Import models
const Store = db.Store; // Assuming a Store model exists
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware to check if user is a store owner
const isStoreOwner = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== "store_owner") {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }
    req.user = decoded; // Attach decoded token to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Get all stores owned by this store owner
router.get("/my-stores", isStoreOwner, async (req, res) => {
  try {
    const myStores = await Store.findAll({ where: { owner: req.user.email } });
    res.json({ success: true, stores: myStores });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

// Add a new store
router.post("/add-store", isStoreOwner, async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const newStore = await Store.create({
      name,
      owner: req.user.email,
      address,
      rating: 0
    });

    res.status(201).json({ success: true, message: "Store added successfully", store: newStore });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

// Store owner stats endpoint
router.get("/stats", isStoreOwner, async (req, res) => {
  try {
    const myStores = await Store.findAll({ where: { owner: req.user.email } });

    if (myStores.length === 0) {
      return res.json({ averageRating: 0, totalRatings: 0 });
    }

    const totalRatings = myStores.reduce((sum, store) => sum + store.rating, 0);
    const averageRating = totalRatings / myStores.length;

    res.json({ averageRating, totalRatings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

module.exports = router;

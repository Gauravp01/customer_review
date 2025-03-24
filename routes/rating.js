const express = require("express");
const jwt = require("jsonwebtoken");
const { Rating, Store } = require("../models"); // Import models
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
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

// Get all ratings for a store
router.get("/store/:storeId", async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const storeRatings = await Rating.findAll({ where: { storeId } });
    res.json(storeRatings);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching ratings" });
  }
});

// Get all ratings by a user
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRatings = await Rating.findAll({ where: { userId } });
    res.json(userRatings);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user ratings" });
  }
});

// Submit a new rating
router.post("/", isAuthenticated, async (req, res) => {
  const { storeId, rating, comment } = req.body;

  if (!storeId || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Invalid rating data" });
  }

  try {
    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // Create new rating
    const newRating = await Rating.create({
      storeId,
      userId: req.user.id,
      rating,
      comment: comment || "",
    });

    // Update store's average rating
    const ratings = await Rating.findAll({ where: { storeId } });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await store.update({ rating: avgRating });

    res.status(201).json({ success: true, message: "Rating submitted successfully", rating: newRating });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting rating" });
  }
});

// Modify an existing rating
router.put("/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Invalid rating data" });
  }

  try {
    const existingRating = await Rating.findOne({ where: { id, userId: req.user.id } });
    if (!existingRating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    await existingRating.update({ rating, comment });

    // Update store's average rating
    const ratings = await Rating.findAll({ where: { storeId: existingRating.storeId } });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await Store.update({ rating: avgRating }, { where: { id: existingRating.storeId } });

    res.json({ success: true, message: "Rating updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating rating" });
  }
});

module.exports = router;

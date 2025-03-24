const express = require("express");
const router = express.Router();
const { sequelize } = require("../models");

router.get("/", async (req, res) => {
  try {
    const [tables] = await sequelize.query(`
      SELECT LOWER(table_name) AS table_name FROM information_schema.tables
      WHERE table_schema = 'public';
    `);

    if (!tables || !Array.isArray(tables)) {
      return res.status(500).json({ message: "Invalid database response" });
    }

    const existingTables = tables.map((row) => row.table_name);
    console.log("Fetched Tables from DB:", existingTables);

    if (!existingTables.includes("stores") || !existingTables.includes("ratings")) {
      return res.status(500).json({ message: "Required tables missing in the database" });
    }

    const [[storeData]] = await sequelize.query('SELECT COUNT(*) AS "totalStores" FROM "Stores";');
    const [[ratingData]] = await sequelize.query('SELECT COUNT(*) AS "totalRatings" FROM "Ratings";');

    res.json({
      message: "Dashboard data loaded successfully",
      totalStores: storeData.totalStores,
      totalRatings: ratingData.totalRatings,
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});

module.exports = router;

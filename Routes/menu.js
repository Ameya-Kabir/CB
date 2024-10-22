// Routes/menu.js
const express = require("express");
const router = express.Router();
const db = require("./db-config"); // Adjust the path according to your structure
const { authenticateToken } = require("../middleware/auth");

// Route to display the menu
router.get("/menu", authenticateToken, (req, res) => {
  const query =
    "SELECT p.*, IFNULL(SUM(i.quantity), 0) AS stock FROM products p LEFT JOIN inventory i ON p.id = i.product_id GROUP BY p.id;"; // Adjust this query based on your database structure
  db.query(query, (err, results) => {
    if (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ error: "Database error" });
    }
    res.render("menu", {
      products: results,
      user: req.user,
      isLoggedIn: !!req.user,
    }); // Make sure 'products' is passed here
  });
});

module.exports = router;

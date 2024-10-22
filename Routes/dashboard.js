const express = require("express");
const router = express.Router();
const db = require("../Routes/db-config");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Admin Dashboard Route
router.get(
  "/admin/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    // Query to fetch statistics
    const productQuery = "SELECT COUNT(*) AS totalProducts FROM products";
    const inventoryQuery =
      "SELECT SUM(quantity) AS totalInventory FROM inventory";
    const userQuery = "SELECT COUNT(*) AS totalUsers FROM user";
    const warehouseQuery = "SELECT COUNT(*) AS totalWarehouses FROM warehouses";

    db.query(productQuery, (err, productResult) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Database error with product count" });

      const totalProducts = productResult[0].totalProducts;

      db.query(inventoryQuery, (err, inventoryResult) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Database error with inventory count" });

        const totalInventory = inventoryResult[0].totalInventory;

        db.query(userQuery, (err, userResult) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Database error with user count" });

          const totalUsers = userResult[0].totalUsers;

          db.query(warehouseQuery, (err, warehouseResult) => {
            if (err)
              return res
                .status(500)
                .json({ error: "Database error with warehouse count" });

            const totalWarehouses = warehouseResult[0].totalWarehouses;

            // Render the dashboard page and pass the variables to the EJS view
            res.render("admin/dashboard", {
              totalProducts: totalProducts,
              totalInventory: totalInventory,
              totalUsers: totalUsers,
              totalWarehouses: totalWarehouses,
            });
          });
        });
      });
    });
  }
);

module.exports = router;

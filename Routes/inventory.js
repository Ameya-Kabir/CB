const express = require("express");
const router = express.Router();
const db = require("../Routes/db-config");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

router.get(
  "/admin/inventory",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    res.render("admin/inventory", { user: req.user });
  }
);

// GET request to render add-item page with warehouses
router.get(
  "/inventory/add",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    db.query("SELECT * FROM warehouses", (error, warehouses) => {
      if (error) {
        return res
          .status(500)
          .json({ status: "error", error: "Database error" });
      }
      res.render("admin/add-item", { warehouses: warehouses });
    });
  }
);

router.get("/inventory/add", (req, res) => {
  // Fetch products to populate dropdown
  db.query("SELECT * FROM products", (err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server Error");
    }
    res.render("add-item", { products }); // Pass products to the view
  });
});

// GET all inventory items
router.get("/", authenticateToken, authorizeRole(["admin"]), (req, res) => {
  db.query(
    "SELECT inventory.*, warehouses.name AS warehouse_name FROM inventory LEFT JOIN warehouses ON inventory.warehouse_id = warehouses.id",
    (err, results) => {
      if (err) {
        return res.status(500).json({ status: "error", error: "Server error" });
      }
      res.render("admin/inventory", { items: results });
    }
  );
});

// GET form to add a new item
router.get("/add", authenticateToken, authorizeRole(["admin"]), (req, res) => {
  res.render("admin/add-item");
});

// POST to add a new item
router.post("/add", authenticateToken, authorizeRole(["admin"]), (req, res) => {
  const { name, quantity, price } = req.body;
  db.query(
    "INSERT INTO inventory (name, quantity, price, warehouse_id) VALUES (?, ?, ?, ?)",
    [name, quantity, price, warehouse_id],
    (err) => {
      if (err) {
        return res.status(500).json({ status: "error", error: "Server error" });
      }
      res.redirect("/admin/inventory");
    }
  );
});

// You can add more routes for editing and deleting items.

module.exports = router;

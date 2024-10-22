const express = require("express");
const router = express.Router();
const db = require("../Routes/db-config");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

router.get(
  "/admin",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    res.render("admin/dashboard", { user: req.user });
  }
);

router.get(
  "/manage-users",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    // Query the 'user' table to fetch all users
    db.query("SELECT * FROM user", (err, results) => {
      if (err) {
        return res.status(500).send("Server error");
      }
      // Render manage-users.ejs and pass the 'results' array as 'users'
      res.render("admin/manage-users", { users: results });
    });
  }
);

// GET edit user page
router.get(
  "/edit-user/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const userId = req.params.id;
    db.query("SELECT * FROM user WHERE id = ?", [userId], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.length === 0)
        return res.status(404).json({ error: "User not found" });
      res.render("admin/edit-user", { user: result[0] });
    });
  }
);

// POST edit user
router.post(
  "/edit-user/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const userId = req.params.id;
    const { username, role } = req.body;
    db.query(
      "UPDATE user SET username = ?, role = ? WHERE id = ?",
      [username, role, userId],
      (err) => {
        if (err)
          return res.status(500).json({ error: "Failed to update user" });
        res.redirect("/admin/manage-users");
      }
    );
  }
);

// DELETE user
router.get(
  "/delete-user/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const userId = req.params.id;
    db.query("DELETE FROM user WHERE id = ?", [userId], (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete user" });
      res.redirect("/admin/manage-users");
    });
  }
);

// GET request to render the inventory page with items
router.get(
  "/admin/inventory",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    db.query(
      "SELECT inventory.*, warehouses.name AS warehouse_name, products.flavor AS product_flavor, products.name AS product_name FROM inventory LEFT JOIN warehouses ON inventory.warehouse_id = warehouses.id LEFT JOIN products ON inventory.product_id = products.id",
      (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "error", error: "Server error" });
        }
        res.render("admin/inventory", { items: results });
      }
    );
  }
);

// GET request to render the add item page with dropdowns for products and warehouses
router.get(
  "/inventory/add",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    db.query("SELECT * FROM warehouses", (error, warehouses) => {
      if (error) {
        return res
          .status(500)
          .json({ status: "error", error: "Warehouses Database error" });
      }
      db.query("SELECT * FROM products", (error, products) => {
        if (error) {
          return res
            .status(500)
            .json({ status: "error", error: "Products Database error" });
        }

        res.render("admin/add-item", {
          warehouses: warehouses,
          products: products,
        });
      });
    });
  }
);

router.get("/add", (req, res) => {
  // Fetch products to populate dropdown
  db.query("SELECT * FROM products", (err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server Error");
    }
    res.render("admin/add-item", { products }); // Pass products to the view
  });
});

// POST to add a new item
router.post(
  "/inventory/add",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const { quantity, warehouse_id, product_id } = req.body;

    // Fetch product name from the database
    db.query(
      "SELECT name, flavor, price FROM products WHERE id = ?",
      [product_id],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ status: "error", error: "Database Select error" });
        }
        const name = results.length > 0 ? results[0].name : ""; // Get the name from results
        const price = results.length > 0 ? results[0].price : 0; // Get the price from results

        db.query(
          "INSERT INTO inventory (name, quantity, price, warehouse_id, product_id) VALUES (?, ?, ?, ?, ?)",
          [name, quantity, price, warehouse_id, product_id],
          (error, results) => {
            if (error) {
              return res
                .status(500)
                .json({ status: "error", error: "Database Insert error" });
            }

            res.redirect("/admin/inventory"); // Redirect to inventory page after adding
          }
        );
      }
    );
  }
);

// GET request to render the edit item page
router.get(
  "/edit-item/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const itemId = req.params.id;

    // Fetch the item details using the item ID
    db.query(
      "SELECT * FROM inventory WHERE id = ?",
      [itemId],
      (error, itemResult) => {
        if (error || itemResult.length === 0) {
          return res
            .status(404)
            .json({ status: "error", error: "Item not found" });
        }

        // Fetch all warehouses for the dropdown
        db.query("SELECT * FROM warehouses", (warehouseError, warehouses) => {
          if (warehouseError) {
            return res
              .status(500)
              .json({ status: "error", error: "Database error" });
          }

          // Fetch all products for the dropdown
          db.query("SELECT * FROM products", (productsError, products) => {
            if (productsError) {
              return res
                .status(500)
                .json({ status: "error", error: "Database error" });
            }

            res.render("admin/edit-item", {
              item: itemResult[0],
              products: products, // Pass products to the view
              warehouses: warehouses,
              user: req.user,
            });
          });
        });
      }
    );
  }
);

// POST request to update the item
router.post(
  "/edit-item/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const itemId = req.params.id;
    const { product_id, quantity, price, warehouse_id } = req.body;

    // Fetch product name from the database
    db.query(
      "SELECT name, price FROM products WHERE id = ?",
      [product_id],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ status: "error", error: "Database Select error" });
        }
        const name = results.length > 0 ? results[0].name : ""; // Get the name from results
        const price = results.length > 0 ? results[0].price : 0; // Get the price from results

        db.query(
          "UPDATE inventory SET product_id = ?, name = ?, quantity = ?, price = ?, warehouse_id = ? WHERE id = ?",
          [product_id, name, quantity, price, warehouse_id, itemId],
          (error, results) => {
            if (error) {
              return res
                .status(500)
                .json({ status: "error", error: "Database error" });
            }
            res.redirect("/admin/inventory"); // Redirect to inventory page after editing
          }
        );
      }
    );
  }
);

// Route to handle deleting an item
router.get(
  "/delete-item/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const itemId = req.params.id;

    db.query(
      "DELETE FROM inventory WHERE id = ?",
      [itemId],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ status: "error", error: "Database error" });
        }
        res.redirect("/admin/inventory"); // Redirect to inventory page after deleting
      }
    );
  }
);

//warehouses
//route
router.get(
  "/warehouses",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    db.query("SELECT * FROM warehouses", (err, results) => {
      if (err) {
        return res.status(500).json({ status: "error", error: "Server error" });
      }
      res.render("admin/manage-warehouses", { warehouses: results });
    });
  }
);

// Render add-warehouse form
router.get(
  "/warehouses/add",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    res.render("admin/add-warehouse");
  }
);

// View all warehouses
router.get(
  "/warehouses",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    db.query("SELECT * FROM warehouses", (err, results) => {
      if (err) {
        return res.status(500).json({ status: "error", error: "Server error" });
      }
      res.render("admin/manage-warehouses", { warehouses: results });
    });
  }
);

// Add a new warehouse
router.post(
  "/warehouses/add",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const { name, location } = req.body;
    db.query(
      "INSERT INTO warehouses (name, location) VALUES (?, ?)",
      [name, location],
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "error", error: "Server error" });
        }
        res.redirect("/admin/warehouses");
      }
    );
  }
);

// Edit warehouse - show the edit form
router.get(
  "/warehouses/edit/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const warehouseId = req.params.id;
    db.query(
      "SELECT * FROM warehouses WHERE id = ?",
      [warehouseId],
      (err, results) => {
        if (err || results.length === 0) {
          return res
            .status(500)
            .json({ status: "error", error: "Warehouse not found" });
        }
        res.render("admin/edit-warehouse", { warehouse: results[0] });
      }
    );
  }
);

// Edit warehouse - submit changes
router.post(
  "/warehouses/edit/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const warehouseId = req.params.id;
    const { name, location } = req.body;
    db.query(
      "UPDATE warehouses SET name = ?, location = ? WHERE id = ?",
      [name, location, warehouseId],
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "error", error: "Server error" });
        }
        res.redirect("/admin/warehouses");
      }
    );
  }
);

// Delete a warehouse
router.get(
  "/warehouses/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req, res) => {
    const warehouseId = req.params.id;
    db.query("DELETE FROM warehouses WHERE id = ?", [warehouseId], (err) => {
      if (err) {
        return res.status(500).json({ status: "error", error: "Server error" });
      }
      res.redirect("/admin/warehouses");
    });
  }
);

module.exports = router;

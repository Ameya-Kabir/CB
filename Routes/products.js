const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../Routes/db-config");
const router = express.Router();

// Fetch all products
router.get("/products", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server Error");
    }
    res.json(results); // Send products as a JSON response
  });
});

// Route to manage products
router.get("/products/manage", (req, res) => {
  const query = "SELECT * FROM products";

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
    }
    res.render("admin/manage-products", { products: result });
  });
});

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: "./public/uploads/", // Folder where files will be saved
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Display all products
router.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, products) => {
    if (err) throw err;
    res.render("admin/manage-products", { products });
  });
});

//Route to add product
router.get("/products/add", (req, res) => {
  res.render("admin/add-product"); // Render the add-product view
});

// Add a new product
router.post("/products/add", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.render("admin/add-product", { msg: err });
    } else {
      if (req.file === undefined) {
        return res.render("admin/add-product", { msg: "No file selected!" });
      }

      const { name, flavor, price } = req.body;
      const imagePath = `/uploads/${req.file.filename}`;

      const query =
        "INSERT INTO products (name, flavor, price, image) VALUES (?, ?, ?, ?)";
      db.query(query, [name, flavor, price, imagePath], (err, result) => {
        if (err) {
          return res.render("admin/add-product", {
            msg: "Error adding product to database!",
          });
        }
        res.redirect("/admin/products/manage?msg=Product added successfully");
      });
    }
  });
});

// Edit a product
router.get("/products/edit/:id", (req, res) => {
  const productId = req.params.id;
  const query = "SELECT * FROM products WHERE id = ?";

  db.query(query, [productId], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(404).send("Product not found");
    }
    res.render("admin/edit-product", { product: result[0] });
  });
});

router.post("/products/edit/:id", upload, (req, res) => {
  const productId = req.params.id;
  const { name, flavor, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null; // New image if provided

  // Prepare SQL query
  let query = "UPDATE products SET name = ?, flavor = ?, price = ?";
  const values = [name, flavor, price];

  // If a new image was uploaded, update the query to include the image
  if (image) {
    query += ", image = ?";
    values.push(image);
  }

  query += " WHERE id = ?";
  values.push(productId); // Add product ID to the end of the values array

  // Execute the query
  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server Error");
    }
    res.redirect("/admin/products/manage"); // Redirect to manage products
  });
});

// Delete a product
router.post("/products/delete/:id", (req, res) => {
  const productId = req.params.id;
  const query = "DELETE FROM products WHERE id = ?";

  db.query(query, [productId], (err, result) => {
    if (err) throw err;
    res.redirect("/admin/products/manage");
  });
});

module.exports = router;

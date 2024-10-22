const express = require("express");
const app = express();
const db = require("./Routes/db-config");
const cookie = require("cookie-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const router = express.Router();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming request body
app.use(express.urlencoded({ extended: true })); // For form data (application/x-www-form-urlencoded)
app.use(express.json()); // For JSON data
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", __dirname + "/Views");

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MYSQL CONNECTED");
  }
});
//define routes
app.use(express.static("public"));
app.use("/", require("./Routes/pages"));
app.use("/auth", require("./Controllers/auth"));
app.use("/", require("./Routes/admin"));
app.use("/admin", require("./Routes/admin"));
app.use("/admin/inventory", require("./Routes/inventory"));
app.use("/admin", require("./Routes/products"));
const dashboardRoutes = require("./Routes/dashboard");
app.use(dashboardRoutes);

app.use("/", require("./Routes/menu"));
app.get("/menu", (req, res) => {
  res.render("menu"); // This will render menu.ejs
});

app.set("Views", "./Views");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

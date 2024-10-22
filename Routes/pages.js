const express = require("express");
const loggedin = require("../Controllers/loggedin");
const router = express.Router();

router.get("/", loggedin, (req, res) => {
  if (req.user) {
    res.render("index", { status: "loggedin", user: req.user });
  } else {
    res.render("index", { status: "loggedout", user: null });
  }
});

router.get("/register", (req, res) => {
  res.sendFile("signup.html", { root: "./public" });
});

router.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "./public" });
});

module.exports = router;

const jwt = require("jsonwebtoken");
const db = require("../Routes/db-config");
const bcrypt = require("bcryptjs");
const path = require("path");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ status: "error", error: "Please fill in all fields" });
  } else {
    db.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          throw error;
        }
        if (
          !results[0] ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          return res.json({ status: "error", error: "Invalid credentials" });
        } else {
          const token = jwt.sign(
            { id: results[0].id, role: results[0].role },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRES,
            }
          );

          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };

          res.cookie("UserRegistered", token, cookieOptions);

          return res.json({
            status: "success",
            success: "User logged in",
          });
        }
      }
    );
  }
};

module.exports = login;

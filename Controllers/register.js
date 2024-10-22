const db = require("../Routes/db-config");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  const { username, email, password: Npassword, role = "user" } = req.body;

  // Input validation: check if all fields are provided
  if (!username || !email || !Npassword) {
    return res.json({ status: "error", error: "Please fill all fields" });
  }

  try {
    // Check if the email already exists in the database
    db.query(
      "SELECT email FROM user WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ status: "error", error: "Database error" });
        }

        if (results.length > 0) {
          return res.json({ status: "error", error: "Email already in use" });
        } else {
          // Hash the password
          const password = await bcrypt.hash(Npassword, 10);

          // Insert the new user into the database
          db.query(
            "INSERT INTO user SET ?",
            { username, email, password, role },
            (error, results) => {
              if (error) {
                return res
                  .status(500)
                  .json({ status: "error", error: "Database error" });
              }

              return res.json({
                status: "success",
                success: "User registered successfully",
              });
            }
          );
        }
      }
    );
  } catch (err) {
    return res.status(500).json({ status: "error", error: "Server error" });
  }
};

module.exports = register;

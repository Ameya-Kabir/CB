const db = require("../Routes/db-config");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  const { username, email, password: Npassword } = req.body;
  if (!username || !email || !Npassword) {
    return res.json({ status: "error", error: "Please fill all fields" });
  } else {
    console.log(email);
    db.query(
      "SELECT email FROM user WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          throw error;
        }
        if (results[0]) {
          return res.json({ status: "error", error: "Email already in use" });
        } else {
          const password = await bcrypt.hash(Npassword, 10);
          db.query(
            "INSERT INTO user SET ?",
            { username: username, email: email, password: password },
            (error, results) => {
              if (error) {
                throw error;
              } else {
                return res.json({
                  status: "success",
                  success: "User registered",
                });
              }
            }
          );
        }
      }
    );
  }
};

module.exports = register;

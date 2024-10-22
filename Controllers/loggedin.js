const db = require("../Routes/db-config");
const jwt = require("jsonwebtoken");

const loggedin = (req, res, next) => {
  const token = req.cookies.UserRegistered;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Query the database for the user
    db.query(
      "SELECT * FROM user WHERE id = ?",
      [decoded.id],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ status: "error", error: "Server error" });
        }

        // If user exists, set req.user; otherwise set to null
        req.user = results[0];
        next(); // Call next to continue to the next middleware or route handler
      }
    );
  } catch (err) {
    // Handle token verification errors
    req.user = null; // Ensure user is null on error
    return res.status(401).json({ status: "error", error: "Invalid token" });
  }
};

module.exports = loggedin;

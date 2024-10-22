const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.UserRegistered;

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", error: "Unauthorized, no token found" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ status: "error", error: "Invalid or expired token" });
    }
    // Save decoded user info in the request for later use
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
};

const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ status: "error", error: "Forbidden, insufficient permissions" });
  }
  next();
};

module.exports = { authenticateToken, authorizeRole };

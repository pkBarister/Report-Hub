const jwt = require("jsonwebtoken");

// Middleware to verify if a user is logged in
exports.protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded payload (id and role) to the request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token is invalid or expired" });
  }
};

// Middleware to restrict access by role (Writer vs User)
// Usage: router.get('/workspaces', protect, authorize('writer'), ...)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

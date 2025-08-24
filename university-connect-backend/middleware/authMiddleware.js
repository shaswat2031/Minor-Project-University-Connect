const jwt = require("jsonwebtoken");

// Auth middleware function
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    
    // Fix: Map the 'id' from token to '_id' for consistency
    req.user = {
      _id: decoded.id,
      ...decoded
    };
    
    console.log("Auth Middleware - User:", req.user);
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Export the middleware function directly
module.exports = authMiddleware;

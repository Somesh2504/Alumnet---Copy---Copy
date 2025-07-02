import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  // Check for token in cookies first
  let token = req.cookies.token;
  console.log('authUser middleware - cookies:', req.cookies);
  console.log('authUser middleware - token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('authUser middleware - No token found, returning 401');
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('authUser middleware - Token decoded successfully:', decoded);
    req.user = decoded; // e.g., { id, email, role }
    next();
  } catch (err) {
    console.error("authUser middleware - JWT Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authUser;

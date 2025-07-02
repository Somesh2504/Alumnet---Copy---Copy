import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  console.log("in authUser middleware *********")
  
  // Check for token in Authorization header first (Bearer token)
  let token = null;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log("token taken from Authorization header *******")
  } else {
    // Fallback to cookies
    token = req.cookies.token;
    console.log("token taken from cookies *******")
  }
  
  if (!token) {
    console.log("token not taken *******")
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded********", decoded)
    req.user = decoded; // e.g., { id, email, role }
    console.log("auth success  *******")
    next();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("JWT Error:", err);
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authUser;

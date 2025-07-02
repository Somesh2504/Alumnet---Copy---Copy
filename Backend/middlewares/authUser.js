import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  // Check for token in cookies first
  let token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
   
    
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    // console.log("decoded********",decoded)
    req.user = decoded; // e.g., { id, email, role }
    next();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("JWT Error:", err);
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authUser;

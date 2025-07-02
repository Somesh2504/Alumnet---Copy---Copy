import jwt from 'jsonwebtoken';
import Admin from '../Models/Admin.js';

export const authAdmin = async (req, res, next) => {
  console.log("***** in auth admin *******")
  try {
    // Check for token in Authorization header first (Bearer token)
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Fallback to cookies
      token = req.cookies.adminToken;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token. Admin not found.' });
    }

    // Add admin info to request
    req.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    };

    console.log("adminnnn****", req.admin)

    next();
  } catch (error) {
    console.error('Auth admin error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
}; 
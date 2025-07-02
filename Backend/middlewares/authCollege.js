import jwt from 'jsonwebtoken';
import College from '../Models/College.js';

export const authCollege = async (req, res, next) => {
  try {
    // Check for token in Authorization header first (Bearer token)
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Fallback to cookies
      token = req.cookies.collegeToken;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if college exists and is approved
    const college = await College.findById(decoded.id);
    if (!college) {
      return res.status(401).json({ message: 'Invalid token. College not found.' });
    }

    if (!college.approved) {
      return res.status(403).json({ message: 'College account is pending approval.' });
    }

    // Add college info to request
    req.college = {
      id: college._id,
      email: college.email,
      name: college.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth college error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
}; 
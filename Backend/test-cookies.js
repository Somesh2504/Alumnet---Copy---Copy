// Test script to verify cookie configuration
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: ["https://alumnet-frontend-c0cg.onrender.com", "http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(cookieParser());

// Test endpoint to set a cookie
app.post('/test-set-cookie', (req, res) => {
  const testToken = 'test-token-123';
  
  res.cookie('token', testToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  });
  
  res.json({ 
    message: 'Test cookie set',
    cookieConfig: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    }
  });
});

// Test endpoint to read cookies
app.get('/test-read-cookie', (req, res) => {
  res.json({ 
    cookies: req.cookies,
    headers: req.headers.cookie
  });
});

// Test endpoint to clear cookie
app.post('/test-clear-cookie', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  });
  
  res.json({ message: 'Test cookie cleared' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Cookie test server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Cookie domain: ${process.env.NODE_ENV === 'production' ? '.onrender.com' : 'undefined'}`);
}); 
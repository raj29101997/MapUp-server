import csvQueue from "../queues/csvProcessor.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const { JWT_SECRET } = process.env;

export const processCsvFile = async (filePath) => {
  await csvQueue.add({ filePath });
};

export const verifyToken = (req, res, next) => {
  if (req.url !== '/auth/register' && req.url !== '/auth/login' && req.body.action !== 'register') {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token.' });
      }
      req.user = decoded;
      next();
    });
  } else {
    next();
  }
};

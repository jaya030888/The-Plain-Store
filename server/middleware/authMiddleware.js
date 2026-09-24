const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const jwtSecret = () => process.env.JWT_SECRET || 'dev-only-secret';

const attachUserFromToken = async (token) => {
  const decoded = jwt.verify(token, jwtSecret());
  const [users] = await pool.query('SELECT id, name, email, role, is_blocked, is_deleted FROM users WHERE id = ?', [decoded.id]);
  const user = users[0];
  if (!user || user.is_deleted || user.is_blocked) {
    return null;
  }
  return user;
};

const protect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const user = await attachUserFromToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // Verification endpoints are called by Nginx to verify auth; never bypass for them
  if (req.path.startsWith('/verify-')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  if (process.env.SKIP_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
    req.user = { id: 1, role: 'admin', name: 'Dev User', email: 'dev@example.com' };
    return next();
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const user = await attachUserFromToken(token);
      if (user) req.user = user;
    } catch (error) {
      // Guest checkout continues without a user
    }
  }
  return next();
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden, admin access only' });
  }
};

module.exports = { protect, adminOnly, optionalAuth };

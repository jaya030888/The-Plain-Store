const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  // Development shortcut: bypass JWT verification when SKIP_AUTH is true
  if (process.env.SKIP_AUTH === 'true') {
    // Mock a user object – you can adjust as needed (admin role for full access)
    req.user = { id: 1, role: 'admin', name: 'Dev User', email: 'dev@example.com' };
    return next();
  }

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = users[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden, admin access only' });
  }
};

module.exports = { protect, adminOnly };

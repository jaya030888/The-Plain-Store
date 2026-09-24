const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev-only-secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [resultRows] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'customer'] // ALWAYS force role to 'customer'
    );

    const user = {
      id: resultRows[0].id,
      name,
      email,
      role: 'customer'
    };

    res.status(201).json({
      ...user,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password: '[REDACTED]' });

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    if (user.is_deleted) {
      return res.status(401).json({ message: 'Account not found or has been removed' });
    }
    if (user.is_blocked) {
      return res.status(403).json({ message: 'Your account has been suspended/blocked. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email is already in use by another account' });
    }

    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
    
    const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    const updatedUser = users[0];
    
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser.id), // Provide a new token with updated details if needed, or same token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating profile' });
  }
};

const verifyToken = async (req, res) => {
  if (req.user) {
    res.setHeader('X-User-Id', String(req.user.id));
    res.setHeader('X-User-Role', String(req.user.role));
    return res.status(200).send('OK');
  }
  return res.status(401).send('Unauthorized');
};

const verifyAdmin = async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    res.setHeader('X-User-Id', String(req.user.id));
    res.setHeader('X-User-Role', 'admin');
    return res.status(200).send('OK');
  }
  if (req.user) {
    return res.status(403).send('Forbidden: Admin role required');
  }
  return res.status(401).send('Unauthorized: No admin token');
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyToken,
  verifyAdmin
};

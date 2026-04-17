const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).trim(),
  body('full_name').notEmpty().trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, full_name } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    const userId = uuidv4();

    db.prepare('INSERT INTO users (id, email, password, full_name) VALUES (?, ?, ?, ?)').run(userId, email, hashedPassword, full_name);
    db.prepare('INSERT INTO subscriptions (id, user_id, plan, status) VALUES (?, ?, ?, ?)').run(uuidv4(), userId, 'free', 'active');

    const token = generateToken({ id: userId, email });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, email, full_name }
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const subscription = db.prepare('SELECT plan, status, expires_at FROM subscriptions WHERE user_id = ?').get(req.user.id);
    res.json({ user, subscription });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;

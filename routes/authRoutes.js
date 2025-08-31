const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models'); // adjust to your model

// SSR login page
router.get('/login', (req, res) => {
  res.render('login');
});

// API login endpoint
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  // Set httpOnly cookie for SSR views
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 });
  // Return token for localStorage (AJAX)
  res.json({ token });
});

// API logout
router.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// SSR logout route (optional, for SSR-only logout)
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
});

module.exports = router;
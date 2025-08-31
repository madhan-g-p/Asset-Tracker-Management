const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  // Set cookie for SSR views (httpOnly, secure in production)
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 }); // 1 day
  // Also return token for client-side storage (API/AJAX)
  res.json({ token });
};
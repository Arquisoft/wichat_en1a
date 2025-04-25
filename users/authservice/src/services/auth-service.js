const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/auth-model');

async function loginUser(username, password) {
  const sanitizedUsername = username.toString().trim();
  const user = await User.findOne({ username: sanitizedUsername });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
    return { token, username: user.username, createdAt: user.createdAt };
  } else {
    throw new Error('Invalid credentials');
  }
}

module.exports = { loginUser };


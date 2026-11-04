const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtid: crypto.randomUUID(),
  });
}

const AuthController = {
  // POST /api/auth/register   { name, email, password }
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body || {};
      const errors = {};

      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100)
        errors.name = 'Name must be 2-100 characters';
      if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 255)
        errors.email = 'A valid email is required';
      if (typeof password !== 'string' || password.length < 8 || password.length > 72)
        errors.password = 'Password must be 8-72 characters';

      if (Object.keys(errors).length) {
        return res.status(400).json({ message: 'Validation failed', errors });
      }

      const user = await User.create({ name, email, password });
      const token = signToken(user);
      return res.status(201).json({ message: 'Registered successfully', token, user: User.toPublic(user) });
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') {
        return res.status(409).json({ message: 'Email is already registered' });
      }
      next(err);
    }
  },

  // POST /api/auth/login   { email, password }
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};
      if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.authenticate(email, password);
      if (!user) {
        // Same message for unknown email and wrong password.
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = signToken(user);
      return res.json({ message: 'Logged in successfully', token, user: User.toPublic(user) });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/logout   (requires Bearer token) -> token is revoked server-side
  async logout(req, res, next) {
    try {
      const { jti, exp } = req.token;
      await User.revokeToken(jti, req.user.id, exp);
      return res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/me   (requires Bearer token)
  async me(req, res) {
    return res.json({ user: req.user });
  },
};

module.exports = AuthController;

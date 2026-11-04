const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Requires a valid, non-revoked "Authorization: Bearer <token>" header. Sets req.user and req.token. */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (await User.isTokenRevoked(payload.jti)) {
      return res.status(401).json({ message: 'Token has been logged out' });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });

    req.user = User.toPublic(user);
    req.token = payload; // { sub, jti, iat, exp }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };

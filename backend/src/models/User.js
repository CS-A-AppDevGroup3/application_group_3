const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', ROUNDS);

class User {
  /** Strip sensitive fields before sending a user to the client. */
  static toPublic(row) {
    if (!row) return null;
    return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
  }

  static normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [
      User.normalizeEmail(email),
    ]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  /** Hashes the password and inserts the user. Throws err.code === 'EMAIL_TAKEN' on duplicates. */
  static async create({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, ROUNDS);
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name.trim(), User.normalizeEmail(email), passwordHash]
      );
      return User.findById(result.insertId);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const e = new Error('Email is already registered');
        e.code = 'EMAIL_TAKEN';
        throw e;
      }
      throw err;
    }
  }

  /** Returns the user row if the credentials are valid, otherwise null. */
  static async authenticate(email, password) {
    const user = await User.findByEmail(email);
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    return user && ok ? user : null;
  }

  // ---- token revocation (logout) ----
  static async revokeToken(jti, userId, expiresAtUnixSeconds) {
    await pool.execute(
      'INSERT IGNORE INTO revoked_tokens (jti, user_id, expires_at) VALUES (?, ?, FROM_UNIXTIME(?))',
      [jti, userId, expiresAtUnixSeconds]
    );
    // Housekeeping: expired tokens are rejected by JWT itself, so their rows are no longer needed.
    await pool.execute('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
  }

  static async isTokenRevoked(jti) {
    const [rows] = await pool.execute('SELECT 1 FROM revoked_tokens WHERE jti = ? LIMIT 1', [jti]);
    return rows.length > 0;
  }
}

module.exports = User;

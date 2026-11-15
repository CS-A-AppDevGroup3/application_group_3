// First-run helper  ->  npm run setup
// Creates .env from .env.example (with a fresh JWT_SECRET) if .env does not exist yet.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..', '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('.env already exists, leaving it unchanged.');
} else {
  const secret = crypto.randomBytes(48).toString('hex');
  const text = fs.readFileSync(examplePath, 'utf8').replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);
  fs.writeFileSync(envPath, text);
  console.log('Created .env with a new JWT_SECRET. Check the DB_* settings if your MySQL uses a password.');
}

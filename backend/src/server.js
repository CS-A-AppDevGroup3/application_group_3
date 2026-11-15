require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_me') {
  console.error('Set a strong JWT_SECRET in your .env file before starting the server.');
  process.exit(1);
}

const app = require('./app');
const pool = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;

pool
  .query('SELECT 1')
  .then(() => app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Cannot connect to MySQL:', err.message);
    process.exit(1);
  });

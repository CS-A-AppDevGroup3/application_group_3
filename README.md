# Student Reviewer

A document-based student reviewer system. Students upload a study file and review only what that file contains. The project has an Express + MySQL backend (at the repository root) and a React frontend (in `frontend/`).

**Last updated:** November 1, 2026

## Update log

| Date | Part | What changed |
| --- | --- | --- |
| November 1, 2026 | Frontend | Added the React + Vite app in `frontend/`: Register page, Log in page, and a protected Dashboard connected to the backend auth API. `npm run dev` now starts the backend and frontend together. |
| October 28, 2026 | Backend | Added the MySQL database schema, the User model, and the AuthController (register, login, logout, profile) with JWT authentication and token revocation on logout. |

## Current status

| Part | Status | Last updated |
| --- | --- | --- |
| Backend: database, User model, auth API | Done | October 28, 2026 |
| Frontend: register, login, dashboard | Done | November 1, 2026 |
| File upload, reviewer, flashcards, quiz, progress | Not built yet | |

The database schema already defines study files, sections, flashcards, questions, and quiz attempts. The API does not expose routes for those features yet. Only `/api/health` and `/api/auth/*` are implemented, and the dashboard lists the other modules as "Not built yet".

## Project structure

```text
application_group_3/
├── database/        MySQL schema and setup script
├── src/             Express backend (config, models, controllers, middleware, routes)
├── frontend/        React + Vite app
├── .env.example     backend settings template
├── package.json     backend dependencies and scripts (also runs both apps)
├── LICENSE
└── README.md
```

## Requirements

- Node.js 18 or newer and npm
- MySQL 8 or later, running and reachable with the credentials you configure below

## Quick start on Windows

Open PowerShell in the project root folder.

**1. Install the backend and frontend packages:**

```powershell
npm install
npm install --prefix frontend
```

**2. Configure the backend:**

```powershell
Copy-Item .env.example .env
```

Open `.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for your MySQL server. The database user needs permission to create the database and tables. On Windows, use `DB_HOST=127.0.0.1` if `localhost` fails to connect.

Generate a unique JWT signing secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output into `.env` as the value of `JWT_SECRET`. Keep `.env` private; it is excluded from Git.

**3. Create the database tables (once per computer):**

```powershell
npm run db:init
```

**4. Start both apps with one command:**

```powershell
npm run dev
```

| App | Address |
| --- | --- |
| Backend API | http://localhost:5000 |
| Frontend | http://localhost:5173 |

Open http://localhost:5173, register an account, and you land on the dashboard. Leave the terminal open while you work.

Each teammate must start their own MySQL server (XAMPP, Laragon, or MySQL Installer) and create their own `.env`. The frontend uses port 5173 because the backend's `CLIENT_ORIGIN` setting allows that address.

## Backend

**Last updated:** October 28, 2026

An Express REST API backed by MySQL. It provides a health check and user registration, login, logout, and profile endpoints.

To run the backend alone, use `npm run dev:server` (with file watching) or `npm start`.

### Health check

Open `http://localhost:5000/api/health` in a browser or run:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected response:

```json
{"status":"ok"}
```

The root path `/` of the API is not a web page; it returns a JSON 404 response.

### API reference

Base URL: `http://localhost:5000`

All request and response bodies use JSON. Registration and login return a signed bearer token. The protected routes require this request header:

```text
Authorization: Bearer your_jwt_token
```

#### `POST /api/auth/register`

Create an account. Names must be 2-100 characters, emails must be valid, and passwords must be 8-72 characters.

Request:

```json
{
  "name": "Alex Student",
  "email": "alex@example.com",
  "password": "a-strong-password"
}
```

Success: `201 Created`

```json
{
  "message": "Registered successfully",
  "token": "your_jwt_token",
  "user": {
    "id": 1,
    "name": "Alex Student",
    "email": "alex@example.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

Common errors: `400` for invalid input; `409` if the email is already registered.

#### `POST /api/auth/login`

Request:

```json
{
  "email": "alex@example.com",
  "password": "a-strong-password"
}
```

Success: `200 OK`, returning a `token` and public `user` object. Common errors: `400` if email or password is missing; `401` if the credentials are invalid.

#### `GET /api/auth/me`

Return the currently authenticated user's public profile. Requires the bearer token header.

Success: `200 OK`

```json
{
  "user": {
    "id": 1,
    "name": "Alex Student",
    "email": "alex@example.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

#### `POST /api/auth/logout`

Revoke the current bearer token. Requires the bearer token header.

Success: `200 OK`

```json
{"message":"Logged out successfully"}
```

After logout, that token can no longer be used.

### Example: register and call a protected route (PowerShell)

```powershell
$body = @{
  name = "Alex Student"
  email = "alex@example.com"
  password = "a-strong-password"
} | ConvertTo-Json

$registered = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

$headers = @{ Authorization = "Bearer $($registered.token)" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Headers $headers

Invoke-RestMethod `
  -Uri "http://localhost:5000/api/auth/logout" `
  -Method Post `
  -Headers $headers
```

Use an email address not already registered, or registration will return `409`.

## Frontend

**Last updated:** November 1, 2026

A React app built with Vite, in the `frontend/` folder. It talks to the backend through `http://localhost:5000/api`. To use a different address, copy `frontend\.env.example` to `frontend\.env` and change `VITE_API_URL`.

### Pages

| Page | Path | Access |
| --- | --- | --- |
| Register | `/register` | Logged-out visitors |
| Log in | `/login` | Logged-out visitors |
| Dashboard | `/dashboard` | Logged-in students only |

The session token is kept in the browser, so a page refresh keeps you logged in. Log out revokes the token on the server.

### Run the frontend alone

Start the backend first, then:

```powershell
npm run dev:client
```

## Available npm scripts

**Project root**

| Command | Description |
| --- | --- |
| `npm install` | Install the backend dependencies |
| `npm install --prefix frontend` | Install the frontend dependencies |
| `npm run db:init` | Create the configured database and tables from `database/schema.sql` |
| `npm run dev` | Run the backend and frontend together |
| `npm run dev:server` | Run only the backend, with Node's file watcher |
| `npm run dev:client` | Run only the frontend |
| `npm start` | Run the backend normally |

**Frontend (`frontend/`)**

| Command | Description |
| --- | --- |
| `npm run build` | Build the app for production |

## Troubleshooting

- **`ECONNREFUSED` on port 3306, or "Cannot connect to MySQL":** Start MySQL and check the database host and port in `.env`. On Windows, try `DB_HOST=127.0.0.1`.
- **MySQL access denied:** Check `DB_USER` and `DB_PASSWORD`; ensure the user can connect and create the database.
- **JWT secret configuration error:** Set a unique `JWT_SECRET` in `.env`.
- **`EADDRINUSE` on port 5000:** Another process is using the API port. Stop that server or set a different `PORT` in `.env`.
- **`{"message":"Not found"}` at `http://localhost:5000/`:** The backend has no homepage. Open the frontend at http://localhost:5173 instead, or use `/api/health`.
- **`'vite' is not recognized`:** The frontend packages are not installed. Run `npm install --prefix frontend`.
- **`'concurrently' is not recognized`:** Run `npm install` in the project root.
- **"Cannot reach the server" on the login page:** The backend is not running, or it is not on port 5000.
- **CORS error in the browser console:** The frontend must run on port 5173, or `CLIENT_ORIGIN` in `.env` must match the address in your browser. Restart the backend after changing `.env`.

## License

MIT. See the `LICENSE` file.
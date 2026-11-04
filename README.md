# Student Reviewer Backend

An Express REST API backed by MySQL. The current implementation provides a health check and user registration, login, logout, and profile endpoints. It does not include a browser-based frontend.

## Requirements

- Node.js and npm
- MySQL 8 or later, running and reachable with the credentials configured below

## Setup on Windows

Open PowerShell in this project folder and install the dependencies:

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` in an editor and configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for your MySQL server. The database user needs permission to create the database and tables.

Generate a unique JWT signing secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output into `.env` as the value of `JWT_SECRET`. Do not use a secret from a checked-in example file in a deployed environment. Keep `.env` private; it is excluded from Git.

Create the database tables and start the API:

```powershell
npm run db:init
npm run dev
```

Leave the development-server terminal open. The API listens on the port in `PORT` (default `5000`). To start without file watching, use `npm start`.

## Health check

Open `http://localhost:5000/api/health` in a browser or run:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected response:

```json
{"status":"ok"}
```

The root path `/` is not a web page; it returns a JSON 404 response.

## API reference

Base URL: `http://localhost:5000`

All request and response bodies use JSON. Registration and login return a signed bearer token. The protected routes require this request header:

```text
Authorization: Bearer your_jwt_token
```

### `POST /api/auth/register`

Create an account. Names must be 2–100 characters, emails must be valid, and passwords must be 8–72 characters.

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

### `POST /api/auth/login`

Request:

```json
{
  "email": "alex@example.com",
  "password": "a-strong-password"
}
```

Success: `200 OK`, returning a `token` and public `user` object. Common errors: `400` if email or password is missing; `401` if the credentials are invalid.

### `GET /api/auth/me`

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

### `POST /api/auth/logout`

Revoke the current bearer token. Requires the bearer token header.

Success: `200 OK`

```json
{"message":"Logged out successfully"}
```

After logout, that token can no longer be used.

## Example: register and call a protected route (PowerShell)

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

## Available npm scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run db:init` | Create the configured database and tables from `database/schema.sql` |
| `npm run dev` | Run the API with Node's file watcher |
| `npm start` | Run the API normally |

## Current scope

The database schema also defines study files, sections, flashcards, questions, and quiz attempts. The current API does not yet expose routes for those features; only `/api/health` and `/api/auth/*` are implemented.

## Troubleshooting

- **`ECONNREFUSED` on port 3306:** Start MySQL and check the database host and port in `.env`.
- **MySQL access denied:** Check `DB_USER` and `DB_PASSWORD`; ensure the user can connect and create the database.
- **JWT secret configuration error:** Set a unique `JWT_SECRET` in `.env`.
- **`EADDRINUSE` on port 5000:** Another process is using the API port. Stop that server or set a different `PORT` in `.env`.
- **`{"message":"Not found"}` at `/`:** This backend has no homepage. Use `/api/health` or one of the documented API routes.

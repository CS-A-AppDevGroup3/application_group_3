<<<<<<< HEAD
# Student Reviewer - Backend (Auth + Database)

## Setup
```bash
npm install
cp .env.example .env        # then edit DB_PASSWORD and set a real JWT_SECRET
npm run db:init             # creates the student_reviewer database and tables
npm run dev                 # http://localhost:5000
```

## Endpoints
| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | /api/auth/register | none | `{ name, email, password }` |
| POST | /api/auth/login | none | `{ email, password }` |
| POST | /api/auth/logout | Bearer | none |
| GET  | /api/auth/me | Bearer | none |

Register and login return `{ token, user }`. Send the token as `Authorization: Bearer <token>`.
Logout stores the token's id in `revoked_tokens`, so it stops working immediately.

## Quick test
```bash
curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Juan Dela Cruz","email":"juan@example.com","password":"password123"}'
```
=======
# application_group_3
>>>>>>> 4fb44c40ef2f32862468856ebc04a0f956f801b5

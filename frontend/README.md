# Student Reviewer - Frontend (React + Vite)

Pages: Register, Log in, Dashboard (protected). Talks to the Express backend.

## Run
1. Start the backend first (`npm run dev` in `student-reviewer-backend`, port 5000).
2. In this folder:
```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env  (optional; defaults to http://localhost:5000/api)
npm run dev              # http://localhost:5173
```
Open http://localhost:5173, register an account, and you land on the dashboard.

Port 5173 must stay as is: the backend's CORS setting (`CLIENT_ORIGIN`) allows it by default.

# Idol Vote Hub

A K-pop fan voting platform built with the MERN stack.

## Tech Stack

- Frontend: React, Vite, Material UI, React Router, Axios
- Backend: Node.js, Express.js, JWT, Bcryptjs
- Database: MongoDB, Mongoose

## Features

- User registration, login with JWT
- Daily check-in rewards (+50 hearts / 24h)
- Vote for idols with hearts in time-limited polls
- Admin dashboard for managing idols, agencies, polls, and users
- Role-based access control
- Responsive design

## Setup

### Backend

```bash
cd backend
npm install
# create .env with MONGODB_URI, JWT_SECRET_KEY, etc.
node utils/seed.js   # optional
node server.js
```

### Frontend

```bash
cd frontend
npm install
# create .env with VITE_API_BASE_URL=http://localhost:3000/api
npm run dev
```

## Demo Accounts

| Role  | Email           | Password  |
| ----- | --------------- | --------- |
| Admin | admin@test.com  | admin123  |
| User  | xander@test.com | xander123 |

## Repository Structure

- `frontend/` - React client
- `backend/` - Express API server

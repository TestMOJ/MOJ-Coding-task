# HMCTS Task System

A full-stack task management system built with **Node.js/Express** for the backend and a frontend (e.g., React/HTML/JS) for the user interface. The backend uses **SQLite** as the database.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm (comes with Node.js)
- Optional: [Git](https://git-scm.com/) to clone the repository

---


## Backend Setup

Navigate to the backend folder:
cd backend
Install dependencies:
npm install
Ensure the default port (3001) is free. If the port is already in use:
kill -9 $(lsof -t -i :3001)
Start the backend server:
npm start
You should see:
Connected to SQLite database
Tasks table ready
Default backend URL: http://localhost:3001

##  Frontend Setup

Navigate to the frontend folder:
cd frontend
Install dependencies (if using Node-based frontend, e.g., React):
npm install
Start the frontend development server:
npm start
Default frontend URL: http://localhost:3000

(You may need to free port 3000 if it’s in use: kill -9 $(lsof -t -i :3000))



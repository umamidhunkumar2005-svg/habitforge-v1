# HabitForge ⚒️ 🐉

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue) ![Status](https://img.shields.io/badge/Status-Live-success)

HabitForge is a full-stack, gamified habit-tracking application designed to turn daily productivity into a role-playing game. 

Users can securely log in, forge new habits, and earn Experience Points (XP) for completing their daily tasks. Build your streak, level up your character, and climb the global Hall of Fame. 

## 🌐 Live Demo
**[Play HabitForge Live](https://habitforge-od7j.vercel.app/)**

## ✨ Core Features
* **Authentication:** Secure user registration and login using JWT and Bcrypt password hashing.
* **CRUD Architecture:** Full Create, Read, Update, and Delete functionality for personal habits.
* **The RPG Engine:** Custom backend logic that calculates daily streaks, awards +10 XP per completion, and handles level-up thresholds.
* **Global Leaderboard:** A multiplayer "Hall of Fame" that ranks the top 10 users by Level and XP, utilizing data masking to protect user privacy.
* **Anti-Cheat System:** Server-side validation that prevents users from spamming completions on the same day.

## 🛠️ The Tech Stack
This application was built from the ground up using the **MERN** Stack:
* **Frontend:** React.js, HTML5, standard CSS.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (hosted on MongoDB Atlas).
* **Security:** JSON Web Tokens (JWT) for session management, Bcrypt for password encryption.
* **Deployment:** Vercel (Frontend CI/CD) and Render (Backend API).

## 🚀 Local Installation
If you'd like to run HabitForge on your local machine:

1. **Clone the repository:**
   `git clone https://github.com/your-username/habitforge.git`
2. **Install Server Dependencies:**
   `cd server && npm install`
3. **Install Client Dependencies:**
   `cd ../client && npm install`
4. **Environment Variables:**
   Create a `.env` file in the `server` directory with your `MONGO_URI` and `JWT_SECRET`.
5. **Run the App:**
   Start the backend (`nodemon index.js`) and the frontend (`npm start`).
   
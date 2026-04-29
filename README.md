# HabitForge ⚒️🐉

HabitForge is a full-stack, gamified productivity web application designed to help users build and maintain positive daily habits. By integrating RPG-style mechanics (XP, Leveling, and Streaks) with a global multiplayer leaderboard, HabitForge turns daily self-improvement into an engaging, competitive game.

**🚀 Live Demo:** [HabitForge on Vercel](https://habitforge-v1-git-main-habit-forge-team.vercel.app)

---

## 🎮 Core Features

* **Gamified Progression & Achievements:** Earn 20 XP for every habit completed to level up. Maintain streaks to unlock badges like "Bronze Streak 🥉" and "Consistency King 👑" in your Trophy Room.
* **Multi-Theme UI Engine:** A dynamic, user-controlled theme switcher allowing seamless transitions between Light Mode, Dark Mode, and System Default, powered by CSS Variables.
* **Custom Cloud Avatars:** Users can upload custom profile pictures directly to the cloud, seamlessly replacing the default AI-generated DiceBear avatars.
* **Data Visualization:** Built-in `Chart.js` integration to visually track 30-day habit completion consistency and yearly heatmaps.
* **Freemium SaaS Model:** Core tracking is free (up to 3 habits). Upgrading to the Pro tier unlocks unlimited habits, CSV data exports, and advanced analytics.
* **Full CRUD Functionality:** Users can Create, Read, Update (Edit), and Delete their daily habits with customizable colors and icons.
* **Multiplayer Leaderboard:** A real-time "Hall of Fame" that ranks the top 10 users globally based on their Level and XP.
* **Secure Authentication:** User registration and login powered by encrypted passwords (bcrypt) and JWT (JSON Web Tokens).

---

## 🛠️ Technology Stack

**Frontend (Client)**
* **React.js:** UI component architecture and state management.
* **Framer Motion & Canvas Confetti:** Fluid UI transitions and gamified level-up celebration animations.
* **Chart.js & react-chartjs-2:** Data visualization for user consistency graphs.
* **Cloudinary SDK:** Direct-to-cloud image uploads for profile pictures.
* **Axios:** Handling HTTP requests to the backend API.
* **Vercel:** Live frontend deployment.

**Backend (Server)**
* **Node.js & Express.js:** RESTful API architecture.
* **MongoDB & Mongoose:** NoSQL database for flexible time-series data storage.
* **JSON Web Tokens (JWT):** Secure, stateless user authentication.
* **Render:** Live backend deployment.

---

## 🧠 Core Logic & Algorithms

### The Streak Calculation Engine
The core retention mechanic of HabitForge relies on accurately tracking user consistency. The streak algorithm executes entirely on the Node.js backend to prevent client-side manipulation. 

**Handling Missed Days & Increments:**
1. When a user marks a habit as complete, the system retrieves the `completedDates` array.
2. It evaluates the time delta between the current server date and the last recorded entry.
3. **Increment:** If the difference is exactly 1 day (the user checked in yesterday), the `currentStreak` increments by 1.
4. **Maintain:** If the difference is 0 days (the user already checked in today), the API rejects the request to prevent duplicate XP farming.
5. **Reset:** If the delta is strictly greater than 1 day, the user has missed at least one day. The `currentStreak` is immediately reset to `1` (accounting for the new check-in), breaking the previous streak.

### The Timezone Solution (UTC Normalization)
A common bug in daily tracking apps occurs when a server's local timezone differs from the user's timezone, leading to broken streaks or double-counting. 

To solve this, HabitForge utilizes **UTC Normalization**. Before comparing dates, both the current timestamp and the historical timestamps are stripped of their time components using:

`date.setUTCHours(0, 0, 0, 0)`

By flattening all dates to UTC Midnight, the application ensures that a check-in at 11:50 PM and a subsequent check-in at 1:00 AM the next day are accurately calculated as a 2-day streak, completely immune to geographic timezone shifts.

---

## 💻 Local Installation

To run HabitForge locally on your machine, follow these steps:

**1. Clone the repository**
```bash
git clone [https://github.com/umamidhunkumar2005-svg/habitforge-v1.git](https://github.com/umamidhunkumar2005-svg/habitforge-v1.git)
cd habitforge-v1

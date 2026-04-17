# HabitForge ⚒️🐉

HabitForge is a full-stack, gamified productivity web application designed to help users build and maintain positive daily habits. By integrating RPG-style mechanics (XP, Leveling, and Streaks) with a global multiplayer leaderboard, HabitForge turns daily self-improvement into an engaging, competitive game.

**🚀 Live Demo:** [HabitForge on Vercel](https://habitforge-v1-git-main-habit-forge-team.vercel.app)

---

## 🎮 Core Features

* **Gamified Progression & Achievements:** Earn 20 XP for every habit completed to level up. Maintain streaks to unlock badges like "Bronze Streak 🥉" and "Consistency King 👑" in your Trophy Room.
* **Data Visualization:** Built-in `Chart.js` integration to visually track 7-day habit completion consistency.
* **Freemium SaaS Model:** Core tracking is free (up to 3 habits). Upgrading to the Pro tier unlocks unlimited habits and advanced analytics.
* **Full CRUD Functionality:** Users can Create, Read, Update (Edit), and Delete their daily habits.
* **Streak Tracking:** Built-in daily tracking to visually monitor habit consistency (🔥).
* **Multiplayer Leaderboard:** A real-time "Hall of Fame" that ranks the top 10 users globally based on their Level and XP.
* **Secure Authentication:** User registration and login powered by encrypted passwords (bcrypt) and JWT (JSON Web Tokens).

---

## 🛠️ Technology Stack

**Frontend (Client)**
* **React.js:** UI component architecture.
* **Chart.js & react-chartjs-2:** Data visualization for user consistency graphs.
* **Axios:** Handling HTTP requests to the backend API.
* **CSS3:** Custom styling and responsive design.
* **Vercel:** Live frontend deployment.

**Backend (Server)**
* **Node.js & Express.js:** RESTful API architecture.
* **MongoDB & Mongoose:** NoSQL database for flexible data storage.
* **JSON Web Tokens (JWT):** Secure, stateless user authentication.
* **Render:** Live backend deployment.

---

## 🧠 Logic Documentation: Streak Calculation Algorithm

HabitForge calculates streaks dynamically to ensure accuracy and prevent cheating. When a user completes a habit, the system checks the `completedDates` array utilizing modular gamification logic. 

* **Timezone Handling:** The server converts the current date and the `lastCompletedDate` to UTC and sets the hours to `0:00:00`. This ensures that users across different global timezones are evaluated strictly on absolute calendar days.
* **Missed Days & Resets:** The algorithm calculates the absolute difference in days between the last completion and today. 
  * If the difference is exactly `1`, the streak increments. 
  * If the difference is greater than `1`, the user missed a day and the streak resets to `1`. 
  * If the difference is `0`, the completion is rejected (Anti-Cheat mechanism preventing multiple XP gains in a single day).

---

## 💻 Local Installation

To run HabitForge locally on your machine, follow these steps:

**1. Clone the repository**
```bash
git clone [https://github.com/umamidhunkumar2005-svg/habitforge-v1.git](https://github.com/umamidhunkumar2005-svg/habitforge-v1.git)
cd habitforge-v1

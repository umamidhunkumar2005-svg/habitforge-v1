require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Models & Middleware
const User = require('./models/User');
const Habit = require('./models/Habit');
const auth = require('./middleware/auth'); // Import the security bouncer

const app = express();
const port = process.env.PORT || 10000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

// Debugging check for the logs
console.log("Checking User Model:", typeof User.findOne === 'function' ? "LOADED SUCCESSFULLY ✅" : "LOAD FAILED ❌");

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connection: SUCCESS!'))
  .catch((err) => console.error('Database Connection: FAILED...', err));

// --- AUTH ROUTES ---

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed", detail: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Updated Login to send XP and Level on load
    res.json({ token, user: { id: user._id, email: user.email, xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- PROTECTED HABIT ROUTES (Only for Logged-in Users) ---

// 1. Fetch habits
app.get('/api/habits', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId }); 
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

// 2. Create habit
app.post('/api/habits', auth, async (req, res) => {
  try {
    const newHabit = new Habit({
      title: req.body.title,
      description: req.body.description || "",
      user: req.userId
    });
    const savedHabit = await newHabit.save(); 
    res.status(201).json(savedHabit); 
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: "Failed to create habit", detail: error.message });
  }
});

// 3. Complete Habit (THE RPG ENGINE 🐉)
app.put('/api/habits/:id/complete', auth, async (req, res) => {
  try {
    // A. Find the Habit
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ error: "Habit not found or not owned by you" });

    // B. Anti-Cheat (Once per day check)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (habit.completedDates.length > 0) {
      const lastCompletion = new Date(habit.completedDates[habit.completedDates.length - 1]);
      lastCompletion.setUTCHours(0, 0, 0, 0);
      if (lastCompletion.getTime() === today.getTime()) {
        return res.status(400).json({ message: "Already completed today!" });
      }
    }

    // C. Update Habit Streaks
    habit.completedDates.push(new Date());
    habit.currentStreak += 1;
    if (habit.currentStreak > habit.longestStreak) habit.longestStreak = habit.currentStreak;
    const updatedHabit = await habit.save();

    // D. NEW: THE RPG SYSTEM (Update User XP & Level)
    const user = await User.findById(req.userId);
    
    // Give 10 XP per completion
    let newXp = user.xp + 10;
    let newLevel = user.level;

    // Level Up Logic! Every 100 XP is a new level.
    if (newXp >= 100) {
      newLevel += 1;       // Increase Level
      newXp = newXp - 100; // Reset XP toward the next 100
    }

    user.xp = newXp;
    user.level = newLevel;
    await user.save();

    // E. Send BOTH the updated habit and the updated user stats back to the frontend
    res.status(200).json({
      habit: updatedHabit,
      userStats: { xp: user.xp, level: user.level }
    });

  } catch (error) {
    console.error("Complete Habit Error:", error);
    res.status(500).json({ error: "Failed to update habit" });
  }
});

// 4. Delete Habit
app.delete('/api/habits/:id', auth, async (req, res) => {
  try {
    const deletedHabit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deletedHabit) return res.status(404).json({ error: "Habit not found" });
    res.status(200).json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
// 5. The Multiplayer Leaderboard (Hall of Fame)
app.get('/api/leaderboard', async (req, res) => {
  try {
    // 1. Fetch the top 10 users, sorted by Level (highest first), then XP (highest first)
    // We only ask for the email, level, and xp fields to save memory.
    const topUsers = await User.find({}, 'email level xp')
      .sort({ level: -1, xp: -1 })
      .limit(10);

    // 2. Privacy Masking: Hide full emails before sending to the frontend
    const safeLeaderboard = topUsers.map(user => {
      const emailParts = user.email.split('@');
      const maskedName = emailParts[0].substring(0, 2) + '***'; // Grabs first 2 letters
      return { 
        _id: user._id, 
        name: maskedName, 
        level: user.level, 
        xp: user.xp 
      };
    });

    // 3. Send the safe data to the client
    res.status(200).json(safeLeaderboard);

  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ error: "Failed to fetch the Hall of Fame" });
  }
});

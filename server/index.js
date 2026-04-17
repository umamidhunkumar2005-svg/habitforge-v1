require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Models, Middleware & Utilities
const User = require('./models/User');
const Habit = require('./models/Habit');
const auth = require('./middleware/auth'); 
const { calculateLevelProgress, calculateStreak } = require('./utils/gamification'); // NEW: Modular Gamification Engine

const app = express();
const port = process.env.PORT || 10000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connection: SUCCESS!'))
  .catch((err) => console.error('Database Connection: FAILED...', err));

// --- AUTH ROUTES ---
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, user: { id: user._id, email: user.email, xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- PROTECTED HABIT ROUTES ---
app.get('/api/habits', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId }); 
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

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
    res.status(500).json({ error: "Failed to create habit", detail: error.message });
  }
});

// 3. Complete Habit (THE RPG ENGINE 🐉)
app.put('/api/habits/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Anti-Cheat
    if (habit.completedDates.length > 0) {
      const lastCompletion = new Date(habit.completedDates[habit.completedDates.length - 1]);
      lastCompletion.setUTCHours(0, 0, 0, 0);
      if (lastCompletion.getTime() === today.getTime()) {
        return res.status(400).json({ message: "Already completed today!" });
      }
    }

    // --- USE THE MODULAR UTILITY FOR STREAKS ---
    habit.currentStreak = calculateStreak(habit.completedDates, habit.currentStreak);
    habit.completedDates.push(new Date()); 
    if (habit.currentStreak > habit.longestStreak) habit.longestStreak = habit.currentStreak;
    
    const updatedHabit = await habit.save();
    const user = await User.findById(req.userId);
    
    // --- USE THE MODULAR UTILITY FOR XP & LEVEL ---
    const { newXp, newLevel } = calculateLevelProgress(user.xp, user.level);

    user.xp = newXp;
    user.level = newLevel;
    await user.save();

    res.status(200).json({
      habit: updatedHabit,
      userStats: { xp: user.xp, level: user.level }
    });

  } catch (error) {
    console.error("Complete Habit Error:", error);
    res.status(500).json({ error: "Failed to update habit" });
  }
});

app.delete('/api/habits/:id', auth, async (req, res) => {
  try {
    const deletedHabit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deletedHabit) return res.status(404).json({ error: "Habit not found" });
    res.status(200).json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.put('/api/habits/:id/edit', auth, async (req, res) => {
  try {
    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title: req.body.title },
      { new: true }
    );
    if (!updatedHabit) return res.status(404).json({ error: "Habit not found" });
    res.status(200).json(updatedHabit);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit habit" });
  }
});

// 5. Multiplayer Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({}, 'email level xp').sort({ level: -1, xp: -1 }).limit(10);
    const safeLeaderboard = topUsers.map(user => {
      const emailParts = user.email.split('@');
      const maskedName = emailParts[0].substring(0, 2) + '***';
      return { _id: user._id, name: maskedName, level: user.level, xp: user.xp };
    });
    res.status(200).json(safeLeaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Hall of Fame" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

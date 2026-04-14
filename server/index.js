require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Models
const User = require('./models/User');
const Habit = require('./models/Habit');

const app = express();
const port = process.env.PORT || 10000;

// --- MIDDLEWARE ---
// Always put these BEFORE your routes
app.use(cors()); 
app.use(express.json()); 

// Debugging check: This will print in your Render logs to confirm User model loaded
console.log("Checking User Model:", typeof User.findOne === 'function' ? "LOADED SUCCESSFULLY ✅" : "LOAD FAILED ❌");

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connection: SUCCESS!'))
  .catch((err) => console.error('Database Connection: FAILED...', err));

// --- AUTH ROUTES ---

// Register
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
    console.error("Reg Error Detail:", error);
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
    res.json({ token, user: { id: user._id, email: user.email, xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- HABIT ROUTES ---

app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const newHabit = new Habit({
      title: req.body.title,
      description: req.body.description
    });
    const savedHabit = await newHabit.save(); 
    res.status(201).json(savedHabit); 
  } catch (error) {
    res.status(500).json({ error: "Failed to create habit" });
  }
});

// Complete Habit (GAMIFICATION ENGINE)
app.put('/api/habits/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (habit.completedDates.length > 0) {
      const lastCompletion = new Date(habit.completedDates[habit.completedDates.length - 1]);
      lastCompletion.setUTCHours(0, 0, 0, 0);
      if (lastCompletion.getTime() === today.getTime()) {
        return res.status(400).json({ message: "Already completed today!" });
      }
    }

    habit.completedDates.push(new Date());
    habit.currentStreak += 1;
    if (habit.currentStreak > habit.longestStreak) habit.longestStreak = habit.currentStreak;

    const updatedHabit = await habit.save();
    res.status(200).json(updatedHabit);
  } catch (error) {
    res.status(500).json({ error: "Failed to update habit" });
  }
});

// Delete Habit
app.delete('/api/habits/:id', async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

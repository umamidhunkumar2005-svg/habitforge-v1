const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import the User model
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Import your new Habit model
const Habit = require('./models/Habit');

const app = express();
// Render needs this specific port setup to work!
const port = process.env.PORT || 5000; 

// 2. Middleware: This allows your server to read JSON data and bypass CORS
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connection: SUCCESS!'))
  .catch((err) => console.log('Database Connection: FAILED...', err));

// --- API ROUTES ---

// Get All Habits
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

// The "Create Habit" Route
app.post('/api/habits', async (req, res) => {
  try {
    const newHabit = new Habit({
      title: req.body.title,
      description: req.body.description
    });
    const savedHabit = await newHabit.save(); 
    res.status(201).json(savedHabit); 
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to create habit" });
  }
});

// The "Complete Habit" Route (GAMIFICATION ENGINE)
app.put('/api/habits/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    // --- ANTI-CHEAT LOGIC ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (habit.completedDates.length > 0) {
      const lastCompletion = new Date(habit.completedDates[habit.completedDates.length - 1]);
      lastCompletion.setUTCHours(0, 0, 0, 0);

      if (lastCompletion.getTime() === today.getTime()) {
        return res.status(400).json({ 
          message: "You already completed this habit today! Come back tomorrow." 
        });
      }
    }

    // 1. Record that they did it today
    habit.completedDates.push(new Date());
    // 2. Increase their streak score
    habit.currentStreak += 1;
    // 3. Check for a new high score!
    if (habit.currentStreak > habit.longestStreak) {
      habit.longestStreak = habit.currentStreak;
    }

    const updatedHabit = await habit.save();
    res.status(200).json(updatedHabit);

  } catch (error) {
    res.status(500).json({ error: "Failed to update habit" });
  }
});

// The "Delete Habit" Route (CLEANUP CREW)
app.delete('/api/habits/:id', async (req, res) => {
  try {
    const deletedHabit = await Habit.findByIdAndDelete(req.params.id);
    
    if (!deletedHabit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    res.status(200).json({ message: "Habit deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

// Start Server
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password (Scramble it for safety)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT Token (The digital wristband)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, email: user.email, xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
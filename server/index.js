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
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- PROTECTED HABIT ROUTES (Only for Logged-in Users) ---

// 1. Fetch habits (Only ones owned by the logged-in user)
app.get('/api/habits', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId }); 
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

// 2. Create habit (Stamps it with the User ID)
app.post('/api/habits', auth, async (req, res) => {
  try {
    const newHabit = new Habit({
      title: req.body.title,
      description: req.body.description || "",
      user: req.userId // This is critical for security!
    });
    const savedHabit = await newHabit.save(); 
    res.status(201).json(savedHabit); 
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: "Failed to create habit", detail: error.message });
  }
});

// 3. Complete Habit (Gamification Engine)
app.put('/api/habits/:id/complete', auth, async (req, res) => {
  try {
    // Ensure the user owns the habit they are trying to complete
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ error: "Habit not found or not owned by you" });

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

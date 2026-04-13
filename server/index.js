require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Import your new Habit model
const Habit = require('./models/Habit');

const app = express();
const port = 5000;

// 2. Middleware: This allows your server to read JSON data and bypass CORS
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connection: SUCCESS!'))
  .catch((err) => console.log('Database Connection: FAILED...', err));

// --- API ROUTES ---

// 3. The "Create Habit" Route
app.post('/api/habits', async (req, res) => {
  try {
    // Grab the data sent from the user
    const newHabit = new Habit({
      title: req.body.title,
      description: req.body.description
    });

    // Save it to the database
    const savedHabit = await newHabit.save(); 
    
    // Send the saved data back as proof it worked
    res.status(201).json(savedHabit); 
  } catch (error) {
    res.status(500).json({ error: "Failed to create habit" });
  }
});
// 5. The "Complete Habit" Route (Gamification Engine)

// 5. The "Complete Habit" Route (GAMIFICATION ENGINE v2.0)
app.put('/api/habits/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    // --- ANTI-CHEAT LOGIC ---
    // Get today's date and rewind the clock to exactly Midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if they have ever completed this habit before
    if (habit.completedDates.length > 0) {
      // Find the last time they clicked 'Done' and rewind THAT to Midnight
      const lastCompletion = new Date(habit.completedDates[habit.completedDates.length - 1]);
      lastCompletion.setUTCHours(0, 0, 0, 0);

      // Compare the two midnights. If they match, it's the exact same day! Block them.
      if (lastCompletion.getTime() === today.getTime()) {
        return res.status(400).json({ 
          message: "You already completed this habit today! Come back tomorrow." 
        });
      }
    }
    // ------------------------

    // 1. Record that they did it today
    habit.completedDates.push(new Date());

    // 2. Increase their streak score
    habit.currentStreak += 1;

    // 3. Check for a new high score!
    if (habit.currentStreak > habit.longestStreak) {
      habit.longestStreak = habit.currentStreak;
    }

    // Save the updated data back to the database
    const updatedHabit = await habit.save();
    
    // Send the updated habit back to see the new score
    res.status(200).json(updatedHabit);

  } catch (error) {
    res.status(500).json({ error: "Failed to update habit" });
  }
});
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
}); 
// 6. The "Delete Habit" Route (CLEANUP CREW)
app.delete('/api/habits/:id', async (req, res) => {
  try {
    // Find the specific habit and erase it from MongoDB forever
    const deletedHabit = await Habit.findByIdAndDelete(req.params.id);
    
    if (!deletedHabit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    res.status(200).json({ message: "Habit deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete habit" });
  }
});
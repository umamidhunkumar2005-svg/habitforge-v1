const mongoose = require('mongoose');

// This is the blueprint for every habit in your app
const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  // We store an array of dates to know exactly when they clicked "Done"
  completedDates: [{
    type: Date
  }]
}, { timestamps: true }); // This automatically adds 'createdAt' and 'updatedAt'

// Compile the blueprint into a Model
const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // --- NEW: METADATA FOR PHASE 1 ---
  frequency: { type: String, enum: ['Daily', 'Weekly'], default: 'Daily' },
  color: { type: String, default: '#3498db' }, // Default blue
  icon: { type: String, default: '🎯' }, // Default target emoji
  
  // Gamification stats
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completedDates: { type: [Date], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Habit', HabitSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- NEW: Profile Picture Storage ---
  profilePicUrl: { type: String, default: '' }, 
  
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: { type: [String], default: [] },
  isPremium: { type: Boolean, default: false } 
});

module.exports = mongoose.model('User', UserSchema);

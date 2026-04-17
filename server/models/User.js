const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: { type: [String], default: [] },
  isPremium: { type: Boolean, default: false } // <-- NEW: Pro Status
});

module.exports = mongoose.model('User', UserSchema);

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Habit = require('./models/Habit');

const seedDatabase = async () => {
  try {
    console.log("🌱 Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");

    // 1. Create the Demo User
    const email = "demo@habitforge.com";
    const password = await bcrypt.hash("demo123", 10);
    
    // Check if demo user already exists
    let demoUser = await User.findOne({ email });
    if (!demoUser) {
      demoUser = new User({
        email,
        password,
        xp: 85,
        level: 12, // High level from 3 months of playing!
        isPremium: true,
        badges: ["Bronze Streak 🥉", "Consistency King 👑"]
      });
      await demoUser.save();
      console.log("👤 Demo User Created: demo@habitforge.com / pw: demo123");
    } else {
      console.log("👤 Demo User already exists, adding habits to them...");
    }

    // 2. Generate 90 days of history
    const completedDates = [];
    for (let i = 90; i >= 0; i--) {
      // Simulate completing the habit 80% of the time
      if (Math.random() > 0.2) { 
        const date = new Date();
        date.setDate(date.getDate() - i);
        completedDates.push(date);
      }
    }

    // 3. Create a Habit with that history
    const demoHabit = new Habit({
      title: "Read 30 pages",
      user: demoUser._id,
      currentStreak: 5,
      longestStreak: 22,
      completedDates: completedDates
    });

    await demoHabit.save();
    console.log("📈 3 Months of Historical Data Injected!");

    console.log("🎉 Seeding Complete. You can close this process (Ctrl+C).");
    process.exit();

  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedDatabase();

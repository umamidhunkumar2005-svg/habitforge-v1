// server/utils/gamification.js

// Calculate XP and check for Level Up
const calculateLevelProgress = (currentXp, currentLevel) => {
    let newXp = currentXp + 20;
    let newLevel = currentLevel;

    if (newXp >= 100) {
        newLevel += 1;
        newXp = newXp - 100;
    }

    return { newXp, newLevel };
};

// Calculate Streak (Handles missed days)
const calculateStreak = (completedDates, currentStreak) => {
    if (!completedDates || completedDates.length === 0) {
        return 1; // First time completing
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const lastCompletion = new Date(completedDates[completedDates.length - 1]);
    lastCompletion.setUTCHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = Math.abs(today - lastCompletion);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        // Completed yesterday, streak continues!
        return currentStreak + 1;
    } else if (diffDays > 1) {
        // Missed a day or more, streak resets! 😭
        return 1; 
    } else {
        // Already completed today (Anti-cheat fallback)
        return currentStreak;
    }
};

module.exports = { calculateLevelProgress, calculateStreak };

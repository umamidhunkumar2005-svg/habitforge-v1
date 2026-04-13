import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [habits, setHabits] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Gamification State
  const [level, setLevel] = useState(parseInt(localStorage.getItem('forgeLevel')) || 1);
  const [xp, setXp] = useState(parseInt(localStorage.getItem('forgeXp')) || 0);
  
  // NEW: Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const fetchHabits = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/habits');
      setHabits(response.data);
    } catch (error) {
      console.error("The backend isn't answering:", error);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Toggle Theme Function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Add Habit
  const handleAddHabit = async (e) => {
    e.preventDefault(); 
    if (!newTitle.trim()) return; 

    try {
      const response = await axios.post('http://localhost:5000/api/habits', {
        title: newTitle,
        description: newDesc
      });
      setHabits([...habits, response.data]);
      setNewTitle('');
      setNewDesc('');
    } catch (error) {
      alert("Failed to create habit!");
    }
  };

  // Check-In
  const handleCheckIn = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/habits/${id}/complete`);
      setHabits(habits.map(habit => habit._id === id ? response.data : habit));

      let newXp = xp + 10;
      let newLevel = level;

      if (newXp >= 100) {
        newLevel += 1;   
        newXp = newXp - 100; 
        alert(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
      }

      setLevel(newLevel);
      setXp(newXp);
      localStorage.setItem('forgeLevel', newLevel);
      localStorage.setItem('forgeXp', newXp);

    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); 
      } else {
        alert("Something went wrong!");
      }
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      try {
        await axios.delete(`http://localhost:5000/api/habits/${id}`);
        setHabits(habits.filter(habit => habit._id !== id));
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  return (
    // NEW: We inject a "dark-mode" class here if the toggle is ON
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      
      <div className="player-banner">
        <div className="level-badge">LVL {level}</div>
        <div className="xp-section">
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${xp}%` }}></div>
          </div>
          <span className="xp-text">{xp} / 100 XP</span>
        </div>
      </div>

      {/* NEW: Header Container with Toggle Button */}
      <header className="app-header">
        <h1>HabitForge</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="form-container">
        <form onSubmit={handleAddHabit} className="add-habit-form">
          <input 
            type="text" 
            placeholder="New Habit (e.g., Read 30 mins)" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            className="habit-input"
          />
          <input 
            type="text" 
            placeholder="Why? (Optional)" 
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="habit-input"
          />
          <button type="submit" className="add-btn">Forge Habit 🔨</button>
        </form>
      </div>

      {habits.length > 0 && (
        <div className="chart-container">
          <h2>Streak Analytics 📈</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={habits}>
              <XAxis dataKey="title" stroke={isDarkMode ? '#ecf0f1' : '#2c3e50'} />
              <YAxis allowDecimals={false} stroke={isDarkMode ? '#ecf0f1' : '#2c3e50'} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: isDarkMode ? '#1a1a2e' : 'white', color: isDarkMode ? 'white' : 'black' }} />
              <Bar dataKey="currentStreak" fill="#3498db" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="habit-list">
        {habits.map(habit => (
          <div key={habit._id} className="habit-card">
            <h3>{habit.title}</h3>
            {habit.description && <p className="habit-desc">{habit.description}</p>}
            <p className="streak-text">Streak: {habit.currentStreak} 🔥</p>
            
            <div className="button-group">
              <button className="check-in-btn" onClick={() => handleCheckIn(habit._id)}>
                Check In
              </button>
              <button className="delete-btn" onClick={() => handleDelete(habit._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

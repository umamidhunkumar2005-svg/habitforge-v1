import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');

  // --- NEW: RPG STATE ---
  const [xp, setXp] = useState(parseInt(localStorage.getItem('xp')) || 0);
  const [level, setLevel] = useState(parseInt(localStorage.getItem('level')) || 1);

  // The Digital Wristband
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (token) {
      axios.get('https://habitforge-backend-7ab6.onrender.com/api/habits', config)
        .then(res => setHabits(res.data))
        .catch(err => console.log("Fetch Error:", err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('xp');
    localStorage.removeItem('level');
    setToken(null);
  };

  const addHabit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://habitforge-backend-7ab6.onrender.com/api/habits', { title }, config);
      setHabits([...habits, res.data]);
      setTitle('');
    } catch (err) {
      console.log("Add Error:", err);
    }
  };

  // --- UPDATED: THE GAMIFICATION ENGINE ---
  const completeHabit = async (id) => {
    try {
      // 1. Send the completion request
      const res = await axios.put(`https://habitforge-backend-7ab6.onrender.com/api/habits/${id}/complete`, {}, config);
      
      // 2. The backend now returns { habit, userStats }!
      // Update the habit in the list
      setHabits(habits.map(habit => habit._id === id ? res.data.habit : habit));
      
      // 3. Update the Player Stats!
      setXp(res.data.userStats.xp);
      setLevel(res.data.userStats.level);
      
      // Save stats so they survive a page refresh
      localStorage.setItem('xp', res.data.userStats.xp);
      localStorage.setItem('level', res.data.userStats.level);
      
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  const deleteHabit = async (id) => {
    try {
      await axios.delete(`https://habitforge-backend-7ab6.onrender.com/api/habits/${id}`, config);
      setHabits(habits.filter(habit => habit._id !== id));
    } catch (err) {
      console.log("Delete Error:", err);
    }
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h2>HabitForge ⚒️</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout 🚪</button>
      </nav>

      <div className="dashboard">
        
        {/* --- NEW: PLAYER STATS UI --- */}
        <div className="player-stats" style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f1c40f' }}>Level {level}</h3>
          
          {/* The XP Progress Bar */}
          <div className="xp-bar-container" style={{ backgroundColor: '#1a252f', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
            <div className="xp-bar" style={{ width: `${xp}%`, backgroundColor: '#f1c40f', height: '100%', transition: 'width 0.5s ease-in-out' }}></div>
          </div>
          
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bdc3c7', fontWeight: 'bold' }}>XP: {xp} / 100</p>
        </div>

        <section className="forge-area">
          <h3>Forge a New Habit</h3>
          <form onSubmit={addHabit}>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Code for 1 hour" 
            />
            <button type="submit" className="forge-btn">Forge Habit ⚒️</button>
          </form>
        </section>

        <section className="habit-display">
          {habits.map(habit => (
            <div key={habit._id} className="habit-card">
              <h4>{habit.title}</h4>
              <p>Streak: {habit.currentStreak} 🔥</p>
              
              <div className="button-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  className="complete-btn" 
                  onClick={() => completeHabit(habit._id)}
                >
                  Done! ✅
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => deleteHabit(habit._id)}
                  style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Trash 🗑️
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;

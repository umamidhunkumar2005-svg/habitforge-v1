import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');

  // --- RPG STATE ---
  const [xp, setXp] = useState(parseInt(localStorage.getItem('xp')) || 0);
  const [level, setLevel] = useState(parseInt(localStorage.getItem('level')) || 1);
  
  // --- NEW: MULTIPLAYER STATE ---
  const [leaderboard, setLeaderboard] = useState([]);

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (token) {
      // Fetch Personal Habits
      axios.get('https://habitforge-api-tpbd.onrender.com/api/habits', config)
        .then(res => setHabits(res.data))
        .catch(err => console.log("Fetch Error:", err));

      // Fetch Global Leaderboard
      axios.get('https://habitforge-api-tpbd.onrender.com/api/leaderboard')
        .then(res => setLeaderboard(res.data))
        .catch(err => console.log("Leaderboard Fetch Error:", err));
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
      const res = await axios.post('https://habitforge-api-tpbd.onrender.com/api/habits', { title }, config);
      setHabits([...habits, res.data]);
      setTitle('');
    } catch (err) {
      console.log("Add Error:", err);
    }
  };

  const completeHabit = async (id) => {
    try {
      const res = await axios.put(`https://habitforge-api-tpbd.onrender.com/api/habits/${id}/complete`, {}, config);
      setHabits(habits.map(habit => habit._id === id ? res.data.habit : habit));
      
      setXp(res.data.userStats.xp);
      setLevel(res.data.userStats.level);
      localStorage.setItem('xp', res.data.userStats.xp);
      localStorage.setItem('level', res.data.userStats.level);
      
      // Refresh the leaderboard silently
      axios.get('https://habitforge-api-tpbd.onrender.com/api/leaderboard')
        .then(res => setLeaderboard(res.data));

    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  const deleteHabit = async (id) => {
    try {
      await axios.delete(`https://habitforge-api-tpbd.onrender.com/api/habits/${id}`, config);
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

      <div className="dashboard" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        
        {/* Left Column: Stats & Habits */}
        <div className="main-content" style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
          
          {/* PLAYER STATS UI - UPDATED XP BAR */}
          <div className="player-stats" style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f1c40f' }}>Level {level}</h3>
            
            <div className="xp-bar-container" style={{ backgroundColor: '#1a252f', height: '25px', borderRadius: '12px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
              {/* The actual progress bar */}
              <div className="xp-bar" style={{ 
                  width: `${xp}%`, 
                  backgroundColor: '#f1c40f', 
                  height: '100%', 
                  transition: 'width 0.5s ease-in-out' 
              }}></div>
              
              {/* XP Text Overlay */}
              <span style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  textAlign: 'center', 
                  top: '2px', 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: xp > 50 ? '#2c3e50' : 'white',
                  textShadow: xp <= 50 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
              }}>
                {xp} / 100 XP
              </span>
            </div>
            
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#bdc3c7' }}>Forge 5 habits to reach the next level!</p>
          </div>

          <section className="forge-area" style={{ marginBottom: '20px' }}>
            <h3>Forge a New Habit</h3>
            <form onSubmit={addHabit}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Code for 1 hour" />
              <button type="submit" className="forge-btn">Forge Habit ⚒️</button>
            </form>
          </section>

          <section className="habit-display">
            {habits.map(habit => (
              <div key={habit._id} className="habit-card">
                <h4>{habit.title}</h4>
                <p>Streak: {habit.currentStreak} 🔥</p>
                <div className="button-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="complete-btn" onClick={() => completeHabit(habit._id)}>Done! ✅</button>
                  <button className="delete-btn" onClick={() => deleteHabit(habit._id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Trash 🗑️</button>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="multiplayer-sidebar" style={{ flex: '1', minWidth: '250px', maxWidth: '350px' }}>
          <div className="leaderboard-card" style={{ backgroundColor: '#fdfbf7', border: '2px solid #e0dcd3', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: '0', color: '#2c3e50', borderBottom: '2px solid #f1c40f', paddingBottom: '10px' }}>Hall of Fame 🏆</h3>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {leaderboard.map((user, index) => (
                <li key={user._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 'bold', color: index === 0 ? '#d35400' : '#34495e' }}>
                    #{index + 1} {user.name}
                  </span>
                  <span style={{ color: '#7f8c8d' }}>
                    Lvl {user.level}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import ConsistencyChart from './ConsistencyChart'; 
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [habits, setHabits] = useState([]);
  
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [color, setColor] = useState('#3498db');
  const [icon, setIcon] = useState('🎯');

  const [xp, setXp] = useState(parseInt(localStorage.getItem('xp')) || 0);
  const [level, setLevel] = useState(parseInt(localStorage.getItem('level')) || 1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState(JSON.parse(localStorage.getItem('badges')) || []); 
  const [isPremium, setIsPremium] = useState(localStorage.getItem('isPremium') === 'true');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (token) {
      axios.get('https://habitforge-api-tpbd.onrender.com/api/habits', config)
        .then(res => setHabits(res.data))
        .catch(err => console.log("Fetch Error:", err));

      axios.get('https://habitforge-api-tpbd.onrender.com/api/leaderboard')
        .then(res => setLeaderboard(res.data))
        .catch(err => console.log("Leaderboard Fetch Error:", err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('xp');
    localStorage.removeItem('level');
    localStorage.removeItem('badges'); 
    localStorage.removeItem('isPremium');
    setToken(null);
  };

  const upgradeToPro = async () => {
    try {
      await axios.put('https://habitforge-api-tpbd.onrender.com/api/auth/upgrade', {}, config);
      setIsPremium(true);
      localStorage.setItem('isPremium', 'true');
      alert("💎 Welcome to Pro! Analytics unlocked and limits removed.");
    } catch (err) {
      console.log(err);
    }
  };

  // --- NEW: CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    if (habits.length === 0) return alert("No habits to export!");

    const headers = ["Habit Title", "Frequency", "Current Streak", "Longest Streak", "Total Completions"];
    const rows = habits.map(habit => [
      `"${habit.title}"`, 
      habit.frequency || 'Daily', 
      habit.currentStreak, 
      habit.longestStreak, 
      habit.completedDates.length
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "HabitForge_Data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!isPremium && habits.length >= 3) {
      alert("Free tier limit reached! Please upgrade to Pro to forge more habits. 💎");
      return;
    }
    try {
      const res = await axios.post('https://habitforge-api-tpbd.onrender.com/api/habits', { 
        title, frequency, color, icon 
      }, config);
      
      setHabits([...habits, res.data]);
      setTitle('');
      setIcon('🎯'); 
    } catch (err) {
      alert(err.response?.data?.message || "Error adding habit");
    }
  };

  const completeHabit = async (id) => {
    try {
      const res = await axios.put(`https://habitforge-api-tpbd.onrender.com/api/habits/${id}/complete`, {}, config);
      setHabits(habits.map(habit => habit._id === id ? res.data.habit : habit));
      
      setXp(res.data.userStats.xp);
      setLevel(res.data.userStats.level);
      setBadges(res.data.userStats.badges || []); 
      
      localStorage.setItem('xp', res.data.userStats.xp);
      localStorage.setItem('level', res.data.userStats.level);
      localStorage.setItem('badges', JSON.stringify(res.data.userStats.badges || [])); 
      
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

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`https://habitforge-api-tpbd.onrender.com/api/habits/${id}/edit`, { title: editTitle }, config);
      setHabits(habits.map(habit => habit._id === id ? res.data : habit));
      setEditingId(null); 
    } catch (err) {
      console.log("Edit Error:", err);
    }
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h2>HabitForge {isPremium ? '💎 PRO' : '⚒️'}</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout 🚪</button>
      </nav>

      <div className="dashboard" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        
        <div className="main-content" style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
          
          <div className="player-stats" style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#f1c40f' }}>Level {level}</h3>
              {/* --- NEW: CSV EXPORT BUTTON (PRO ONLY) --- */}
              {isPremium && (
                <button onClick={exportToCSV} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  Export Data (CSV) 📥
                </button>
              )}
            </div>
            
            <div className="xp-bar-container" style={{ backgroundColor: '#1a252f', height: '25px', borderRadius: '12px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
              <div className="xp-bar" style={{ width: `${xp}%`, backgroundColor: '#f1c40f', height: '100%', transition: 'width 0.5s ease-in-out' }}></div>
              <span style={{ position: 'absolute', width: '100%', textAlign: 'center', top: '2px', fontSize: '14px', fontWeight: 'bold', color: xp > 50 ? '#2c3e50' : 'white', textShadow: xp <= 50 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none' }}>
                {xp} / 100 XP
              </span>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#bdc3c7' }}>Forge habits to reach the next level!</p>

            {badges.length > 0 && (
              <div style={{ marginTop: '15px', borderTop: '1px solid #34495e', paddingTop: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#bdc3c7', fontSize: '14px' }}>Achievements 🏅</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {badges.map((badge, index) => (
                    <span key={index} style={{ backgroundColor: '#e67e22', color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            {isPremium ? (
              <ConsistencyChart habits={habits} />
            ) : (
              <div className="pro-paywall" style={{ backgroundColor: '#2c3e50', padding: '30px', borderRadius: '8px', textAlign: 'center', color: 'white', border: '2px dashed #f1c40f' }}>
                <h3 style={{ color: '#f1c40f', margin: '0 0 10px 0' }}>Unlock Advanced Analytics 📈</h3>
                <p style={{ color: '#bdc3c7', marginBottom: '20px' }}>Get the Consistency Graph, Heatmap, and CSV Export with HabitForge Pro.</p>
                <button onClick={upgradeToPro} style={{ backgroundColor: '#f1c40f', color: '#2c3e50', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', transition: '0.3s' }}>
                  Upgrade to Pro 💎
                </button>
              </div>
            )}
          </div>

          <section className="forge-area" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ marginTop: 0 }}>Forge a New Habit</h3>
            <form onSubmit={addHabit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={icon} onChange={(e) => setIcon(e.target.value)} style={{ padding: '10px', fontSize: '18px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                  <option value="🎯">🎯</option>
                  <option value="💧">💧</option>
                  <option value="📚">📚</option>
                  <option value="💪">💪</option>
                  <option value="🧘">🧘</option>
                  <option value="💻">💻</option>
                  <option value="🏃">🏃</option>
                  <option value="🎸">🎸</option>
                </select>
                <input style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Read 30 pages" required />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label style={{ fontSize: '14px', color: '#7f8c8d' }}>Color:</label>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '40px', height: '35px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                </div>
                <button type="submit" className="forge-btn" style={{ flex: 1, padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Forge ⚒️</button>
              </div>
            </form>
          </section>

          <section className="habit-display">
            {habits.map(habit => (
              <div key={habit._id} className="habit-card" style={{ borderLeft: `6px solid ${habit.color || '#3498db'}`, position: 'relative' }}>
                <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ecf0f1', color: '#7f8c8d', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                  {habit.frequency || 'Daily'}
                </span>
                
                {editingId === habit._id ? (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input 
                      style={{ flex: 1, padding: '5px' }}
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      autoFocus
                    />
                    <button onClick={() => saveEdit(habit._id)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Save 💾</button>
                    <button onClick={() => setEditingId(null)} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', margin: '0 0 10px 0' }}>
                    <span>{habit.icon || '🎯'}</span> {habit.title}
                  </h4>
                )}

                <p style={{ margin: '0 0 10px 0', color: '#34495e', fontWeight: 'bold' }}>Streak: {habit.currentStreak} 🔥</p>
                
                <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
                  <button className="complete-btn" onClick={() => completeHabit(habit._id)}>Done! ✅</button>
                  <button onClick={() => { setEditingId(habit._id); setEditTitle(habit.title); }} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Edit ✏️</button>
                  <button className="delete-btn" onClick={() => deleteHabit(habit._id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Trash 🗑️</button>
                </div>
              </div>
            ))}
          </section>
        </div>

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

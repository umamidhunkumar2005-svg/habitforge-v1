import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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
  const [badges, setBadges] = useState(JSON.parse(localStorage.getItem('badges')) || []); 
  const [isPremium, setIsPremium] = useState(localStorage.getItem('isPremium') === 'true');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Level Up Celebration Logic
  const prevLevel = useRef(level);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (level > prevLevel.current) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f1c40f', '#e67e22', '#2ecc71', '#ff9ff3']
      });
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 4000); 
    }
    prevLevel.current = level;
  }, [level]);

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (token) {
      axios.get('https://habitforge-api-tpbd.onrender.com/api/habits', config)
        .then(res => setHabits(res.data))
        .catch(err => console.log("Fetch Error:", err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
  };

  const upgradeToPro = async () => {
    try {
      await axios.put('https://habitforge-api-tpbd.onrender.com/api/auth/upgrade', {}, config);
      setIsPremium(true);
      localStorage.setItem('isPremium', 'true');
      alert("💎 Welcome to Pro!");
    } catch (err) {
      console.log(err);
    }
  };

  const exportToCSV = () => {
    if (habits.length === 0) return alert("No habits to export!");
    const headers = ["Habit Title", "Frequency", "Current Streak", "Longest Streak", "Total Completions"];
    const rows = habits.map(habit => [
      `"${habit.title}"`, habit.frequency || 'Daily', habit.currentStreak, habit.longestStreak, habit.completedDates.length
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
      alert("Free tier limit reached! Upgrade to Pro. 💎");
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
      alert("Error adding habit");
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
    } catch (err) {
      alert("Already completed today! ⚡");
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

  if (!token) return <Login setToken={setToken} />;

  return (
    <div className="App">
      <AnimatePresence>
        {showLevelUp && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} style={{ position: 'fixed', top: '50%', left: '50%', x: '-50%', y: '-50%', zIndex: 2000, textAlign: 'center', pointerEvents: 'none' }}>
            <h1 style={{ fontSize: '4rem', color: '#f1c40f', textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}>LEVEL UP! 🎊</h1>
            <div style={{ backgroundColor: 'white', padding: '10px 30px', borderRadius: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <h2 style={{ color: '#2c3e50', margin: 0 }}>Now Level {level} 🛡️</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="navbar">
        <h2>HabitForge {isPremium ? '💎 PRO' : '⚒️'}</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout 🚪</button>
      </nav>

      <div className="dashboard" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div className="main-content" style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
          
          <div className="player-stats" style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=HabitForgeLvl${level}`} style={{ width: '60px', height: '60px', backgroundColor: '#ecf0f1', borderRadius: '50%', border: '3px solid #f1c40f' }} alt="Avatar"/>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#f1c40f' }}>Level {level}</h3>
                  <p style={{ margin: '0', fontSize: '12px', color: '#bdc3c7' }}>Forge habits to reach the next level!</p>
                </div>
              </div>
              {isPremium && <button onClick={exportToCSV} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Export CSV 📥</button>}
            </div>
            <div className="xp-bar-container" style={{ backgroundColor: '#1a252f', height: '25px', borderRadius: '12px', position: 'relative', overflow: 'hidden', marginTop: '15px' }}>
              <motion.div animate={{ width: `${xp}%` }} style={{ backgroundColor: '#f1c40f', height: '100%' }} />
              <span style={{ position: 'absolute', width: '100%', textAlign: 'center', top: '2px', fontSize: '14px', fontWeight: 'bold' }}>{xp} / 100 XP</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            {isPremium ? <ConsistencyChart habits={habits} /> : <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'white' }}><h3>Unlock Analytics 📈</h3><button onClick={upgradeToPro} style={{ backgroundColor: '#f1c40f', color: '#2c3e50', padding: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Upgrade 💎</button></div>}
          </div>

          {/* --- RE-STYLED FORGE AREA FOR VISIBILITY --- */}
          <section className="forge-area" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{marginTop: 0}}>Forge a New Habit</h3>
            <form onSubmit={addHabit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={icon} onChange={(e) => setIcon(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                  <option value="🎯">🎯 Icon</option><option value="💧">💧 Water</option><option value="📚">📚 Read</option><option value="💪">💪 Gym</option>
                  <option value="🧘">🧘 Zen</option><option value="💻">💻 Code</option><option value="跑">🏃 Run</option><option value="🎸">🎸 Play</option>
                </select>
                <input style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Read 30 pages" required />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: '1', backgroundColor: 'white' }}>
                  <option value="Daily">Daily Frequency</option>
                  <option value="Weekly">Weekly Frequency</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }}>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>Border:</label>
                  <motion.input 
                    whileHover={{ scale: 1.1 }}
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    style={{ width: '45px', height: '38px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }} 
                  />
                </div>

                <button type="submit" style={{ flex: '1', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Forge ⚒️</button>
              </div>
            </form>
          </section>

          <section className="habit-display">
            <AnimatePresence>
              {habits.map(habit => (
                <motion.div key={habit._id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} className="habit-card" style={{ borderLeft: `6px solid ${habit.color || '#3498db'}`, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ecf0f1', color: '#7f8c8d', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{habit.frequency || 'Daily'}</span>
                  {editingId === habit._id ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input style={{ flex: 1, padding: '5px' }} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
                      <button onClick={() => saveEdit(habit._id)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Save</button>
                    </div>
                  ) : (
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', margin: '0 0 10px 0' }}><span>{habit.icon}</span> {habit.title}</h4>
                  )}
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Streak: {habit.currentStreak} 🔥</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="complete-btn" onClick={() => completeHabit(habit._id)}>Done! ✅</button>
                    <button onClick={() => { setEditingId(habit._id); setEditTitle(habit.title); }} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit ✏️</button>
                    <button onClick={() => deleteHabit(habit._id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Trash 🗑️</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        </div>

        <div className="multiplayer-sidebar" style={{ flex: '1', minWidth: '250px', maxWidth: '350px' }}>
          <div className="profile-card" style={{ backgroundColor: '#fdfbf7', border: '2px solid #f1c40f', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: '0', textAlign: 'center', borderBottom: '2px solid #f1c40f', paddingBottom: '10px' }}>Hero Profile 🛡️</h3>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=HabitForgeLvl${level}`} style={{ width: '80px', borderRadius: '50%', border: '4px solid #f1c40f' }} alt="Hero Avatar"/>
              <h4 style={{ margin: '10px 0 0 0' }}>{localStorage.getItem('userEmail') || 'Hero'}</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Level</span><b>{level}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total XP</span><b>{xp}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Active</span><b>{habits.length}</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

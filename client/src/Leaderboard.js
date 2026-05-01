import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('https://habitforge-api-tpbd.onrender.com/api/leaderboard');
        setPlayers(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏅';
  };

  return (
    <div className="profile-card" style={{ padding: '20px', borderRadius: '8px', marginTop: '20px', textAlign: 'left' }}>
      <h3 style={{ marginTop: '0', borderBottom: '2px solid #3498db', paddingBottom: '10px', textAlign: 'center' }}>
        Hall of Fame 🏆
      </h3>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading heroes...</p>
      ) : players.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No heroes found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          {players.map((player, index) => (
            <motion.div 
              key={player._id} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px',
                backgroundColor: index === 0 ? 'rgba(241, 196, 15, 0.1)' : 'transparent',
                border: index === 0 ? '1px solid #f1c40f' : '1px solid var(--border-color)',
                borderRadius: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{getMedal(index)}</span>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{player.name}</span>
                  <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Level {player.level}</div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#3498db', fontSize: '14px' }}>
                {player.xp} XP
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;

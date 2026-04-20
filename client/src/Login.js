import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await axios.post(`https://habitforge-api-tpbd.onrender.com${endpoint}`, { email, password });
      
      if (!isRegister) {
        // --- DATA PERSISTENCE: Saving user info so the Dashboard stays updated ---
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userEmail', res.data.user.email); 
        localStorage.setItem('xp', res.data.user.xp);
        localStorage.setItem('level', res.data.user.level);
        localStorage.setItem('badges', JSON.stringify(res.data.user.badges));
        localStorage.setItem('isPremium', res.data.user.isPremium);
        
        setToken(res.data.token);
      } else {
        alert("Account Created! Now please Login.");
        setIsRegister(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth Failed");
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? "Join the Forge ⚒️" : "Welcome Back, Smith 🔨"}</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="forge-btn">{isRegister ? "Register" : "Login"}</button>
      </form>
      <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: '#3498db', marginTop: '10px' }}>
        {isRegister ? "Already have an account? Login" : "New here? Create an account"}
      </p>
    </div>
  );
};

export default Login;

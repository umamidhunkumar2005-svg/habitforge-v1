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
      // UPDATED TO YOUR NEW RENDER URL
      const res = await axios.post(`https://habitforge-api-tpbd.onrender.com${endpoint}`, { email, password });
      if (!isRegister) {
        localStorage.setItem('token', res.data.token);
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
      <p onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Already have an account? Login" : "New here? Create an account"}
      </p>
    </div>
  );
};

export default Login;

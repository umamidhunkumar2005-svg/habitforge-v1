import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await axios.post(`https://habitforge-api-tpbd.onrender.com${endpoint}`, { email, password });
      
      if (isLogin) {
        // Save the token and user data to local storage so the App knows you are logged in
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userEmail', res.data.user.email);
        localStorage.setItem('xp', res.data.user.xp);
        localStorage.setItem('level', res.data.user.level);
        localStorage.setItem('badges', JSON.stringify(res.data.user.badges));
        localStorage.setItem('isPremium', res.data.user.isPremium);
        if (res.data.user.profilePicUrl) {
           localStorage.setItem('profilePic', res.data.user.profilePicUrl);
        }
      } else {
        alert("Registered successfully! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    // Make sure this className is here! This is what triggers the CSS.
    <div className="login-container"> 
      <h2>{isLogin ? 'Welcome Back, Hero ⚒️' : 'Join the Forge ⚒️'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'New here? Create an account' : 'Already have an account? Login'}
      </p>
    </div>
  );
}

export default Login;

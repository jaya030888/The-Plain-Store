import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (typeof location.state?.from === 'string' ? location.state?.from : location.state?.from?.pathname) || '/';
  const infoMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Failed to login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        
        {infoMessage && !error && (
          <div style={{ backgroundColor: '#e7f0eb', color: '#2e5b44', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.92rem', fontWeight: 500, border: '1px solid #c8ded2' }}>
            {infoMessage}
          </div>
        )}

        {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.95rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Login
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

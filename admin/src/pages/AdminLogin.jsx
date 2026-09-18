import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Failed to login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F1E7' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontFamily: 'Dancing Script, cursive', fontSize: '2.5rem', marginBottom: '20px', textAlign: 'center', color: '#468165' }}>Admin Portal</h2>
        
        {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#468165', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '600' }}>
            Login to Dashboard
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#666', fontFamily: 'Inter, sans-serif' }}>
          <p style={{ margin: '0 0 5px 0' }}><strong>Test Credentials</strong></p>
          <p style={{ margin: 0 }}>Email: admin@geobucket.com</p>
          <p style={{ margin: 0 }}>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      fetchAdminProfile(token);
    } else {
      localStorage.removeItem('adminToken');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchAdminProfile = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role === 'admin') {
          setUser(userData);
        } else {
          // If a customer tries to use their token here
          setToken(null);
        }
      } else {
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      if (data.role === 'admin') {
        setToken(data.token);
        return { success: true };
      } else {
        return { success: false, message: 'Unauthorized: Admins only' };
      }
    }
    return { success: false, message: data.message };
  };

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

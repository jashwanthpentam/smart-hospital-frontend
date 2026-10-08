import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          setRole(res.data.role);
          localStorage.setItem('role', res.data.role);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, role: userRole } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(res.data));
    setToken(jwtToken);
    setRole(userRole);
    setUser(res.data);
    return res.data;
  };

  const register = async (patientData) => {
    const res = await api.post('/auth/register', patientData);
    const { token: jwtToken, role: userRole } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(res.data));
    setToken(jwtToken);
    setRole(userRole);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

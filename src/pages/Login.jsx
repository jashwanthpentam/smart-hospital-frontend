import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await login(email.trim(), password);
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="brand-logo-icon mx-auto mb-2" style={{ margin: '0 auto' }}>
            <span>+</span>
          </div>
          <h2 className="auth-card-title">Welcome Back</h2>
          <p className="auth-card-subtitle">Sign in to Smart Hospital & Priority Queue</p>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. user@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="d-flex justify-between align-center mb-1">
              <label className="form-label" style={{ marginBottom: 0 }}>
                Password <span className="required">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-muted"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg mt-3" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <p className="demo-title">⚡ Quick Academic Viva Demo Logins</p>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => fillDemo('admin@hospital.com', 'admin123')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => fillDemo('dr.sarah@hospital.com', 'doctor123')}
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => fillDemo('patient@example.com', 'patient123')}
            >
              🧑 Patient
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Register as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

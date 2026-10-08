import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="container error-page">
        <div className="card text-center p-4">
          <h2>🚫 Access Denied</h2>
          <p className="text-muted">You do not have permission to access this page.</p>
          <p>Your current role is: <strong>{role}</strong></p>
          <a href="/" className="btn btn-primary mt-3">Return to Home</a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;

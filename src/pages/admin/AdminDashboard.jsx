import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/admin');
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Aggregating hospital analytics..." />;

  return (
    <div className="container py-4">
      <PageHeader
        title="Hospital Administration Dashboard"
        subtitle="System-wide clinical monitoring, department management, and queue oversight"
        actions={
          <button type="button" onClick={fetchStats} className="btn btn-outline">
            🔄 Refresh Metrics
          </button>
        }
      />

      <ErrorMessage message={error} onRetry={fetchStats} />

      {/* Metrics Row */}
      <div className="dashboard-grid mb-5">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <span>👥</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">{stats?.totalPatients || 0}</div>
            <div className="stat-label">Registered Patients</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <span>👨‍⚕️</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">{stats?.totalDoctors || 0}</div>
            <div className="stat-label">Active Doctors</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <span>🏢</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">{stats?.totalDepartments || 0}</div>
            <div className="stat-label">Hospital Departments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <span>📅</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">{stats?.totalAppointments || 0}</div>
            <div className="stat-label">All-Time Bookings</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon-wrapper stat-icon-orange">
            <span>⏳</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number" style={{ color: '#d97706' }}>
              {stats?.waitingPatients || 0}
            </div>
            <div className="stat-label">Waiting in Queue</div>
          </div>
        </div>
      </div>

      {/* Management Navigation Cards */}
      <h3 className="card-title mb-3" style={{ fontSize: '1.25rem' }}>🛠️ Hospital Operations & Management Modules</h3>
      <div className="admin-modules-grid">
        <div className="card p-4 d-flex flex-col justify-between">
          <div>
            <div className="stat-icon-wrapper stat-icon-purple mb-3">
              <span>👨‍⚕️</span>
            </div>
            <h4 style={{ fontSize: '1.15rem' }}>Specialist Doctors</h4>
            <p className="text-muted text-sm mt-1">
              Add new doctors, assign clinical departments, configure experience, and update credentials.
            </p>
          </div>
          <Link to="/admin/doctors" className="btn btn-outline btn-block mt-3">
            Manage Doctors →
          </Link>
        </div>

        <div className="card p-4 d-flex flex-col justify-between">
          <div>
            <div className="stat-icon-wrapper stat-icon-blue mb-3">
              <span>👥</span>
            </div>
            <h4 style={{ fontSize: '1.15rem' }}>Patient Directory</h4>
            <p className="text-muted text-sm mt-1">
              Search and view registered patients, contact phone numbers, gender, and age profiles.
            </p>
          </div>
          <Link to="/admin/patients" className="btn btn-outline btn-block mt-3">
            Browse Patients →
          </Link>
        </div>

        <div className="card p-4 d-flex flex-col justify-between">
          <div>
            <div className="stat-icon-wrapper stat-icon-green mb-3">
              <span>🏢</span>
            </div>
            <h4 style={{ fontSize: '1.15rem' }}>Hospital Departments</h4>
            <p className="text-muted text-sm mt-1">
              Create and manage clinical departments (Cardiology, Neurology, Pediatrics, etc.).
            </p>
          </div>
          <Link to="/admin/departments" className="btn btn-outline btn-block mt-3">
            Manage Departments →
          </Link>
        </div>

        <div className="card p-4 d-flex flex-col justify-between">
          <div>
            <div className="stat-icon-wrapper stat-icon-orange mb-3">
              <span>📋</span>
            </div>
            <h4 style={{ fontSize: '1.15rem' }}>Appointment Overseer</h4>
            <p className="text-muted text-sm mt-1">
              Track system-wide appointments, monitor real-time queue states, and manage cancellations.
            </p>
          </div>
          <Link to="/admin/appointments" className="btn btn-outline btn-block mt-3">
            All Appointments →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

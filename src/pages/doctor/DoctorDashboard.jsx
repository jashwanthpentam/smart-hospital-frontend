import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/doctor');
      setDashboard(res.data);
    } catch (err) {
      setError('Unable to fetch doctor dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading clinical workspace..." />;

  const current = dashboard?.currentPatient;

  return (
    <div className="container py-4">
      <PageHeader
        title={`Doctor Console — ${user?.name || 'Doctor'}`}
        subtitle="Manage patient consultations, call prioritized patients, and track real-time queue metrics."
        actions={
          <Link to="/doctor/queue" className="btn btn-primary btn-lg">
            ⚡ Open Queue Console
          </Link>
        }
      />

      <ErrorMessage message={error} onRetry={fetchDashboard} />

      {/* Metric Cards */}
      <div className="dashboard-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <span>📅</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">{dashboard?.todayAppointmentsCount || 0}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon-wrapper stat-icon-orange">
            <span>⏳</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number" style={{ color: '#d97706' }}>
              {dashboard?.waitingPatientsCount || 0}
            </div>
            <div className="stat-label">Waiting in Queue</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon-wrapper stat-icon-green">
            <span>✓</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number" style={{ color: '#059669' }}>
              {dashboard?.completedConsultationsCount || 0}
            </div>
            <div className="stat-label">Completed Consultations</div>
          </div>
        </div>
      </div>

      {/* Current Active Patient Card */}
      <div className="card p-4 mb-4">
        <div className="d-flex justify-between align-center mb-3">
          <div>
            <h3 className="card-title">🩺 Currently Called / In Consultation</h3>
            <p className="card-subtitle">Active patient receiving care in your consultation room</p>
          </div>
          {current && (
            <Link to="/doctor/queue" className="btn btn-sm btn-primary">
              Control Panel →
            </Link>
          )}
        </div>

        {current ? (
          <div className="active-patient-card active-patient-progress" style={{ margin: 0 }}>
            <div className="d-flex justify-between align-center flex-wrap gap-2">
              <div>
                <h4 style={{ fontSize: '1.2rem', margin: 0 }}>
                  {current.patientName}{' '}
                  <span className="text-muted text-sm font-normal">
                    ({current.patientAge} yrs, {current.patientGender})
                  </span>
                </h4>
                <div className="d-flex align-center gap-2 mt-2">
                  <PriorityBadge priority={current.priorityType} showScore />
                  <StatusBadge status={current.queueStatus} />
                </div>
                {current.symptoms && (
                  <p className="text-sm text-secondary mt-2 mb-0">
                    <strong>Reported Symptoms:</strong> {current.symptoms}
                  </p>
                )}
              </div>

              <Link to="/doctor/queue" className="btn btn-primary">
                Manage Consultation Flow →
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="🩺"
            title="Room is Currently Idle"
            description="No patient is currently called or in consultation. Open the Queue Console to call the next prioritized patient."
            actionText="Call Next Patient"
            actionLink="/doctor/queue"
          />
        )}
      </div>

      {/* Queue Preview */}
      <div className="card p-4">
        <div className="d-flex justify-between align-center mb-3">
          <div>
            <h3 className="card-title">📋 Upcoming Patients in PriorityQueue</h3>
            <p className="card-subtitle">Sorted dynamically by Emergency &gt; Urgent &gt; Normal + Arrival Time</p>
          </div>
          <Link to="/doctor/queue" className="btn btn-outline btn-sm">
            Launch Queue Console →
          </Link>
        </div>

        {dashboard?.queue?.length === 0 ? (
          <EmptyState
            icon="✓"
            title="Waiting Queue is Empty"
            description="All scheduled patients for your clinic have been attended to or there are no new arrivals."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Patient</th>
                  <th>Appt Time</th>
                  <th>Priority Tier</th>
                  <th>Score</th>
                  <th>Symptoms Context</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.queue?.slice(0, 5).map((item) => (
                  <tr
                    key={item.queueEntryId}
                    className={item.priorityType === 'EMERGENCY' ? 'row-emergency' : item.priorityType === 'URGENT' ? 'row-urgent' : ''}
                  >
                    <td>
                      <span className="queue-position-badge font-bold">#{item.position}</span>
                    </td>
                    <td>
                      <span className="font-semibold">{item.patientName}</span>
                    </td>
                    <td>{item.appointmentTime}</td>
                    <td>
                      <PriorityBadge priority={item.priorityType} />
                    </td>
                    <td>
                      <span className="font-semibold">{item.priorityScore}</span>
                    </td>
                    <td>
                      <span className="text-sm text-muted">{item.symptoms || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

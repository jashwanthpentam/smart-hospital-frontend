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

const PatientDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/patient');
      setDashboard(res.data);
    } catch (err) {
      setError('Unable to load patient dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading patient dashboard..." />;

  const queue = dashboard?.queueStatus;
  const upcoming = dashboard?.upcomingAppointment;

  return (
    <div className="container py-4">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Patient'}!`}
        subtitle="Manage your medical appointments, track priority triage, and view live hospital queue status."
        actions={
          <Link to="/patient/book" className="btn btn-primary">
            ➕ Schedule Appointment
          </Link>
        }
      />

      <ErrorMessage message={error} onRetry={fetchDashboard} />

      {/* Top Metric Cards */}
      <div className="dashboard-grid mb-4">
        {/* Total Appointments Metric */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <span>📅</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">{dashboard?.totalAppointmentsCount || 0}</div>
            <div className="stat-label">Total Appointments Booked</div>
          </div>
        </div>

        {/* Live Queue Indicator */}
        <div className="stat-card">
          <div className={`stat-icon-wrapper ${queue ? 'stat-icon-red' : 'stat-icon-green'}`}>
            <span>{queue ? '⏳' : '✓'}</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">
              {queue ? (queue.queuePosition > 0 ? `#${queue.queuePosition}` : 'CALLED') : 'CLEAR'}
            </div>
            <div className="stat-label">
              {queue ? `${queue.patientsAhead} ahead in line` : 'No Waiting Queue'}
            </div>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <span>🩺</span>
          </div>
          <div className="stat-content">
            <div className="stat-big-number">{dashboard?.availableDoctors?.length || 0}</div>
            <div className="stat-label">Active Specialists Today</div>
          </div>
        </div>
      </div>

      {/* Main Content Two-Column Grid */}
      <div className="schedule-layout-grid mb-4">
        {/* Live Queue Status Card */}
        <div className="card" style={{ borderTop: queue ? '4px solid #ef4444' : '4px solid #2563eb' }}>
          <div className="card-header d-flex justify-between align-center">
            <div>
              <h3 className="card-title">🔴 Live Queue Status</h3>
              <p className="card-subtitle">Real-time Java PriorityQueue tracker</p>
            </div>
            {queue && (
              <Link to="/patient/queue" className="btn btn-xs btn-outline">
                Full Queue View →
              </Link>
            )}
          </div>

          <div className="card-body">
            {queue ? (
              <div>
                <div className="queue-metric-row mb-3">
                  <div className="metric-box">
                    <span className="metric-number">
                      {queue.queuePosition > 0 ? `#${queue.queuePosition}` : 'CURRENT'}
                    </span>
                    <span className="metric-label">Your Live Position</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-number">{queue.patientsAhead}</span>
                    <span className="metric-label">Ahead in Line</span>
                  </div>
                </div>

                <div className="p-3 mb-3" style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  <div className="d-flex justify-between py-1">
                    <span className="text-muted text-sm">Consulting Doctor</span>
                    <span className="font-semibold text-sm">{queue.doctorName}</span>
                  </div>
                  <div className="d-flex justify-between py-1">
                    <span className="text-muted text-sm">Department</span>
                    <span className="text-sm">{queue.departmentName}</span>
                  </div>
                  <div className="d-flex justify-between py-1 align-center">
                    <span className="text-muted text-sm">Priority Urgency</span>
                    <PriorityBadge priority={queue.priorityType} showScore />
                  </div>
                  <div className="d-flex justify-between py-1 align-center">
                    <span className="text-muted text-sm">Status</span>
                    <StatusBadge status={queue.queueStatus} />
                  </div>
                </div>

                <Link to="/patient/queue" className="btn btn-primary btn-block">
                  Open Interactive Live Queue Monitor
                </Link>
              </div>
            ) : (
              <EmptyState
                icon="🎉"
                title="You're not waiting in any queue"
                description="When you have an active appointment for today, your real-time queue position and calling alert will appear here."
                actionText="Schedule Consultation"
                actionLink="/patient/book"
              />
            )}
          </div>
        </div>

        {/* Next Appointment Card */}
        <div className="card">
          <div className="card-header d-flex justify-between align-center">
            <div>
              <h3 className="card-title">📅 Next Scheduled Appointment</h3>
              <p className="card-subtitle">Upcoming clinical consultation</p>
            </div>
            <Link to="/patient/appointments" className="btn btn-xs btn-outline">
              View History
            </Link>
          </div>

          <div className="card-body">
            {upcoming ? (
              <div>
                <div className="d-flex align-center gap-3 mb-3">
                  <div className="stat-icon-wrapper stat-icon-blue">
                    <span>🩺</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{upcoming.doctorName}</h4>
                    <span className="text-muted text-sm">{upcoming.departmentName}</span>
                  </div>
                </div>

                <div className="p-3 mb-3" style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  <div className="d-flex justify-between py-1">
                    <span className="text-muted text-sm">Date & Time</span>
                    <span className="font-semibold text-sm">
                      {upcoming.appointmentDate} at {upcoming.appointmentTime}
                    </span>
                  </div>
                  <div className="d-flex justify-between py-1 align-center">
                    <span className="text-muted text-sm">Triage Priority</span>
                    <PriorityBadge priority={upcoming.priorityType} />
                  </div>
                  <div className="d-flex justify-between py-1 align-center">
                    <span className="text-muted text-sm">Status</span>
                    <StatusBadge status={upcoming.status} />
                  </div>
                  {upcoming.symptoms && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                      <span className="text-muted text-xs d-block mb-1">Reported Symptoms:</span>
                      <p className="text-sm text-secondary" style={{ margin: 0 }}>{upcoming.symptoms}</p>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <Link to="/patient/appointments" className="btn btn-outline btn-block">
                    Manage Booking
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                icon="📅"
                title="No Upcoming Appointments"
                description="Book a slot with one of our specialized doctors to receive medical attention."
                actionText="Book an Appointment"
                actionLink="/patient/book"
              />
            )}
          </div>
        </div>
      </div>

      {/* Available Specialists Section */}
      <div className="card p-4">
        <div className="d-flex justify-between align-center mb-3">
          <div>
            <h3 className="card-title">👨‍⚕️ Available Doctors & Specialists</h3>
            <p className="card-subtitle">Select a doctor to begin appointment booking</p>
          </div>
          <Link to="/doctors" className="btn btn-outline btn-sm">
            View All Specialists →
          </Link>
        </div>

        <div className="doctor-cards-grid">
          {dashboard?.availableDoctors?.slice(0, 3).map((doc) => (
            <div key={doc.id} className="card p-3" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="d-flex align-center gap-2 mb-2">
                  <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '38px', height: '38px', fontSize: '1.2rem' }}>
                    <span>🩺</span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{doc.name}</h4>
                    <span className="page-header-badge" style={{ fontSize: '0.65rem' }}>{doc.departmentName}</span>
                  </div>
                </div>
                <p className="text-xs text-muted mt-2">
                  {doc.specialization} • {doc.experienceYears} Years Experience
                </p>
              </div>
              <Link to={`/patient/book?doctorId=${doc.id}`} className="btn btn-sm btn-primary btn-block mt-3">
                Book Slot
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

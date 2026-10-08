import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

const QueueStatus = () => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [error, setError] = useState('');

  const fetchQueue = async (isManual = false, isSilent = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!isSilent && !queueData) setLoading(true);

      const res = await api.get('/queue/my');
      setQueueData(res.data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setError('');
    } catch (err) {
      if (!isSilent) {
        setError('Could not retrieve current queue status.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Setup lightweight polling every 6 seconds with cleanup on unmount
  useEffect(() => {
    fetchQueue(false, false);

    const intervalId = setInterval(() => {
      fetchQueue(false, true); // silent background update
    }, 6000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading && !queueData) {
    return <LoadingSpinner text="Connecting to Java PriorityQueue engine..." />;
  }

  const isCalled = queueData?.queueStatus === 'CALLED';
  const isInProgress = queueData?.queueStatus === 'IN_PROGRESS';
  const isCompleted = queueData?.queueStatus === 'COMPLETED' || queueData?.appointmentStatus === 'COMPLETED';
  const isCancelled = queueData?.queueStatus === 'SKIPPED' || queueData?.appointmentStatus === 'CANCELLED';
  const isWaiting = queueData?.queueStatus === 'WAITING';

  return (
    <div className="container py-4">
      <PageHeader
        title="My Live Queue Status"
        subtitle="Real-time clinical queue tracking powered by server-side Java PriorityQueue"
        badge={
          isCompleted
            ? 'Consultation Completed'
            : queueData
            ? 'Live Polling Active (6s)'
            : 'No Active Queue'
        }
        actions={
          <div className="d-flex align-center gap-2">
            <span className="text-xs text-muted">
              ⏱️ Last polled: <strong>{lastUpdated}</strong>
            </span>
            <button
              type="button"
              onClick={() => fetchQueue(true, false)}
              className="btn btn-sm btn-outline"
              disabled={refreshing}
            >
              🔄 {refreshing ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        }
      />

      <ErrorMessage message={error} onRetry={() => fetchQueue(false, false)} />

      {!queueData ? (
        <EmptyState
          icon="🩺"
          title="No Active Consultation in Queue"
          description="You do not currently have any pending, called, or in-progress appointments in today's doctor queue."
          actionText="Book an Appointment"
          actionLink="/patient/book"
        />
      ) : (
        <div className="queue-status-dashboard" style={{ maxWidth: '850px', margin: '0 auto' }}>
          {/* Main Status Hero Card */}
          <div
            className={`patient-queue-hero ${
              isCalled
                ? 'patient-queue-calling-hero'
                : isCompleted
                ? 'patient-queue-completed-hero'
                : ''
            }`}
            style={{
              backgroundColor: isCompleted ? '#ecfdf5' : isCancelled ? '#fef2f2' : undefined,
              borderColor: isCompleted ? '#a7f3d0' : isCancelled ? '#fecaca' : undefined,
            }}
          >
            <div className="d-flex justify-center mb-2">
              <StatusBadge status={queueData.queueStatus} />
            </div>

            <div
              className="patient-position-large"
              style={{ color: isCompleted ? '#065f46' : isCancelled ? '#991b1b' : undefined }}
            >
              {isWaiting ? (
                `#${queueData.queuePosition}`
              ) : isCalled ? (
                'CALLED'
              ) : isInProgress ? (
                'IN ROOM'
              ) : isCompleted ? (
                'DONE'
              ) : (
                'CANCELLED'
              )}
            </div>

            <p
              style={{
                fontSize: '1.1rem',
                opacity: 0.95,
                margin: 0,
                fontWeight: 600,
                color: isCompleted ? '#065f46' : isCancelled ? '#991b1b' : undefined,
              }}
            >
              {isCalled
                ? '📢 PLEASE PROCEED TO CONSULTATION ROOM NOW'
                : isInProgress
                ? '🩺 Consultation in progress with your physician'
                : isCompleted
                ? '✓ Consultation completed. Thank you for visiting.'
                : isCancelled
                ? '❌ Appointment cancelled.'
                : `${queueData.patientsAhead} patient(s) ahead of you in line`}
            </p>
          </div>

          {/* Urgent Call Notice Banner */}
          {isCalled && (
            <div
              className="alert-banner alert-banner-warning mb-4"
              style={{ border: '2px solid #8b5cf6', backgroundColor: '#f5f3ff', color: '#5b21b6' }}
            >
              <span className="alert-banner-icon" style={{ fontSize: '1.5rem' }}>🔔</span>
              <div className="alert-banner-body">
                <h4 className="alert-banner-title">ATTENTION: Please Enter Consultation Room!</h4>
                <p className="alert-banner-text">
                  Dr. <strong>{queueData.doctorName}</strong> is waiting for you in the{' '}
                  <strong>{queueData.departmentName}</strong> department.
                </p>
              </div>
            </div>
          )}

          {/* Completed Notice Banner */}
          {isCompleted && (
            <div
              className="alert-banner alert-banner-success mb-4"
              style={{ border: '2px solid #10b981', backgroundColor: '#ecfdf5', color: '#065f46' }}
            >
              <span className="alert-banner-icon" style={{ fontSize: '1.5rem' }}>✓</span>
              <div className="alert-banner-body">
                <h4 className="alert-banner-title">Consultation Finished</h4>
                <p className="alert-banner-text">
                  Your appointment with Dr. <strong>{queueData.doctorName}</strong> has concluded. Check your medical summary or schedule future follow-ups anytime.
                </p>
              </div>
            </div>
          )}

          {/* Live Queue Metrics Panel */}
          <div className="dashboard-grid mb-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-blue">
                <span>📍</span>
              </div>
              <div className="stat-content">
                <span className="stat-value font-bold">
                  {isWaiting ? `#${queueData.queuePosition}` : '0'}
                </span>
                <span className="stat-label">CURRENT POSITION</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-amber">
                <span>👥</span>
              </div>
              <div className="stat-content">
                <span className="stat-value font-bold">
                  {isWaiting ? queueData.patientsAhead : 0}
                </span>
                <span className="stat-label">PATIENTS AHEAD</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-purple">
                <span>⏳</span>
              </div>
              <div className="stat-content">
                <span className="stat-value font-bold">
                  {queueData.patientsWaiting ?? queueData.queueSize ?? 0}
                </span>
                <span className="stat-label">PATIENTS WAITING</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-emerald">
                <span>📊</span>
              </div>
              <div className="stat-content">
                <span className="stat-value font-bold">
                  {queueData.bookedCapacity ?? '—'} / {queueData.scheduleCapacity ?? '—'}
                </span>
                <span className="stat-label">SCHEDULE CAPACITY</span>
              </div>
            </div>
          </div>

          {/* Appointment & Priority Details Card */}
          <div className="card p-4 mb-4">
            <h3 className="card-title mb-3" style={{ fontSize: '1.15rem' }}>
              My Consultation & Shift Details
            </h3>

            <div className="p-3" style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <div className="d-flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Physician / Specialist</span>
                <span className="font-semibold text-main">{queueData.doctorName}</span>
              </div>
              <div className="d-flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Hospital Department</span>
                <span className="font-semibold text-main">{queueData.departmentName}</span>
              </div>
              <div className="d-flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Consultation Shift</span>
                <span className="text-main font-semibold">
                  📅 {queueData.appointmentDate} • ⏰{' '}
                  {queueData.scheduleTime ||
                    (queueData.scheduleStartTime
                      ? `${queueData.scheduleStartTime} - ${queueData.scheduleEndTime}`
                      : queueData.appointmentTime)}
                </span>
              </div>
              <div className="d-flex justify-between py-2 align-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Triage Priority</span>
                <PriorityBadge priority={queueData.priorityType} showScore />
              </div>
              <div className="d-flex justify-between py-2 align-center">
                <span className="text-muted">Queue Status</span>
                <StatusBadge status={queueData.queueStatus} />
              </div>
            </div>

            {/* Explanatory Academic Context Box */}
            <div
              className="p-3 mt-3"
              style={{ backgroundColor: '#eff6ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}
            >
              <p className="text-xs text-secondary" style={{ margin: 0, lineHeight: 1.5 }}>
                ℹ️ <strong>Academic Note on Java PriorityQueue:</strong> Waiting positions are dynamically calculated on the Spring Boot backend using a custom <code>PriorityQueue</code> comparator: <code>(Emergency 100 &gt; Urgent 50 &gt; Normal 20)</code> with arrival timestamp tie-breaker. Higher-urgency arrivals dynamically advance in line ahead of lower-priority waiting patients without disrupting ongoing consultations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueStatus;

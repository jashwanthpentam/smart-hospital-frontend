import { getLocalDateString } from '../../utils/date';
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

const DoctorQueue = () => {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [queue, setQueue] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [nextPatient, setNextPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQueueData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      const [queueRes, activeRes, nextRes] = await Promise.all([
        api.get(`/doctor/queue?date=${selectedDate}`),
        api.get(`/doctor/queue/active?date=${selectedDate}`),
        api.get(`/doctor/queue/next?date=${selectedDate}`),
      ]);
      setQueue(queueRes.data);
      setActivePatient(activeRes.data);
      setNextPatient(nextRes.data);
    } catch (err) {
      if (!isSilent) setError('Failed to fetch doctor queue data.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData(false);

    const intervalId = setInterval(() => {
      fetchQueueData(true);
    }, 6000);

    return () => clearInterval(intervalId);
  }, [selectedDate]);

  // CALL NEXT
  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await api.put(`/doctor/queue/call-next?date=${selectedDate}`);
      setSuccess(`Called patient: ${res.data.patientName} (${res.data.priorityType})`);
      fetchQueueData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to call next patient.');
    } finally {
      setActionLoading(false);
    }
  };

  // START Consultation
  const handleStart = async (appointmentId) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await api.put(`/doctor/appointments/${appointmentId}/start`);
      setSuccess(`Consultation started for ${res.data.patientName}`);
      fetchQueueData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  // COMPLETE Consultation
  const handleComplete = async (appointmentId) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await api.put(`/doctor/appointments/${appointmentId}/complete`);
      setSuccess(`Consultation successfully completed for ${res.data.patientName}!`);
      fetchQueueData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  const isConsultationInProgress = activePatient?.queueStatus === 'IN_PROGRESS';

  return (
    <div className="container py-4">
      {/* Header */}
      <PageHeader
        title="Doctor Priority Queue Console"
        subtitle="Manage consultation calls using the server-side Java PriorityQueue comparator algorithm"
        badge={`Active Queue: ${queue.length} Waiting`}
        actions={
          <div className="d-flex align-center gap-2">
            <span className="text-xs text-muted font-semibold">Queue Date:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              type="button"
              onClick={fetchQueueData}
              className="btn btn-sm btn-outline"
              disabled={loading || actionLoading}
            >
              🔄 Refresh
            </button>
          </div>
        }
      />

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {success && (
        <div className="alert-banner alert-banner-success">
          <span className="alert-banner-icon">✓</span>
          <div className="alert-banner-body">
            <span className="alert-banner-text">{success}</span>
          </div>
        </div>
      )}

      {/* Active Consultation / Call Next Console Panel */}
      <div className="card p-4 mb-4" style={{ borderTop: '4px solid #2563eb' }}>
        <div className="d-flex justify-between align-center flex-wrap gap-3">
          <div>
            <h3 className="card-title" style={{ fontSize: '1.25rem' }}>Active Consultation Status</h3>
            <p className="card-subtitle">
              Doctors handle one patient at a time: <code>CALL NEXT → START → COMPLETE</code>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCallNext}
            className="btn btn-primary btn-lg"
            disabled={actionLoading || isConsultationInProgress || queue.length === 0}
            title={
              isConsultationInProgress
                ? 'Complete current in-progress visit before calling the next patient'
                : queue.length === 0
                ? 'No waiting patients in queue'
                : 'Call the next highest-priority patient'
            }
          >
            {actionLoading ? 'Processing Action...' : '📢 CALL NEXT PATIENT'}
          </button>
        </div>

        {/* Current Active Patient Card */}
        {activePatient ? (
          <div
            className={`active-patient-card mt-3 ${
              activePatient.queueStatus === 'CALLED' ? 'active-patient-calling' : 'active-patient-progress'
            }`}
            style={{ margin: '1rem 0 0 0' }}
          >
            <div className="d-flex justify-between align-center flex-wrap gap-3">
              <div>
                <div className="d-flex align-center gap-2 mb-2">
                  <StatusBadge status={activePatient.queueStatus} />
                  <PriorityBadge priority={activePatient.priorityType} showScore />
                </div>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>
                  {activePatient.patientName}{' '}
                  <span className="text-muted text-sm font-normal">
                    ({activePatient.patientAge} years, {activePatient.patientGender})
                  </span>
                </h3>
                <div className="d-flex gap-3 text-xs text-muted mt-2">
                  <span>📅 Appt: <strong>{activePatient.appointmentTime}</strong></span>
                  <span>⏱️ Arrival: <strong>{activePatient.arrivalTime}</strong></span>
                </div>
                {activePatient.symptoms && (
                  <p className="text-sm text-secondary mt-2 mb-0" style={{ maxWidth: '600px' }}>
                    <strong>Reported Symptoms:</strong> {activePatient.symptoms}
                  </p>
                )}
              </div>

              <div className="queue-console-actions">
                {activePatient.queueStatus === 'CALLED' && (
                  <button
                    type="button"
                    onClick={() => handleStart(activePatient.appointmentId)}
                    className="btn btn-success btn-lg"
                    disabled={actionLoading}
                  >
                    ▶ START Consultation
                  </button>
                )}

                {activePatient.queueStatus === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => handleComplete(activePatient.appointmentId)}
                    className="btn btn-primary btn-lg"
                    disabled={actionLoading}
                  >
                    ✓ COMPLETE Consultation
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 mt-3 text-center" style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-medium)' }}>
            <span style={{ fontSize: '1.5rem' }}>📢</span>
            <p className="text-muted text-sm mt-1 mb-0">
              No patient is currently active in consultation. Click <strong>CALL NEXT PATIENT</strong> above to retrieve the highest priority waiting patient from the Java PriorityQueue.
            </p>
          </div>
        )}
      </div>

      {/* Waiting Patients List */}
      <div className="card p-4">
        <div className="d-flex justify-between align-center mb-3 flex-wrap gap-2">
          <div>
            <h3 className="card-title">
              ⏳ Waiting Patients in PriorityQueue ({queue.length})
            </h3>
            <p className="card-subtitle">
              Prioritized by Emergency (100) &gt; Urgent (50) &gt; Normal (20) with arrival timestamp tie-breaker
            </p>
          </div>
          {nextPatient && (
            <div className="badge badge-dept d-flex align-center gap-1" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              <span>⚡ Top of Queue:</span>
              <strong>{nextPatient.patientName}</strong>
              <PriorityBadge priority={nextPatient.priorityType} />
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Computing PriorityQueue comparator ordering..." />
        ) : queue.length === 0 ? (
          <EmptyState
            icon="✓"
            title="Waiting Queue is Currently Empty"
            description="There are no patients waiting in line for the selected date. Check back when new patients register or arrive."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Rank</th>
                  <th>Patient Name</th>
                  <th>Demographics</th>
                  <th>Appt Time</th>
                  <th>Triage Priority</th>
                  <th>Score</th>
                  <th>Arrival Time</th>
                  <th>Symptoms Context</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr
                    key={item.queueEntryId}
                    className={
                      item.priorityType === 'EMERGENCY'
                        ? 'row-emergency'
                        : item.priorityType === 'URGENT'
                        ? 'row-urgent'
                        : ''
                    }
                  >
                    <td>
                      <span className="queue-position-badge font-bold">#{item.position}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-main">{item.patientName}</span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">{item.patientAge}y • {item.patientGender}</span>
                    </td>
                    <td>{item.appointmentTime}</td>
                    <td>
                      <PriorityBadge priority={item.priorityType} />
                    </td>
                    <td>
                      <span className="font-semibold">{item.priorityScore}</span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">{item.arrivalTime}</span>
                    </td>
                    <td>
                      <span className="text-sm text-secondary" style={{ maxWidth: '200px', display: 'inline-block' }}>
                        {item.symptoms || '—'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.queueStatus} />
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

export default DoctorQueue;

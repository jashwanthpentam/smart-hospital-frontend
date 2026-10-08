import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointmentId: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      setError('Failed to fetch your appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    if (!cancelModal.appointmentId) return;

    try {
      setActionLoading(true);
      await api.put(`/appointments/${cancelModal.appointmentId}/cancel`);
      setCancelModal({ isOpen: false, appointmentId: null });
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeFilter === 'WAITING') {
      return app.status === 'WAITING' || app.status === 'BOOKED' || app.status === 'CALLED' || app.status === 'IN_PROGRESS';
    }
    if (activeFilter === 'COMPLETED') {
      return app.status === 'COMPLETED';
    }
    if (activeFilter === 'CANCELLED') {
      return app.status === 'CANCELLED';
    }
    return true;
  });

  const columns = [
    {
      header: 'Specialist Doctor',
      key: 'doctorName',
      render: (row) => (
        <div>
          <span className="font-semibold text-main d-block">{row.doctorName}</span>
          <span className="text-xs text-muted">{row.departmentName}</span>
        </div>
      ),
    },
    {
      header: 'Consultation Schedule',
      key: 'appointmentDate',
      render: (row) => (
        <span className="text-sm">
          📅 {row.appointmentDate} <br />
          ⏰ {row.appointmentTime}
        </span>
      ),
    },
    {
      header: 'Triage Urgency',
      key: 'priorityType',
      render: (row) => (
        <PriorityBadge priority={row.priorityType} showScore />
      ),
    },
    {
      header: 'Reported Symptoms',
      key: 'symptoms',
      render: (row) => (
        <span className="text-sm text-secondary" style={{ maxWidth: '240px', display: 'inline-block' }}>
          {row.symptoms || <span className="text-muted">—</span>}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Action',
      key: 'actions',
      render: (row) => (
        <div>
          {row.status === 'WAITING' || row.status === 'BOOKED' ? (
            <button
              onClick={() => setCancelModal({ isOpen: true, appointmentId: row.id })}
              className="btn btn-xs btn-outline-danger"
              disabled={actionLoading}
            >
              Cancel
            </button>
          ) : (
            <span className="text-xs text-muted">Completed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container py-4">
      <PageHeader
        title="My Medical Appointments"
        subtitle="Review your consultation history, view clinical status, and manage active bookings."
        actions={
          <Link to="/patient/book" className="btn btn-primary">
            ➕ Schedule New Appointment
          </Link>
        }
      />

      <ErrorMessage message={error} onRetry={fetchAppointments} />

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveFilter('ALL')}
        >
          All Appointments ({appointments.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'WAITING' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveFilter('WAITING')}
        >
          Active / In Queue
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'COMPLETED' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveFilter('COMPLETED')}
        >
          Completed
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'CANCELLED' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveFilter('CANCELLED')}
        >
          Cancelled
        </button>
      </div>

      <div className="card p-0">
        <DataTable
          columns={columns}
          data={filteredAppointments}
          loading={loading}
          emptyTitle="No appointments match this filter"
          emptyMessage="You currently have no consultations matching the selected status filter."
        />
      </div>

      <ConfirmModal
        isOpen={cancelModal.isOpen}
        title="Cancel Appointment"
        message="Are you sure you wish to cancel this appointment? You will be removed from the doctor's PriorityQueue."
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelModal({ isOpen: false, appointmentId: null })}
      />
    </div>
  );
};

export default MyAppointments;

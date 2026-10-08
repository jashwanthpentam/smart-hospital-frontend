import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Sorting
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, id: null });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/appointments/page?page=${page}&size=10&sort=appointmentDate,desc`);
      setAppointments(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page]);

  const handleCancel = async () => {
    if (!cancelModal.id) return;
    try {
      await api.put(`/appointments/${cancelModal.id}/cancel`);
      setCancelModal({ isOpen: false, id: null });
      setSuccess('Appointment cancelled and removed from active doctor queue.');
      fetchAppointments();
    } catch (err) {
      setError('Failed to cancel appointment.');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/appointments/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null });
      setSuccess('Appointment record permanently deleted.');
      fetchAppointments();
    } catch (err) {
      setError('Failed to delete appointment.');
    }
  };

  const columns = [
    {
      header: 'ID',
      key: 'id',
      width: '60px',
      render: (row) => <span className="text-muted text-xs font-semibold">#{row.id}</span>,
    },
    {
      header: 'Patient Details',
      key: 'patientName',
      render: (row) => (
        <div>
          <span className="font-semibold text-main d-block">{row.patientName}</span>
          <span className="text-xs text-muted">{row.patientPhone || 'No phone'}</span>
        </div>
      ),
    },
    {
      header: 'Doctor & Department',
      key: 'doctorName',
      render: (row) => (
        <div>
          <span className="font-semibold text-main d-block">🩺 {row.doctorName}</span>
          <span className="text-xs text-muted">{row.departmentName}</span>
        </div>
      ),
    },
    {
      header: 'Scheduled Slot',
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
      header: 'Booking Status',
      key: 'status',
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Live Queue',
      key: 'queueStatus',
      render: (row) => (
        row.queueStatus ? (
          <StatusBadge status={row.queueStatus} />
        ) : (
          <span className="text-muted text-xs">—</span>
        )
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="d-flex gap-2">
          {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && (
            <button
              type="button"
              onClick={() => setCancelModal({ isOpen: true, id: row.id })}
              className="btn btn-xs btn-outline-danger"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
            className="btn btn-xs btn-outline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container py-4">
      <PageHeader
        title="Hospital Appointments Registry"
        subtitle="Master overview of all bookings, PriorityQueue statuses, and cancellation controls"
        actions={
          <button type="button" onClick={fetchAppointments} className="btn btn-outline">
            🔄 Refresh Registry
          </button>
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

      <div className="card p-0">
        <DataTable
          columns={columns}
          data={appointments}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          getRowClassName={(row) =>
            row.priorityType === 'EMERGENCY' ? 'row-emergency' : row.priorityType === 'URGENT' ? 'row-urgent' : ''
          }
          emptyTitle="No appointments found"
          emptyMessage="No consultation bookings currently exist in the database."
        />
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModal.isOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment and set the queue status to SKIPPED/CANCELLED?"
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelModal({ isOpen: false, id: null })}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Permanently Delete Appointment"
        message="Permanently remove this appointment record from the database? This cannot be undone."
        confirmText="Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default ManageAppointments;

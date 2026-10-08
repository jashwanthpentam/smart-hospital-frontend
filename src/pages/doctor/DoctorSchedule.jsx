import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    availableDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    maxAppointments: 15,
  });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/schedules');
      setSchedules(res.data);
    } catch (err) {
      setError('Failed to fetch doctor schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSubmitting(true);
      await api.post('/schedules', {
        availableDate: formData.availableDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxAppointments: Number(formData.maxAppointments),
      });
      setSuccess('New clinical schedule shift successfully added!');
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/schedules/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null });
      setSuccess('Schedule slot removed.');
      fetchSchedules();
    } catch (err) {
      setError('Failed to delete schedule.');
    }
  };

  const columns = [
    {
      header: 'Available Date',
      key: 'availableDate',
      render: (row) => <strong className="text-main">📅 {row.availableDate}</strong>,
    },
    {
      header: 'Consultation Hours',
      key: 'hours',
      render: (row) => <span className="text-sm">⏰ {row.startTime} - {row.endTime}</span>,
    },
    {
      header: 'Patient Capacity',
      key: 'maxAppointments',
      render: (row) => <span className="font-semibold">{row.maxAppointments} slots</span>,
    },
    {
      header: 'Booked So Far',
      key: 'bookedCount',
      render: (row) => {
        const booked = row.bookedCount || 0;
        const max = row.maxAppointments || 1;
        const isFull = booked >= max;
        return (
          <span className={`status-pill ${isFull ? 'badge-status-cancelled' : 'badge-status-booked'}`}>
            {booked} / {max} {isFull ? '(FULL)' : ''}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
          className="btn btn-xs btn-outline-danger"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="container py-4">
      <PageHeader
        title="Doctor Availability & Shift Schedules"
        subtitle="Configure consultation dates, working hours, and maximum appointment capacity"
        badge={`${schedules.length} Active Shifts`}
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

      <div className="schedule-layout-grid">
        {/* Add Schedule Form */}
        <div className="card p-4">
          <h3 className="card-title mb-2">➕ Define New Clinic Shift</h3>
          <p className="card-subtitle mb-3">Set dates when patients can schedule priority appointments</p>

          <form onSubmit={handleAddSchedule} className="mt-3">
            <div className="form-group">
              <label className="form-label">Available Date</label>
              <input
                type="date"
                name="availableDate"
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
                value={formData.availableDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group col">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  className="form-control"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group col">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  className="form-control"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Patient Limit</label>
              <input
                type="number"
                name="maxAppointments"
                className="form-control"
                min="1"
                max="100"
                value={formData.maxAppointments}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Cap on the number of appointments allowed in this session.</span>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg mt-3" disabled={submitting}>
              {submitting ? 'Saving Shift...' : 'Save Availability Shift'}
            </button>
          </form>
        </div>

        {/* Existing Schedules Table */}
        <div className="card p-4">
          <h3 className="card-title mb-2">📋 Configured Clinic Shifts</h3>
          <p className="card-subtitle mb-3">Existing shifts visible to patients during booking</p>

          <DataTable
            columns={columns}
            data={schedules}
            loading={loading}
            emptyTitle="No shifts configured yet"
            emptyMessage="Add your first consulting shift on the left to allow patient appointments."
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Shift Schedule"
        message="Are you sure you want to remove this schedule slot? Existing appointments booked for this slot will not be automatically deleted."
        confirmText="Confirm Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default DoctorSchedule;

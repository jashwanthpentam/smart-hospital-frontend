import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Sorting state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('user.name');
  const [sortDir, setSortDir] = useState('asc');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: 'MALE',
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/patients/page?page=${page}&size=8&sort=${sortField},${sortDir}`);
      setPatients(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError('Failed to fetch patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, sortField, sortDir]);

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      age: 30,
      gender: 'MALE',
    });
    setModalOpen(true);
  };

  const openEditModal = (pat) => {
    setEditId(pat.id);
    setFormData({
      name: pat.name,
      email: pat.email,
      password: '',
      phone: pat.phone,
      age: pat.age,
      gender: pat.gender,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        age: Number(formData.age),
        gender: formData.gender,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editId) {
        await api.put(`/patients/${editId}`, payload);
        setSuccess('Patient details updated successfully.');
      } else {
        await api.post('/patients', payload);
        setSuccess('New patient registered successfully.');
      }
      setModalOpen(false);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/patients/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null });
      setSuccess('Patient record deleted successfully.');
      fetchPatients();
    } catch (err) {
      setError('Failed to delete patient.');
    }
  };

  const columns = [
    {
      header: 'Patient Profile',
      key: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-main d-block">👤 {row.name}</span>
          <span className="text-xs text-muted">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Contact Phone',
      key: 'phone',
      render: (row) => <span className="text-sm">{row.phone || '—'}</span>,
    },
    {
      header: 'Age',
      key: 'age',
      render: (row) => <span className="text-sm font-semibold">{row.age} yrs</span>,
    },
    {
      header: 'Gender',
      key: 'gender',
      render: (row) => (
        <span className="badge badge-dept" style={{ fontSize: '0.72rem' }}>
          {row.gender}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="btn btn-xs btn-outline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
            className="btn btn-xs btn-outline-danger"
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
        title="Manage Hospital Patients"
        subtitle="View registered patient records, edit profile demographics, and manage clinical accounts"
        actions={
          <button type="button" onClick={openAddModal} className="btn btn-primary">
            ➕ Register New Patient
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

      <div className="card p-4">
        {/* Sorting controls */}
        <div className="d-flex justify-between align-center mb-3 flex-wrap gap-2">
          <span className="text-sm text-muted font-semibold">Registered Patients Directory</span>
          <div className="d-flex align-center gap-2">
            <span className="text-xs text-muted">Sort:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="user.name">Name</option>
              <option value="age">Age</option>
            </select>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={patients}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyTitle="No patients registered yet"
          emptyMessage="Patients registered through the portal or added directly will appear here."
        />
      </div>

      {/* Add / Edit Patient Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon-badge">👤</span>
              <h3 className="modal-title">{editId ? 'Edit Patient Information' : 'Register New Patient'}</h3>
            </div>
            <form onSubmit={handleSave} className="mt-3">
              <div className="form-group">
                <label className="form-label">
                  Patient Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="patient@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group col">
                  <label className="form-label">
                    Password {editId && <span className="text-muted text-xs">(Keep blank)</span>}
                    {!editId && <span className="required">*</span>}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={editId ? '••••••••' : 'Min 6 chars'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editId}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1-555-0123"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group col">
                  <label className="form-label">
                    Age <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="130"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group col">
                  <label className="form-label">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Patient Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Patient Profile"
        message="Are you sure you want to delete this patient profile? All booked appointments and queue records for this patient will be permanently removed."
        confirmText="Confirm Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default ManagePatients;

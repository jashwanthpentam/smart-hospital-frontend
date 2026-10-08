import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
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
    departmentId: '',
    specialization: '',
    experienceYears: 0,
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/doctors/page?page=${page}&size=8&sort=${sortField},${sortDir}`);
      setDoctors(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError('Failed to fetch doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [page, sortField, sortDir]);

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      departmentId: departments[0]?.id || '',
      specialization: '',
      experienceYears: 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditId(doc.id);
    setFormData({
      name: doc.name,
      email: doc.email,
      password: '',
      departmentId: doc.departmentId,
      specialization: doc.specialization,
      experienceYears: doc.experienceYears,
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
        departmentId: Number(formData.departmentId),
        specialization: formData.specialization.trim(),
        experienceYears: Number(formData.experienceYears),
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editId) {
        await api.put(`/doctors/${editId}`, payload);
        setSuccess('Doctor profile updated successfully.');
      } else {
        await api.post('/doctors', payload);
        setSuccess('Doctor profile successfully created and activated.');
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/doctors/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null });
      setSuccess('Doctor record deleted successfully.');
      fetchDoctors();
    } catch (err) {
      setError('Failed to delete doctor.');
    }
  };

  const columns = [
    {
      header: 'Specialist Physician',
      key: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-main d-block">🩺 {row.name}</span>
          <span className="text-xs text-muted">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'departmentName',
      render: (row) => <span className="page-header-badge" style={{ fontSize: '0.72rem' }}>{row.departmentName}</span>,
    },
    {
      header: 'Specialization',
      key: 'specialization',
      render: (row) => <span className="text-sm font-semibold">{row.specialization}</span>,
    },
    {
      header: 'Experience',
      key: 'experienceYears',
      render: (row) => <span className="text-sm">{row.experienceYears} Years</span>,
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
        title="Manage Hospital Doctors"
        subtitle="Register, update profiles, assign departments, and configure physician credentials"
        actions={
          <button type="button" onClick={openAddModal} className="btn btn-primary">
            ➕ Add New Doctor
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
        {/* Sort & Filtering bar */}
        <div className="d-flex justify-between align-center mb-3 flex-wrap gap-2">
          <span className="text-sm text-muted font-semibold">Specialist Directory</span>
          <div className="d-flex align-center gap-2">
            <span className="text-xs text-muted">Sort:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="user.name">Name</option>
              <option value="experienceYears">Experience</option>
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
          data={doctors}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyTitle="No doctors registered yet"
          emptyMessage="Click 'Add New Doctor' above to register your first hospital physician."
        />
      </div>

      {/* Add / Edit Doctor Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon-badge">🩺</span>
              <h3 className="modal-title">{editId ? 'Edit Doctor Profile' : 'Register New Doctor'}</h3>
            </div>
            <form onSubmit={handleSave} className="mt-3">
              <div className="form-group">
                <label className="form-label">
                  Doctor Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dr. Arthur Conan"
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
                    placeholder="doctor@hospital.com"
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
                    Department <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col">
                  <label className="form-label">
                    Experience (Years) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="70"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Specialization Subfield <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Interventional Cardiology, Pediatric Surgery"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                />
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
                  {saving ? 'Saving...' : 'Save Doctor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Doctor Profile"
        message="Are you sure you want to remove this doctor from the system? All associated schedules and appointments will also be deleted."
        confirmText="Confirm Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default ManageDoctors;

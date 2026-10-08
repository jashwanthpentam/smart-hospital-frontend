import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      setError('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditId(dept.id);
    setFormData({ name: dept.name, description: dept.description || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      if (editId) {
        await api.put(`/departments/${editId}`, formData);
        setSuccess('Department updated successfully (@CacheEvict cleared cache).');
      } else {
        await api.post('/departments', formData);
        setSuccess('Department created successfully (@CacheEvict refreshed).');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/departments/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null });
      setSuccess('Department deleted successfully.');
      fetchDepartments();
    } catch (err) {
      setError('Failed to delete department.');
    }
  };

  const columns = [
    {
      header: 'ID',
      key: 'id',
      width: '70px',
      render: (row) => <span className="text-muted text-xs font-semibold">#{row.id}</span>,
    },
    {
      header: 'Department Name',
      key: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-main d-block">🏢 {row.name}</span>
        </div>
      ),
    },
    {
      header: 'Clinical Scope / Description',
      key: 'description',
      render: (row) => <span className="text-sm text-secondary">{row.description || '—'}</span>,
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
        title="Hospital Departments"
        subtitle="Manage clinical divisions and specialties cached with Spring Boot @Cacheable / @CacheEvict"
        badge={`${departments.length} Active Departments`}
        actions={
          <button type="button" onClick={openAddModal} className="btn btn-primary">
            ➕ Add Department
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
          data={departments}
          loading={loading}
          emptyTitle="No departments found"
          emptyMessage="Click 'Add Department' to create your first clinical department."
        />
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon-badge">🏢</span>
              <h3 className="modal-title">{editId ? 'Edit Department' : 'Create Hospital Department'}</h3>
            </div>
            <form onSubmit={handleSave} className="mt-3">
              <div className="form-group">
                <label className="form-label">
                  Department Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Cardiology, Neurology, Pediatrics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scope & Clinical Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe patient care and specialties in this department..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
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
                  {saving ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Department"
        message="Are you sure you want to delete this department? Any doctors currently assigned to it will require reassignment."
        confirmText="Confirm Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default ManageDepartments;

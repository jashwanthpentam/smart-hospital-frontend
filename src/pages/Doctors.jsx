import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [deptRes, docRes] = await Promise.all([
        api.get('/departments'),
        api.get(selectedDept ? `/doctors?departmentId=${selectedDept}` : '/doctors'),
      ]);
      setDepartments(deptRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      setError('Failed to load doctors or departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const handleBook = (doctorId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/patient/book?doctorId=${doctorId}`);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.departmentName && doc.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="container py-4">
      <PageHeader
        title="Medical Specialists & Doctors"
        subtitle="Browse credentialed physicians across hospital departments and schedule direct consultations"
        badge={`${doctors.length} Doctors Available`}
      />

      {/* Search & Filter Bar */}
      <div className="card p-3 mb-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="form-row" style={{ alignItems: 'center' }}>
          <div className="form-group col" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search doctor by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group col" style={{ marginBottom: 0, maxWidth: '280px' }}>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="">All Hospital Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchData} />

      {loading ? (
        <LoadingSpinner text="Retrieving available specialists..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon="🩺"
          title="No doctors found"
          description={
            searchTerm || selectedDept
              ? 'No medical specialists matched your active search filters.'
              : 'There are currently no doctors registered in the system.'
          }
          actionText={searchTerm || selectedDept ? 'Clear Filters' : undefined}
          onAction={() => {
            setSearchTerm('');
            setSelectedDept('');
          }}
        />
      ) : (
        <div className="doctor-cards-grid">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="card doctor-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="doctor-card-header mb-3">
                  <div className="stat-icon-wrapper stat-icon-blue">
                    <span>🩺</span>
                  </div>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.1rem' }}>{doc.name}</h3>
                    <span className="page-header-badge mt-1" style={{ display: 'inline-block' }}>
                      {doc.departmentName || 'General Medicine'}
                    </span>
                  </div>
                </div>

                <div className="p-3" style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div className="d-flex justify-between py-1">
                    <span className="text-muted">Specialization</span>
                    <span className="font-semibold text-main">{doc.specialization}</span>
                  </div>
                  <div className="d-flex justify-between py-1">
                    <span className="text-muted">Clinical Experience</span>
                    <span className="font-semibold text-main">{doc.experienceYears} Years</span>
                  </div>
                  <div className="d-flex justify-between py-1">
                    <span className="text-muted">Direct Email</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>{doc.email}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBook(doc.id)}
                className="btn btn-primary btn-block"
              >
                📅 Schedule Consultation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;

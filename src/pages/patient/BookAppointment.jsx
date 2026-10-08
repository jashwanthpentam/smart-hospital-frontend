import { getLocalDateString } from '../../utils/date';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedDoc = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: preselectedDoc,
    appointmentDate: getLocalDateString(),
    priorityType: 'NORMAL',
    symptoms: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [doctorRes, myApptRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/appointments/my').catch(() => ({ data: [] })),
        ]);
        const doctorList = Array.isArray(doctorRes.data) ? doctorRes.data : [];
        setDoctors(doctorList);
        setMyAppointments(Array.isArray(myApptRes.data) ? myApptRes.data : []);
        if (!preselectedDoc && doctorList.length > 0) {
          setFormData((prev) => ({ ...prev, doctorId: doctorList[0].id }));
        }
      } catch (err) {
        setError('Failed to load doctors list.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [preselectedDoc]);

  // Fetch doctor schedules when doctor changes
  useEffect(() => {
    if (formData.doctorId) {
      const fetchSchedules = async () => {
        try {
          const res = await api.get(`/schedules?doctorId=${formData.doctorId}`);
          const scheduleList = Array.isArray(res.data) ? res.data : [];
          setSchedules(scheduleList);

          // Prefer the currently selected date only when it is actually bookable.
          // This prevents the booking page from opening on a cutoff/full shift.
          if (scheduleList.length > 0) {
            const current = scheduleList.find((s) => s.availableDate === formData.appointmentDate);
            const currentIsBookable = current?.isBookingOpen === true && (current.remainingCapacity ?? 1) > 0;
            const firstBookable = scheduleList.find((s) => s.isBookingOpen === true && (s.remainingCapacity ?? 1) > 0);
            const firstFutureWithCapacity = scheduleList.find((s) => (s.remainingCapacity ?? 1) > 0);

            if (!currentIsBookable) {
              const nextSchedule = firstBookable || firstFutureWithCapacity;
              if (nextSchedule) {
                setFormData((prev) => ({ ...prev, appointmentDate: nextSchedule.availableDate }));
              }
            }
          }
        } catch (err) {
          console.error('Error fetching doctor schedules', err);
        }
      };
      fetchSchedules();
    }
  }, [formData.doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setPriority = (type) => {
    setFormData((prev) => ({ ...prev, priorityType: type }));
  };

  const selectedDoctorObj = doctors.find((d) => String(d.id) === String(formData.doctorId));
  const activeSchedule = schedules.find((s) => s.availableDate === formData.appointmentDate);

  // Compute capacity and cutoff
  const isFull = activeSchedule && activeSchedule.bookedCount >= activeSchedule.maxAppointments;
  const remainingSlots = activeSchedule ? Math.max(0, activeSchedule.maxAppointments - activeSchedule.bookedCount) : 0;
  
  // The backend is the source of truth for cutoff/capacity.
  // Fall back to the old calculation only if an older backend omits isBookingOpen.
  const isCutoffPassed = (() => {
    if (!activeSchedule) return false;
    if (typeof activeSchedule.isBookingOpen === 'boolean') {
      return !activeSchedule.isBookingOpen && !isFull;
    }
    const scheduleStartStr = `${activeSchedule.availableDate}T${activeSchedule.startTime}`;
    const scheduleStartTime = new Date(scheduleStartStr);
    const cutoffTime = new Date(scheduleStartTime.getTime() - 6 * 60 * 60 * 1000);
    return new Date() > cutoffTime;
  })();

  // ONE-BOOKING-PER-SCHEDULE: Check if patient already has an active appointment in this schedule.
  // Active statuses that block rebooking: WAITING, BOOKED, IN_PROGRESS.
  const ACTIVE_STATUSES = ['WAITING', 'BOOKED', 'IN_PROGRESS'];
  const isAlreadyBooked = activeSchedule
    ? myAppointments.some(
        (a) =>
          String(a.doctorId) === String(formData.doctorId) &&
          a.appointmentDate === formData.appointmentDate &&
          ACTIVE_STATUSES.includes(a.status)
      )
    : false;

  const isBookingAllowed = activeSchedule && !isFull && !isCutoffPassed && !isAlreadyBooked;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.doctorId) {
      setError('Please select a doctor.');
      return;
    }

    if (!activeSchedule) {
      setError('Selected doctor has no schedule available on this date. Please pick an available shift.');
      return;
    }

    if (isCutoffPassed) {
      setError('Booking is closed for this schedule shift (within 6-hour cutoff window).');
      return;
    }

    if (isFull) {
      setError('Schedule is full. New bookings are closed.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/appointments', {
        doctorId: Number(formData.doctorId),
        scheduleId: activeSchedule.id,
        appointmentDate: formData.appointmentDate,
        priorityType: formData.priorityType,
        symptoms: formData.symptoms.trim(),
      });

      // Fetch patient's immediate queue position from backend
      let queuePos = 1;
      let ahead = 0;
      try {
        const queueRes = await api.get('/queue/my');
        if (queueRes.data) {
          queuePos = queueRes.data.queuePosition || 1;
          ahead = queueRes.data.patientsAhead || 0;
        }
      } catch (qErr) {
        console.warn('Could not fetch queue status immediately', qErr);
      }

      setBookingConfirmation({
        appointment: res.data,
        doctor: selectedDoctorObj,
        schedule: activeSchedule,
        priorityType: formData.priorityType,
        queuePosition: queuePos,
        patientsAhead: ahead,
      });

      // Refresh own appointments so ALREADY BOOKED state shows correctly on return
      api.get('/appointments/my').then((r) => setMyAppointments(r.data || [])).catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book appointment. Please check schedule availability.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing clinical booking portal..." />;

  // Render Confirmation Modal/Screen after successful booking
  if (bookingConfirmation) {
    const { doctor, schedule, priorityType, queuePosition, patientsAhead } = bookingConfirmation;
    return (
      <div className="container py-4">
        <div className="mx-auto" style={{ maxWidth: '640px' }}>
          <div className="card p-4 text-center" style={{ borderTop: '5px solid #10b981' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <h2 className="font-bold text-main mb-1" style={{ fontSize: '1.5rem' }}>
              Appointment Booked Successfully
            </h2>
            <p className="text-secondary text-sm mb-4">
              Your appointment is booked for this doctor's schedule shift.
            </p>

            <div className="p-3 mb-4 text-left" style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div className="d-flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Doctor:</span>
                <span className="font-semibold text-main">{doctor?.name} ({doctor?.specialization})</span>
              </div>
              <div className="d-flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Department:</span>
                <span className="font-semibold text-main">{doctor?.departmentName}</span>
              </div>
              <div className="d-flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Date & Schedule:</span>
                <span className="font-semibold text-main">
                  📅 {schedule?.availableDate} • ⏰ {schedule?.startTime} - {schedule?.endTime}
                </span>
              </div>
              <div className="d-flex justify-between py-2 align-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Priority:</span>
                <PriorityBadge priority={priorityType} showScore />
              </div>
              <div className="d-flex justify-between py-2 align-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Status:</span>
                <StatusBadge status="WAITING" />
              </div>
              <div className="d-flex justify-between py-2 align-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">Current Position in Queue:</span>
                <span className="badge badge-dept font-bold" style={{ fontSize: '0.9rem' }}>
                  #{queuePosition}
                </span>
              </div>
              <div className="d-flex justify-between py-2 align-center">
                <span className="text-muted">Patients Ahead:</span>
                <span className="font-semibold">{patientsAhead}</span>
              </div>
            </div>

            <div className="p-3 mb-4 text-left" style={{ backgroundColor: '#eff6ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
              <p className="text-xs text-secondary mb-1" style={{ margin: 0, lineHeight: 1.5 }}>
                ℹ️ <strong>Triage Notice:</strong> Your appointment is booked for this doctor's schedule. Your treatment order is dynamically determined by the <strong>Java PriorityQueue</strong> (Emergency &gt; Urgent &gt; Normal). Patients do not receive a fixed individual treatment time.
              </p>
            </div>

            <div className="d-flex justify-center gap-3">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/patient/queue')}
              >
                📊 Go to Live Queue Status
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => {
                  setBookingConfirmation(null);
                  setFormData((prev) => ({ ...prev, symptoms: '' }));
                }}
              >
                Book Another Shift
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mx-auto" style={{ maxWidth: '680px' }}>
        <PageHeader
          title="Book Doctor Schedule"
          subtitle="Select a consulting specialist and clinic shift. Triage urgency dynamically sets queue order."
        />

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <div className="card p-4">
          <form onSubmit={handleSubmit} className="booking-form">
            {/* Doctor Selection */}
            <div className="form-group">
              <label className="form-label">
                Consulting Specialist <span className="required">*</span>
              </label>
              <select
                name="doctorId"
                className="form-select"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.departmentName} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Details Summary Box if selected */}
            {selectedDoctorObj && (
              <div className="p-3 mb-3" style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div className="d-flex align-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>🩺</span>
                  <div>
                    <span className="font-semibold text-sm d-block">{selectedDoctorObj.name}</span>
                    <span className="text-xs text-muted">
                      {selectedDoctorObj.departmentName} • {selectedDoctorObj.specialization} • {selectedDoctorObj.experienceYears} Years Exp
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="form-group">
              <label className="form-label">
                Consultation Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                className="form-control"
                min={getLocalDateString()}
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Schedules are open for the next 30 days.</span>
            </div>

            {/* Available Schedule Card (SCHEDULE-BASED BOOKING) */}
            <div className="form-group">
              <label className="form-label">Available Doctor Schedule</label>
              {activeSchedule ? (
                <div
                  className="p-3 mb-2"
                  style={{
                    backgroundColor: isBookingAllowed ? '#eff6ff' : '#fef2f2',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isBookingAllowed ? '#bfdbfe' : '#fecaca'}`,
                  }}
                >
                  <div className="d-flex justify-between align-center mb-2">
                    <span className="font-semibold text-sm text-main">
                      ⏰ Shift Hours: {activeSchedule.startTime} - {activeSchedule.endTime}
                    </span>
                    <span
                      className="status-pill"
                      style={{
                        backgroundColor: isAlreadyBooked ? '#f3e8ff' : isBookingAllowed ? '#dbeafe' : '#fee2e2',
                        color: isAlreadyBooked ? '#6b21a8' : isBookingAllowed ? '#1e40af' : '#991b1b',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {isAlreadyBooked ? 'ALREADY BOOKED' : isFull ? 'FULL' : isCutoffPassed ? 'BOOKING CLOSED' : 'OPEN'}
                    </span>
                  </div>

                  <div className="text-xs text-secondary d-flex flex-column gap-1">
                    <div>
                      ⏱️ <strong>Consultation Duration:</strong> 15 minutes (internal capacity unit)
                    </div>
                    <div>
                      👥 <strong>Capacity:</strong> {activeSchedule.maxAppointments} patients max
                    </div>
                    <div>
                      📊 <strong>Currently Booked:</strong> {activeSchedule.bookedCount} / {activeSchedule.maxAppointments}
                    </div>
                    <div>
                      🟢 <strong>Remaining Slots:</strong> {remainingSlots}
                    </div>
                    <div className="mt-1 text-muted">
                      🔒 <strong>Booking Closes:</strong> 6 hours before schedule start (
                      {activeSchedule.bookingCutoffTime || '06:00 hrs prior'})
                    </div>
                  </div>

                  {isCutoffPassed && (
                    <div className="alert-banner alert-banner-warning mt-2" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>
                      ⚠️ Same-day bookings must be submitted at least 6 hours before shift start.
                    </div>
                  )}

                  {isFull && (
                    <div className="alert-banner alert-banner-danger mt-2" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>
                      ❌ This schedule is at full capacity ({activeSchedule.maxAppointments} patients).
                    </div>
                  )}

                  {isAlreadyBooked && (
                    <div className="alert-banner mt-2" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe', borderRadius: 'var(--radius-sm)', color: '#6b21a8' }}>
                      🔒 You already have an active appointment in this schedule. Select a different doctor or date to book another appointment.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center" style={{ backgroundColor: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                  <p className="text-xs text-warning-text mb-1">
                    ⚠️ Doctor has no scheduled shift on <strong>{formData.appointmentDate}</strong>.
                  </p>
                  <p className="text-xs text-muted mb-0">
                    Please select a date from the doctor's available 30-day schedule window.
                  </p>
                </div>
              )}
            </div>

            {/* Urgency / Priority Selection with visual cards */}
            <div className="form-group">
              <label className="form-label">
                Triage Urgency Tier (Java PriorityQueue) <span className="required">*</span>
              </label>
              <p className="text-xs text-muted mb-2">
                Urgency determines waiting queue ranking: Emergency &gt; Urgent &gt; Normal.
              </p>

              <div className="priority-options-grid">
                <div
                  className={`priority-select-card ${formData.priorityType === 'NORMAL' ? 'selected-normal' : ''}`}
                  onClick={() => setPriority('NORMAL')}
                  role="button"
                  tabIndex="0"
                >
                  <div className="priority-card-header">
                    <PriorityBadge priority="NORMAL" />
                    <span className="text-xs font-semibold text-muted">Score 20</span>
                  </div>
                  <span className="font-semibold text-xs mt-1">Routine Care</span>
                  <p className="priority-card-desc mt-1">Regular health checks, general exams, follow-ups</p>
                </div>

                <div
                  className={`priority-select-card ${formData.priorityType === 'URGENT' ? 'selected-urgent' : ''}`}
                  onClick={() => setPriority('URGENT')}
                  role="button"
                  tabIndex="0"
                >
                  <div className="priority-card-header">
                    <PriorityBadge priority="URGENT" />
                    <span className="text-xs font-semibold text-muted">Score 50</span>
                  </div>
                  <span className="font-semibold text-xs mt-1">Acute Pain</span>
                  <p className="priority-card-desc mt-1">High fever, severe fractures, acute infections</p>
                </div>

                <div
                  className={`priority-select-card ${formData.priorityType === 'EMERGENCY' ? 'selected-emergency' : ''}`}
                  onClick={() => setPriority('EMERGENCY')}
                  role="button"
                  tabIndex="0"
                >
                  <div className="priority-card-header">
                    <PriorityBadge priority="EMERGENCY" />
                    <span className="text-xs font-semibold text-muted">Score 100</span>
                  </div>
                  <span className="font-semibold text-xs mt-1">Critical Care</span>
                  <p className="priority-card-desc mt-1">Severe cardiac distress, trauma, breathing difficulty</p>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div className="form-group">
              <label className="form-label">Symptoms & Reason for Consultation</label>
              <textarea
                name="symptoms"
                className="form-control"
                rows="3"
                placeholder="Describe your current symptoms or specific health concerns..."
                value={formData.symptoms}
                onChange={handleChange}
              ></textarea>
              <span className="form-hint">Provides doctor with immediate clinical context during call.</span>
            </div>

            {/* Summary Review */}
            <div className="p-3 mb-3" style={{ backgroundColor: '#fafbfc', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-medium)', fontSize: '0.825rem' }}>
              <span className="text-muted d-block mb-1 font-semibold">Booking Summary:</span>
              <div className="d-flex justify-between py-1">
                <span className="text-muted">Doctor:</span>
                <span className="font-semibold">{selectedDoctorObj ? selectedDoctorObj.name : 'Not selected'}</span>
              </div>
              <div className="d-flex justify-between py-1">
                <span className="text-muted">Date & Shift:</span>
                <span className="font-semibold">
                  {formData.appointmentDate} ({activeSchedule ? `${activeSchedule.startTime} - ${activeSchedule.endTime}` : 'No shift'})
                </span>
              </div>
              <div className="d-flex justify-between py-1 align-center">
                <span className="text-muted">Queue Priority:</span>
                <PriorityBadge priority={formData.priorityType} showScore />
              </div>
              <div className="d-flex justify-between py-1 align-center">
                <span className="text-muted">Treatment Order:</span>
                <span className="text-xs text-muted">Determined dynamically by PriorityQueue</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-2"
              disabled={submitting || !isBookingAllowed}
            >
              {submitting
                ? 'Confirming with Hospital Queue...'
                : isAlreadyBooked
                ? '🔒 Already Booked'
                : 'Book This Schedule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

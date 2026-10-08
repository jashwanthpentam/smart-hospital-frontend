import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PriorityBadge from '../components/PriorityBadge';

const Home = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="landing-badge">
            <span>🏥</span> Smart Healthcare Operations
          </div>
          <h1 className="landing-title">
            Smart Hospital Appointment & <span className="brand-gradient">Priority Queue</span> System
          </h1>
          <p className="landing-subtitle">
            A full-stack clinical management platform where patient appointments are dynamically triaged
            and ordered using a custom Java <code>PriorityQueue</code> algorithm with tie-breaker timestamp resolution.
          </p>

          <div className="landing-cta-row">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Book an Appointment
                </Link>
                <Link to="/doctors" className="btn btn-outline btn-lg">
                  Browse Specialists
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Staff / Patient Portal
                </Link>
              </>
            ) : (
              <Link
                to={
                  role === 'ADMIN'
                    ? '/admin/dashboard'
                    : role === 'DOCTOR'
                    ? '/doctor/dashboard'
                    : '/patient/dashboard'
                }
                className="btn btn-primary btn-lg"
              >
                Go to {role} Dashboard →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Priority Engine Architecture Showcase */}
      <section className="priority-rules-section">
        <div className="container">
          <div className="text-center mb-4">
            <span className="page-header-badge">Java Data Structures In Action</span>
            <h2 className="mt-2" style={{ fontSize: '1.85rem' }}>🎯 Java Priority Queue Urgency Tiers</h2>
            <p className="text-muted" style={{ maxWidth: '640px', margin: '0.4rem auto 0 auto' }}>
              Unlike standard FIFO waiting lists, patients are organized dynamically by clinical severity score and arrival time.
            </p>
          </div>

          <div className="landing-cards-grid">
            <div className="engine-card engine-card-emergency">
              <div className="d-flex justify-between align-center mb-2">
                <span style={{ fontSize: '1.75rem' }}>🚨</span>
                <PriorityBadge priority="EMERGENCY" showScore />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Critical Medical Emergency</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.45' }}>
                Severe cardiac distress, respiratory arrest, major trauma, or unconsciousness. Given top priority in the Java PriorityQueue and called first.
              </p>
            </div>

            <div className="engine-card engine-card-urgent">
              <div className="d-flex justify-between align-center mb-2">
                <span style={{ fontSize: '1.75rem' }}>⚡</span>
                <PriorityBadge priority="URGENT" showScore />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Acute / Urgent Care</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.45' }}>
                High fever, severe fractures, acute abdominal pain, or sudden allergic reactions. Preempts normal queue to receive expedited attention.
              </p>
            </div>

            <div className="engine-card engine-card-normal">
              <div className="d-flex justify-between align-center mb-2">
                <span style={{ fontSize: '1.75rem' }}>📋</span>
                <PriorityBadge priority="NORMAL" showScore />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Routine Consultation</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.45' }}>
                General health checkups, follow-up evaluations, prescription renewals, and non-acute outpatient consultations ordered by arrival time.
              </p>
            </div>
          </div>

          <div className="card p-3 text-center" style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: '#ffffff' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              ⏱️ <strong>Java Comparator Tie-Breaker Rule:</strong> When two patients have the same priority level, the Java comparator evaluates <code>arrivalTime</code> (FIFO) so earlier arrivals are attended first.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="workflow-section py-4">
        <div className="container">
          <div className="text-center mb-4">
            <span className="page-header-badge">End-to-End Flow</span>
            <h2 className="mt-2" style={{ fontSize: '1.85rem' }}>🔄 Consultation Workflow</h2>
          </div>

          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="step-num">1</div>
              <h4>Patient Booking</h4>
              <p className="text-muted text-sm mt-1">Patient chooses department, specialist, date, and logs their medical symptoms.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">2</div>
              <h4>Dynamic Triage</h4>
              <p className="text-muted text-sm mt-1">Severity is rated (Emergency, Urgent, Normal) and patient is registered in the doctor's queue.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">3</div>
              <h4>Java PriorityQueue</h4>
              <p className="text-muted text-sm mt-1">Spring Boot queue engine sorts waiting patients via Java Comparator with tie-breaker logic.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">4</div>
              <h4>Doctor Consultation</h4>
              <p className="text-muted text-sm mt-1">Doctor calls next highest-priority patient: <code>CALL NEXT → START → COMPLETE</code>.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

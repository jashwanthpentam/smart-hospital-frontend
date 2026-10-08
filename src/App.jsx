import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import QueueStatus from './pages/patient/QueueStatus';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorQueue from './pages/doctor/DoctorQueue';
import DoctorSchedule from './pages/doctor/DoctorSchedule';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageAppointments from './pages/admin/ManageAppointments';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/doctors" element={<Doctors />} />

                {/* Patient Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
                  <Route path="/patient/dashboard" element={<PatientDashboard />} />
                  <Route path="/patient/book" element={<BookAppointment />} />
                  <Route path="/patient/appointments" element={<MyAppointments />} />
                  <Route path="/patient/queue" element={<QueueStatus />} />
                </Route>

                {/* Doctor Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                  <Route path="/doctor/queue" element={<DoctorQueue />} />
                  <Route path="/doctor/schedule" element={<DoctorSchedule />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/doctors" element={<ManageDoctors />} />
                  <Route path="/admin/patients" element={<ManagePatients />} />
                  <Route path="/admin/departments" element={<ManageDepartments />} />
                  <Route path="/admin/appointments" element={<ManageAppointments />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="footer text-center py-3 text-muted text-sm">
              <div className="container">
                Smart Hospital Appointment & Priority Queue Management System • B.Tech Java Full Stack Academic Project
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

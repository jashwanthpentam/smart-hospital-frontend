import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`;

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="brand-logo-icon">
            <span>+</span>
          </div>
          <div className="brand-titles">
            <span className="brand-main">Smart Hospital</span>
            <span className="brand-sub">Priority Queue Engine</span>
          </div>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu-wrapper ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            {!isAuthenticated ? (
              <>
                <NavLink to="/doctors" className={navLinkClass} onClick={closeMenu}>
                  Find Doctors
                </NavLink>
                <div className="nav-auth-buttons">
                  <Link to="/login" className="btn btn-sm btn-outline" onClick={closeMenu}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-primary" onClick={closeMenu}>
                    Register
                  </Link>
                </div>
              </>
            ) : (
              <>
                {role === 'PATIENT' && (
                  <>
                    <NavLink to="/patient/dashboard" className={navLinkClass} onClick={closeMenu}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/doctors" className={navLinkClass} onClick={closeMenu}>
                      Find Doctors
                    </NavLink>
                    <NavLink to="/patient/book" className={navLinkClass} onClick={closeMenu}>
                      Book Appointment
                    </NavLink>
                    <NavLink to="/patient/appointments" className={navLinkClass} onClick={closeMenu}>
                      My Appointments
                    </NavLink>
                    <NavLink
                      to="/patient/queue"
                      className={({ isActive }) =>
                        `nav-link nav-highlight ${isActive ? 'nav-highlight-active' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <span className="nav-live-dot" />
                      Live Queue
                    </NavLink>
                  </>
                )}

                {role === 'DOCTOR' && (
                  <>
                    <NavLink to="/doctor/dashboard" className={navLinkClass} onClick={closeMenu}>
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/doctor/queue"
                      className={({ isActive }) =>
                        `nav-link nav-highlight ${isActive ? 'nav-highlight-active' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <span className="nav-live-dot" />
                      Queue Console
                    </NavLink>
                    <NavLink to="/doctor/schedule" className={navLinkClass} onClick={closeMenu}>
                      My Schedule
                    </NavLink>
                  </>
                )}

                {role === 'ADMIN' && (
                  <>
                    <NavLink to="/admin/dashboard" className={navLinkClass} onClick={closeMenu}>
                      Overview
                    </NavLink>
                    <NavLink to="/admin/doctors" className={navLinkClass} onClick={closeMenu}>
                      Doctors
                    </NavLink>
                    <NavLink to="/admin/patients" className={navLinkClass} onClick={closeMenu}>
                      Patients
                    </NavLink>
                    <NavLink to="/admin/departments" className={navLinkClass} onClick={closeMenu}>
                      Departments
                    </NavLink>
                    <NavLink to="/admin/appointments" className={navLinkClass} onClick={closeMenu}>
                      Appointments
                    </NavLink>
                  </>
                )}

                {/* User Profile & Logout */}
                <div className="nav-user-pill">
                  <div className="user-info-text">
                    <span className="user-name-label">{user?.name || user?.username || 'User'}</span>
                    <span className={`user-role-badge role-${role?.toLowerCase()}`}>
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-xs btn-logout"
                    title="Sign Out"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

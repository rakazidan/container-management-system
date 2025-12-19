import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="company-logo">
          <img src="/assets/Kiora.png" alt="Kiora" className="logo-image" />
        </div>

        <div className="navbar-center">
          <Link to="/dashboard" className={`nav-menu-item ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/monitoring" className={`nav-menu-item ${location.pathname === '/monitoring' ? 'active' : ''}`}>
            Monitoring (Grid)
          </Link>
          <Link to="/monitoring-canvas" className={`nav-menu-item ${location.pathname === '/monitoring-canvas' ? 'active' : ''}`}>
            Monitoring (GPS)
          </Link>
          <Link to="/master" className={`nav-menu-item ${location.pathname === '/master' ? 'active' : ''}`}>
            Master
          </Link>
        </div>
      </div>

      <div className="navbar-right">
        <button className="nav-icon-btn" title="Notifications">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge">3</span>
        </button>
        <button className="nav-icon-btn profile-btn" title="Profile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

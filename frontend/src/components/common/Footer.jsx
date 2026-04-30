import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">⚗ ResearchScholar</span>
          <p>A platform for academics to discover, share,<br />and manage research publications.</p>
        </div>
        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/publications">Browse Publications</Link>
          {!user && <Link to="/register">Join as Researcher</Link>}
          {!user && <Link to="/login">Sign In</Link>}
          {user && <Link to="/dashboard">Dashboard</Link>}
        </div>
        <div className="footer-links">
          <h4>Workflow</h4>
          {user?.role === 'researcher' && <Link to="/submit">Submit Paper</Link>}
          {user?.role === 'researcher' && <Link to="/my-papers">My Submissions</Link>}
          {user?.role === 'reviewer' && <Link to="/dashboard">Assigned Papers</Link>}
          {user?.role === 'editor' && <Link to="/dashboard">Manage Submissions</Link>}
          {user?.role === 'editor' && <Link to="/analytics">Analytics</Link>}
          {!user && <Link to="/publications">Publications</Link>}
          {user && <Link to="/publications">Publications</Link>}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ResearchScholar. Built with MERN Stack.</span>
      </div>
    </footer>
  );
};

export default Footer;

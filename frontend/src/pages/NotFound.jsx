import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <div className="notfound-page">
    <div className="notfound-content fade-up">
      <div className="notfound-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div className="notfound-actions">
        <Link to="/"            className="btn btn-primary">Go Home</Link>
        <Link to="/publications" className="btn btn-outline">Browse Publications</Link>
      </div>
    </div>
  </div>
);

export default NotFound;

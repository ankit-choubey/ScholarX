import React from 'react';
import { FiUser } from 'react-icons/fi';

const Authors = () => (
  <div className="page-wrapper fade-up">
    <h1 className="section-title">Authors</h1>
    <div className="divider" />
    <p className="section-subtitle">Browse researchers and academics on the platform.</p>
    <div className="empty-state">
      <FiUser />
      <h3>Authors directory coming soon</h3>
      <p>This feature will be available once the backend Authors API is ready.</p>
    </div>
  </div>
);

export default Authors;
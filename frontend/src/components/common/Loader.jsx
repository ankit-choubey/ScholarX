import React from 'react';

const Loader = ({ text, label, fullScreen }) => {
  const message = label || text || 'Loading...';

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'rgba(10,10,18,0.7)', zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-wrap">
      <div style={{ textAlign: 'center' }}>
        <div className="loader" />
        {message && <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default Loader;

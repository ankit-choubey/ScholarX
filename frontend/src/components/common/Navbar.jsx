import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiBook, FiPlusCircle, FiLogOut, FiUser, FiGrid, FiBarChart2, FiSearch } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const close = () => setOpen(false);

  const navItemsByRole = {
    guest: [
      { to: '/', label: 'Home', end: true, icon: <FiGrid /> },
      { to: '/publications', label: 'Publications', icon: <FiBook /> },
      { to: '/login', label: 'Login', icon: <FiUser /> },
      { to: '/register', label: 'Register', icon: <FiPlusCircle /> },
    ],
    researcher: [
      { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
      { to: '/submit', label: 'Submit Paper', icon: <FiPlusCircle /> },
      { to: '/my-papers', label: 'My Submissions', icon: <FiBook /> },
      { to: '/search', label: 'Search', icon: <FiSearch /> },
      { to: '/publications', label: 'Publications', icon: <FiBook /> },
    ],
    reviewer: [
      { to: '/dashboard', label: 'Assigned Papers', icon: <FiGrid /> },
      { to: '/search', label: 'Search', icon: <FiSearch /> },
      { to: '/publications', label: 'Publications', icon: <FiBook /> },
    ],
    editor: [
      { to: '/dashboard', label: 'Manage Submissions', icon: <FiGrid /> },
      { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
      { to: '/publications', label: 'Publications', icon: <FiBook /> },
    ],
  };

  const currentRole = user?.role || 'guest';
  const navItems = navItemsByRole[currentRole];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={close}>
          <span className="logo-icon">⚗</span>
          <span className="logo-text">Scholar<span className="logo-accent">X</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar-links">
          {navItems.map((item) => (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="navbar-auth">
          {user ? (
            <>
              <span className="user-name"><FiUser /> {user.name?.split(' ')[0]}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <span className="user-name">Guest</span>
          )}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        {navItems.map((item) => (
          <NavLink key={`mob-${item.label}-${item.to}`} to={item.to} end={item.end} className="mob-link" onClick={close}>
            {item.icon} {item.label}
          </NavLink>
        ))}
        {user ? (
          <>
            <button className="mob-link mob-logout" onClick={handleLogout}><FiLogOut /> Logout</button>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { getErrorMessage } from '../utils/helpers';
import './AuthPages.css';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onChange' });
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const getRoleLandingPath = (role) => {
    if (role === 'researcher') return '/my-papers';
    if (role === 'editor') return '/analytics';
    return '/dashboard';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      const authData = res.data.data;
      login(authData.token, authData.user);
      navigate(from || getRoleLandingPath(authData.user?.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb" />
      <div className="auth-card fade-up">
        <div className="auth-logo">⚗</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your ResearchScholar account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input
              type="email"
              placeholder="you@university.edu"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            <FiLogIn /> {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
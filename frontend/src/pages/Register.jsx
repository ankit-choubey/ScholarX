import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { getErrorMessage } from '../utils/helpers';
import './AuthPages.css';

const VALID_ROLES = ['researcher', 'reviewer', 'editor'];

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ mode: 'onChange' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const getRoleLandingPath = (role) => {
    if (role === 'researcher') return '/my-papers';
    if (role === 'editor') return '/analytics';
    return '/dashboard';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const res = await registerUser(payload);
      login(res.data.data.token, res.data.data.user);
      navigate(getRoleLandingPath(res.data.data.user?.role));
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
        <h1 className="auth-title">Join ResearchScholar</h1>
        <p className="auth-subtitle">Create your free researcher account today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input
              placeholder="Dr. Jane Smith"
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Min 2 characters' },
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input
              type="email"
              placeholder="you@university.edu"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Invalid email' },
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <input
              type="password"
              placeholder="Min 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label><FiLock /> Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>

          <div className="form-group">
            <label><FiUser /> Role</label>
            <select
              defaultValue=""
              {...register('role', {
                required: 'Role is required',
                validate: (v) => VALID_ROLES.includes(v) || 'Invalid role selected',
              })}
            >
              <option value="" disabled>Select role</option>
              <option value="researcher">Researcher</option>
              <option value="reviewer">Reviewer</option>
              <option value="editor">Editor</option>
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            <FiUserPlus /> {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

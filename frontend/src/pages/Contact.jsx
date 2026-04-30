import React, { useState } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="page-wrapper fade-up">
      <h1 className="section-title">Contact Us</h1>
      <div className="divider" />
      <p className="section-subtitle">Have a question or feedback? We'd love to hear from you.</p>

      <div className="contact-layout">
        <div className="contact-info">
          <div className="card">
            <FiMail className="contact-icon" />
            <h3>Email Us</h3>
            <p>support@researchscholar.com</p>
          </div>
        </div>

        <form className="contact-form card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Jane Smith"
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@university.edu"
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your message here…"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <FiSend /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
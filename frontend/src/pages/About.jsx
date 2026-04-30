import React from 'react';
import './About.css';

const About = () => (
  <div className="page-wrapper fade-up">
    <h1 className="section-title">About ResearchScholar</h1>
    <div className="divider" />
    <p className="section-subtitle">
      ResearchScholar is an open academic platform built to help researchers
      publish, discover, and collaborate on scholarly work across all disciplines.
    </p>

    <div className="about-grid">
      <div className="card">
        <h3>🎯 Our Mission</h3>
        <p>To democratize access to academic research and make knowledge freely available to everyone worldwide.</p>
      </div>
      <div className="card">
        <h3>🔬 What We Do</h3>
        <p>We provide a platform for researchers to submit papers, browse publications, and connect with the academic community.</p>
      </div>
      <div className="card">
        <h3>🌍 Who We Serve</h3>
        <p>Students, researchers, professors, and institutions across every field of study and every corner of the globe.</p>
      </div>
    </div>
  </div>
);

export default About;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiUpload, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/common/ParticleBackground';
import PublicationCard from '../components/publications/PublicationCard';
import { getAllPublications } from '../services/publicationService';
import './Home.css';

const FEATURES = [
  { icon: <FiSearch />, title: 'Discover Research', desc: 'Search thousands of peer-reviewed papers across every academic discipline.' },
  { icon: <FiUpload />, title: 'Publish Your Work', desc: 'Submit and manage your publications with a seamless, intuitive interface.' },
  { icon: <FiUsers />, title: 'Collaborate', desc: 'Connect with researchers worldwide and build your academic network.' },
];

const Home = () => {
  const { user } = useAuth();
  const [featuredPubs, setFeaturedPubs] = useState([]);
  const [pubsLoading, setPubsLoading] = useState(true);

  useEffect(() => {
    getAllPublications({ page: 1, limit: 3 })
      .then((res) => {
        const data = res.data;
        const items = data?.data?.items || data?.publications || (Array.isArray(data) ? data : []);
        setFeaturedPubs(items);
      })
      .catch(() => setFeaturedPubs([]))
      .finally(() => setPubsLoading(false));
  }, []);

  return (
    <div className="home">

       <ParticleBackground /> 

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-content fade-up">
          <div className="hero-label">Academic Research Platform</div>
          <h1 className="hero-title">
            Where Knowledge<br />
            <span className="hero-gold">Meets Discovery</span>
          </h1>
          <p className="hero-subtitle">
            A curated platform for researchers to publish, explore, and cite
            scholarly work across all disciplines of science and humanities.
          </p>
          <div className="hero-ctas">
            <Link to="/publications" className="btn btn-primary">
              Browse Publications <FiArrowRight />
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline">
                Join as Researcher
              </Link>
            )}
            {user && (
              <Link to="/submit" className="btn btn-outline">
                Submit a Paper
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-bar fade-up delay-2">
        <div className="stat"><span className="stat-num">10K+</span><span className="stat-label">Publications</span></div>
        <div className="stat-div" />
        <div className="stat"><span className="stat-num">2.4K</span><span className="stat-label">Researchers</span></div>
        <div className="stat-div" />
        <div className="stat"><span className="stat-num">140+</span><span className="stat-label">Institutions</span></div>
        <div className="stat-div" />
        <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Disciplines</span></div>
      </section>

      {/* Featured Publications */}
      <section className="featured-pubs page-wrapper fade-up">
        <div className="section-header">
          <p className="section-eyebrow">Latest Research</p>
          <h2 className="section-title">Featured Publications</h2>
          <div className="divider" />
        </div>

        {pubsLoading ? (
          <div className="loader-wrap"><div className="loader" /></div>
        ) : (
          <div className="pub-grid">
            {featuredPubs.map((pub, i) => (
              <PublicationCard key={pub._id} publication={pub} />
            ))}
          </div>
        )}

        <div className="featured-cta">
          <Link to="/publications" className="btn btn-outline">
            View All Publications <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works fade-up">
        <div className="page-wrapper">
          <div className="section-header">
            <p className="section-eyebrow">Get Started</p>
            <h2 className="section-title">How It Works</h2>
            <div className="divider" />
          </div>

          <div className="steps-grid">
            <div className="step-card fade-up delay-1">
              <div className="step-number">01</div>
              <div className="step-icon">👤</div>
              <h3>Create Your Account</h3>
              <p>Sign up for free as a researcher. Set up your profile and join the ScholarX academic community.</p>
            </div>

            <div className="step-card fade-up delay-2">
              <div className="step-number">02</div>
              <div className="step-icon">📄</div>
              <h3>Submit Your Paper</h3>
              <p>Upload your research paper with title, abstract, authors, keywords and category. Takes less than 5 minutes.</p>
            </div>

            <div className="step-card fade-up delay-3">
              <div className="step-number">03</div>
              <div className="step-icon">🌍</div>
              <h3>Get Discovered</h3>
              <p>Your research becomes searchable by thousands of academics, students and institutions worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="browse-categories page-wrapper fade-up">
        <div className="section-header">
          <p className="section-eyebrow">Explore</p>
          <h2 className="section-title">Browse by Category</h2>
          <div className="divider" />
        </div>

        <div className="categories-grid">
          {[
            { name: 'Artificial Intelligence', icon: '🤖', count: '1.2K' },
            { name: 'Biology',                 icon: '🧬', count: '980'  },
            { name: 'Physics',                 icon: '⚛️',  count: '850'  },
            { name: 'Medicine',                icon: '🏥', count: '1.5K' },
            { name: 'Computer Science',        icon: '💻', count: '2.1K' },
            { name: 'Mathematics',             icon: '📐', count: '620'  },
            { name: 'Chemistry',               icon: '🧪', count: '740'  },
            { name: 'Psychology',              icon: '🧠', count: '430'  },
          ].map((cat, i) => (
            <Link
              key={i}
              to={`/publications?category=${encodeURIComponent(cat.name)}`}
              className={`cat-card fade-up delay-${Math.min(i + 1, 6)}`}
            >
              <span className="cat-card-icon">{cat.icon}</span>
              <span className="cat-card-name">{cat.name}</span>
              <span className="cat-card-count">{cat.count} papers</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials fade-up">
        <div className="page-wrapper">
          <div className="section-header">
            <p className="section-eyebrow">Researchers Love Us</p>
            <h2 className="section-title">What Academics Say</h2>
            <div className="divider" />
          </div>

          <div className="testimonials-grid">
            {[
              {
                quote: "ScholarX completely changed how I share my research. The platform is intuitive and my papers reached a global audience within days.",
                name:  "Dr. Priya Sharma",
                role:  "Professor of Neuroscience, IIT Bombay",
                init:  "PS",
              },
              {
                quote: "The best academic platform I have used. Clean interface, fast search, and the category filtering is incredibly helpful for my literature reviews.",
                name:  "James Okafor",
                role:  "PhD Researcher, University of Lagos",
                init:  "JO",
              },
              {
                quote: "I submitted my first paper and got cited by three other researchers within a month. ScholarX truly connects the global research community.",
                name:  "Dr. Li Wei",
                role:  "Research Scientist, Tsinghua University",
                init:  "LW",
              },
            ].map((t, i) => (
              <div key={i} className={`testimonial-card fade-up delay-${i + 1}`}>
                <div className="quote-mark">"</div>
                <p className="quote-text">{t.quote}</p>
                <div className="quote-author">
                  <div className="author-avatar">{t.init}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features page-wrapper">
        <div className="section-header">
          <p className="section-eyebrow">Why ResearchScholar</p>
          <h2 className="section-title">Everything You Need for Academic Research</h2>
          <div className="divider" />
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feature-card fade-up delay-${i + 2}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      {!user && (
        <section className="cta-banner fade-up">
          <div className="cta-inner">
            <h2>Ready to share your research?</h2>
            <p>Join thousands of researchers already on the platform.</p>
            <Link to="/register" className="btn btn-primary">
              Get Started Free <FiArrowRight />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

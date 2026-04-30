import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiBook } from 'react-icons/fi';
import { formatDate, truncate, categoryColor } from '../../utils/helpers';
import './PublicationCard.css';

const PublicationCard = ({ publication }) => {
  const { _id, paperId, journalName, publicationDate, doi } = publication;

  // paperId is populated from backend — it contains the paper details
  const paper = paperId || {};
  const title    = paper.title    || 'Untitled Paper';
  const abstract = paper.abstract || '';
  const keywords = paper.keywords || [];
  const author   = paper.authorId?.name || 'Unknown Author';
  // Publications don't have a "category" field — use keywords[0] as a label fallback
  const category = keywords[0] || 'Research';
  const color    = categoryColor(category);

  return (
    <article className="pub-card fade-up">
      <div className="pub-card-top">
        <span className="pub-category" style={{ '--cat-color': color }}>
          {journalName || category}
        </span>
      </div>

      <h3 className="pub-title">
        <Link to={`/publications/${_id}`}>{title}</Link>
      </h3>

      <div className="pub-meta">
        <span><FiBook /> {author}</span>
        <span><FiCalendar /> {formatDate(publicationDate)}</span>
      </div>

      <p className="pub-abstract">{truncate(abstract, 140)}</p>

      {keywords.length > 0 && (
        <div className="pub-keywords">
          {keywords.slice(0, 3).map((kw, i) => (
            <span key={i} className="kw-tag">{kw.trim()}</span>
          ))}
        </div>
      )}

      {doi && (
        <p className="pub-doi" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          DOI: {doi}
        </p>
      )}

      <Link to={`/publications/${_id}`} className="pub-read-more">
        Read Paper <FiArrowRight />
      </Link>
    </article>
  );
};

export default PublicationCard;

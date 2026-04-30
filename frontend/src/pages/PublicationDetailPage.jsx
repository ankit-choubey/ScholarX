import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublicationById } from '../services/publicationService';
import { toast } from 'react-toastify';
import Loader from '../components/common/Loader';
import { FiArrowLeft, FiExternalLink, FiCalendar, FiBook, FiTag } from 'react-icons/fi';
import { formatDate } from '../utils/helpers';
import './PublicationDetailPage.css';

const PublicationDetailPage = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicationById(id)
      .then((res) => {
        const p = res.data?.data?.publication || res.data;
        setPub(p);
      })
      .catch(() => {
        toast.error('Publication not found.');
        navigate('/publications');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Loader text="Loading publication…" />;
  if (!pub)    return null;

  // paperId is populated by the backend
  const paper    = pub.paperId || {};
  const title    = paper.title    || 'Untitled';
  const abstract = paper.abstract || '';
  const keywords = Array.isArray(paper.keywords) ? paper.keywords
    : paper.keywords?.split(',').map((k) => k.trim()).filter(Boolean) || [];
  const author   = paper.authorId?.name || 'Unknown Author';

  return (
    <div className="page-wrapper detail-page fade-up">
      {/* Back */}
      <Link to="/publications" className="back-link">
        <FiArrowLeft /> Back to Publications
      </Link>

      {/* Header */}
      <div className="detail-header">
        <h1 className="detail-title">{title}</h1>

        <div className="detail-meta">
          <div className="meta-item"><FiBook /><span><strong>Journal:</strong> {pub.journalName}</span></div>
          <div className="meta-item"><strong>Author:</strong>&nbsp;{author}</div>
          {pub.publicationDate && (
            <div className="meta-item"><FiCalendar /><span><strong>Published:</strong> {formatDate(pub.publicationDate)}</span></div>
          )}
          {pub.volume && <div className="meta-item"><span>Vol. {pub.volume}{pub.issue ? `, No. ${pub.issue}` : ''}</span></div>}
        </div>
      </div>

      <div className="detail-body">
        {/* Abstract */}
        <section className="detail-section">
          <h2>Abstract</h2>
          <div className="divider" />
          <p className="abstract-text">{abstract}</p>
        </section>

        {/* Keywords */}
        {keywords.length > 0 && (
          <section className="detail-section">
            <h2><FiTag /> Keywords</h2>
            <div className="divider" />
            <div className="keywords-wrap">
              {keywords.map((kw, i) => <span key={i} className="kw-tag">{kw}</span>)}
            </div>
          </section>
        )}

        {/* DOI */}
        {pub.doi && (
          <section className="detail-section">
            <h2>DOI / External Link</h2>
            <div className="divider" />
            <a
              href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
              target="_blank" rel="noreferrer" className="doi-link"
            >
              <FiExternalLink /> {pub.doi}
            </a>
          </section>
        )}
      </div>
    </div>
  );
};

export default PublicationDetailPage;

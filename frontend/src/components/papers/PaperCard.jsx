import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function PaperCard({ paper, role, onDelete, canDelete = false }) {
  const coAuthorCount = Array.isArray(paper.coAuthors) ? paper.coAuthors.length : 0;
  const reviewerSubmitted = Boolean(paper.myReview || paper.hasReviewed);
  const showDelete = role === 'researcher' && canDelete && typeof onDelete === 'function';

  return (
    <div className="card paper-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="paper-title">{paper.title}</h3>
          <p className="paper-meta mt-1">{paper.authorId?.name || 'You'} • {formatDate(paper.createdAt || paper.submissionDate)}</p>
        </div>
        <StatusBadge status={paper.status} />
      </div>

      <p className="paper-abstract line-clamp-3">{paper.abstract}</p>

      <div className="flex flex-wrap gap-2">
        {(paper.keywords || []).slice(0, 6).map((k) => <span key={k} className="keyword-chip">{k}</span>)}
      </div>

      <div className="mt-auto space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>{coAuthorCount > 0 ? `${coAuthorCount} co-author(s)` : 'Single author submission'}</span>
        </div>
        <div>
          <StatusBadge status={paper.status} />
        </div>
      </div>

      <div className="action-row">
        <Link to={`/papers/${paper._id}`} className={`btn btn-sm ${role === 'reviewer' ? 'btn-outline' : 'btn-primary'}`}>Open Details</Link>
        {role === 'reviewer' && (
          <Link to={`/review/${paper._id}`} className={`btn btn-sm ${reviewerSubmitted ? 'btn-ghost' : 'btn-primary'}`}>
            {reviewerSubmitted ? 'Update Review' : 'Review'}
          </Link>
        )}
        {role === 'researcher' && paper.status === 'revision_required' && <Link to={`/papers/${paper._id}`} className="btn btn-outline btn-sm">Revise</Link>}
        {showDelete && <button className="btn btn-danger btn-sm" onClick={() => onDelete(paper)}>Delete</button>}
      </div>
    </div>
  );
}

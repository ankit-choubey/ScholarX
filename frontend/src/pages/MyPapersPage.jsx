import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import PaperCard from '../components/papers/PaperCard';
import PageHeader from '../components/common/PageHeader';
import InfoCard from '../components/common/InfoCard';
import EmptyState from '../components/common/EmptyState';
import { deletePaper, getMyPapers } from '../services/paperService';
import { getErrorMessage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { STATUS_LABELS } from '../utils/constants';
import '../components/common/ui.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'revision_required', label: 'Revision Required' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'published', label: 'Published' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyPapersPage() {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getMyPapers()
      .then((res) => setPapers(res.data.data.items || []))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const onDelete = async (paper) => {
    const ownerId = String(paper.authorId?._id || paper.authorId || '');
    if (ownerId !== String(user?._id || '')) return;
    if (paper.status !== 'submitted') return;
    if (!window.confirm(`Delete "${paper.title}"?`)) return;

    try {
      await deletePaper(paper._id);
      setPapers((prev) => prev.filter((p) => p._id !== paper._id));
      toast.success('Paper deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader fullScreen label="Loading your submissions..." />;

  const filtered = filter === 'all' ? papers : papers.filter((p) => p.status === filter);
  const counts = papers.reduce((acc, p) => {
    acc.total += 1;
    if (p.status === 'under_review') acc.underReview += 1;
    if (p.status === 'revision_required') acc.revisionRequired += 1;
    if (p.status === 'published') acc.published += 1;
    return acc;
  }, { total: 0, underReview: 0, revisionRequired: 0, published: 0 });

  return (
    <main className="page-shell">
      <PageHeader title="My Submissions" subtitle="Track manuscript status, reviews, revisions, and publication outcomes." />

      <section className="section-card">
        <div className="info-grid">
          <InfoCard label="Total Submissions" value={counts.total} />
          <InfoCard label="Under Review" value={counts.underReview} />
          <InfoCard label="Revision Required" value={counts.revisionRequired} />
          <InfoCard label="Published" value={counts.published} />
        </div>
      </section>

      <div className="mt-5 filters-row">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilter(tab.key)}
          >
            {STATUS_LABELS[tab.key] || tab.label}
          </button>
        ))}
      </div>

      <div className="papers-grid cards-section-gap">
        {filtered.length ? filtered.map((paper) => (
          <PaperCard key={paper._id} paper={paper} role={user.role} onDelete={onDelete} canDelete={false} />
        )) : (
          <EmptyState title="No submissions yet" body="Submit a manuscript to begin the review workflow." />
        )}
      </div>
    </main>
  );
}

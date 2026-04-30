import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PaperCard from '../components/papers/PaperCard';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { searchPapers } from '../services/searchService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import { STATUS_LABELS } from '../utils/constants';
import '../components/common/ui.css';

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setItems([]);
      return;
    }
    if (normalizedQuery.length < 2) {
      setItems([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = status ? { status } : {};
        const res = await searchPapers(normalizedQuery, params);
        setItems(res.data.data.items || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, status]);

  const showTypeMoreHint = query.trim().length > 0 && query.trim().length < 2;

  return (
    <main className="page-shell">
      <PageHeader title="Search Papers" subtitle="Search manuscript title, abstract, keywords, and status." />
      <div className="section-card">
        <div className="control-grid">
          <div>
            <label className="helper-text mb-1 block">Query</label>
            <input
              className="input"
              placeholder="Search by title, abstract, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="helper-text mb-1 block">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="search-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setQuery((v) => v.trim())}>Search</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setStatus(''); }}>Clear Filters</button>
        </div>
      </div>

      {showTypeMoreHint && <p className="helper-text mt-3">Type at least 2 characters to start searching.</p>}
      {loading ? <Loader label="Searching..." /> : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((paper) => <PaperCard key={paper._id} paper={paper} role={user?.role} />)}
          {!items.length && query.trim().length >= 2 && (
            <EmptyState title="No results found" body={`No papers matched your query${status ? ` in ${STATUS_LABELS[status]}` : ''}.`} />
          )}
        </div>
      )}
    </main>
  );
}

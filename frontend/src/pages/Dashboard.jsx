import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPapers, deletePaper, getAllPapers } from '../services/paperService';
import { getReviewers, assignReviewers, makeDecision } from '../services/editorService';
import { getAssignedPapers } from '../services/reviewService';
import { createPublication } from '../services/publicationService';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { FiPlusCircle, FiTrash2, FiBook, FiUser, FiEye, FiBarChart2, FiSearch } from 'react-icons/fi';
import { formatDate, truncate, categoryColor, getErrorMessage } from '../utils/helpers';
import PaperCard from '../components/papers/PaperCard';
import StatusBadge from '../components/papers/StatusBadge';
import PageHeader from '../components/common/PageHeader';
import InfoCard from '../components/common/InfoCard';
import EmptyState from '../components/common/EmptyState';
import '../components/common/ui.css';
import './Dashboard.css';

const Dashboard = () => {
  const { user }            = useAuth();
  const [pubs, setPubs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorData, setEditorData] = useState({ papers: [], reviewers: [] });
  const [assignState, setAssignState] = useState({});
  const [decisions, setDecisions] = useState({});
  const [editorNotes, setEditorNotes] = useState({});
  const [publishForms, setPublishForms] = useState({});
  const [busyPaperId, setBusyPaperId] = useState('');
  const [editorStatusFilter, setEditorStatusFilter] = useState('submitted');
  const [assignedPapers, setAssignedPapers] = useState([]);

  const fetchMyPubs = useCallback(() => {
    if (user?.role === 'editor') {
      setLoading(true);
      const paperParams = { page: 1, limit: 50 };
      if (editorStatusFilter && editorStatusFilter !== 'all') paperParams.status = editorStatusFilter;
      Promise.all([getAllPapers(paperParams), getReviewers()])
        .then(([papersRes, reviewersRes]) => {
          setEditorData({
            papers: papersRes.data?.data?.items || [],
            reviewers: (reviewersRes.data?.data?.reviewers || []).filter((r) => r.role === 'reviewer'),
          });
        })
        .catch(() => toast.error('Failed to load editor dashboard data.'))
        .finally(() => setLoading(false));
      return;
    }

    if (user?.role === 'reviewer') {
      setLoading(true);
      getAssignedPapers()
        .then((res) => setAssignedPapers(res.data?.data?.items || []))
        .catch(() => toast.error('Failed to load assigned papers.'))
        .finally(() => setLoading(false));
      return;
    }

    if (user?.role !== 'researcher') {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyPapers()
      .then((res) => {
        const data = res.data;
        const items = data?.data?.items || data?.data?.papers || data?.papers || (Array.isArray(data) ? data : []);
        setPubs(items);
      })
      .catch(() => toast.error('Failed to load your papers.'))
      .finally(() => setLoading(false));
  }, [user?.role, editorStatusFilter]);

  useEffect(() => { fetchMyPubs(); }, [fetchMyPubs]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deletePaper(id);
      toast.success('Paper deleted.');
      setPubs((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleReviewer = (paperId, reviewerId, checked) => {
    setAssignState((prev) => {
      const current = prev[paperId] || [];
      if (checked) return { ...prev, [paperId]: [...new Set([...current, reviewerId])] };
      return { ...prev, [paperId]: current.filter((id) => id !== reviewerId) };
    });
  };

  const onAssignReviewers = async (paperId) => {
    const reviewerIds = assignState[paperId] || [];
    if (reviewerIds.length < 1 || reviewerIds.length > 3) {
      toast.error('Select between 1 and 3 reviewers');
      return;
    }
    setBusyPaperId(paperId);
    try {
      await assignReviewers({ paperId, reviewerIds });
      toast.success('Reviewers assigned');
      fetchMyPubs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyPaperId('');
    }
  };

  const onDecision = async (paperId) => {
    const decision = decisions[paperId];
    if (!decision) return toast.error('Select a decision first');
    setBusyPaperId(paperId);
    try {
      await makeDecision(paperId, { decision, editorNote: editorNotes[paperId] || '' });
      toast.success('Decision saved');
      fetchMyPubs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyPaperId('');
    }
  };

  const onPublish = async (paperId) => {
    const form = publishForms[paperId] || {};
    if (!form.journalName || !String(form.journalName).trim()) {
      return toast.error('Journal name is required to publish');
    }
    setBusyPaperId(paperId);
    try {
      await createPublication({
        paperId,
        journalName: String(form.journalName).trim(),
        volume: String(form.volume || '').trim(),
        issue: String(form.issue || '').trim(),
        doi: String(form.doi || '').trim(),
      });
      toast.success('Paper published and publication record created');
      fetchMyPubs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyPaperId('');
    }
  };

  const roleActionCards = {
    researcher: [
      { label: 'Submit New Paper', desc: 'Upload manuscript and start peer review.', to: '/submit', icon: FiPlusCircle },
      { label: 'My Submissions', desc: 'Track statuses, revisions, and decisions.', to: '/my-papers', icon: FiBook },
      { label: 'Explore Publications', desc: 'Browse published research catalog.', to: '/publications', icon: FiSearch },
    ],
    reviewer: [
      { label: 'Explore Publications', desc: 'Read published research outputs.', to: '/publications', icon: FiBook },
      { label: 'Search', desc: 'Find papers by title, abstract, or keywords.', to: '/search', icon: FiSearch },
    ],
    editor: [
      { label: 'Editor Analytics', desc: 'Review submission and decision trends.', to: '/analytics', icon: FiBarChart2 },
      { label: 'Manage Submissions', desc: 'Assign reviewers and make decisions.', to: '/dashboard', icon: FiPlusCircle },
      { label: 'Explore Publications', desc: 'Manage and curate publication records.', to: '/publications', icon: FiBook },
    ],
  };

  const actions = roleActionCards[user?.role] || roleActionCards.researcher;

  return (
    <div className="page-shell dashboard-page">
      <PageHeader title={`Welcome, ${user?.name || 'User'}`} subtitle={user?.email} />
      {/* Welcome header */}
      <div className="dash-header fade-up">
        <div className="dash-welcome">
          <div className="dash-avatar"><FiUser /></div>
          <div>
            <h1 className="section-title">Welcome, {user?.name}</h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>{user?.email}</p>
          </div>
        </div>
        {user?.role !== 'researcher' ? (
          <span className="badge">{user?.role}</span>
        ) : null}
      </div>

      <div className="dash-quick-actions fade-up delay-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.to} className="dash-action-card">
              <Icon className="dash-action-icon" />
              <h3>{action.label}</h3>
              <p>{action.desc}</p>
            </Link>
          );
        })}
      </div>

      {user?.role === 'researcher' && (
        <div className="dash-stats fade-up delay-1">
          <div className="dash-stat-card">
            <FiBook className="stat-icon" />
            <div>
              <span className="stat-num">{pubs.length}</span>
              <span className="stat-label">Total Submissions</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <FiEye className="stat-icon" />
            <div>
              <span className="stat-num">{pubs.reduce((sum, p) => sum + (p.views || 0), 0)}</span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <FiUser className="stat-icon" />
            <div>
              <span className="stat-num">{new Set(pubs.map((p) => p.category).filter(Boolean)).size}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'researcher' && (
      <div className="dash-section fade-up delay-2">
        <div className="dash-section-header">
          <h2>My Submissions</h2>
        </div>

        {loading ? (
          <Loader text="Loading your submissions…" />
        ) : pubs.length === 0 ? (
          <div className="empty-state">
            <FiBook />
            <h3>No submissions yet</h3>
            <p>Start by submitting your first research paper.</p>
            <Link to="/submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <FiPlusCircle /> Submit First Paper
            </Link>
          </div>
        ) : (
          <div className="dash-pub-list">
            {pubs.map((pub, i) => {
              const color = categoryColor(pub.category);
              const ownerId = String(pub.authorId?._id || pub.authorId || '');
              const canDelete = ownerId === String(user?._id || '') && pub.status !== 'published';
              return (
                <div key={pub._id} className={`dash-pub-row fade-up delay-${Math.min(i + 1, 6)}`}>
                  <div className="dash-pub-color-bar" style={{ background: color }} />
                  <div className="dash-pub-info">
                    <div className="dash-pub-top">
                      <span
                        className="badge"
                        style={{ color, background: `rgba(from ${color} r g b / 0.12)`, borderColor: `rgba(from ${color} r g b / 0.3)` }}
                      >
                        {pub.category}
                      </span>
                      <span className="dash-pub-date">{formatDate(pub.createdAt || pub.submissionDate)}</span>
                    </div>
                    <h3 className="dash-pub-title">
                      <Link to={`/papers/${pub._id}`}>{pub.title}</Link>
                    </h3>
                    <p className="dash-pub-abstract">{truncate(pub.abstract, 120)}</p>
                    <p className="dash-pub-authors">
                      {Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors}
                    </p>
                  </div>
                  <div className="dash-pub-actions">
                    <Link to={`/papers/${pub._id}`} className="btn btn-ghost btn-sm"><FiEye /> View</Link>
                    {canDelete ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(pub._id, pub.title)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {user?.role === 'reviewer' && (
        <div className="dash-section fade-up delay-2">
          <div className="dash-section-header">
            <h2>Assigned Papers</h2>
          </div>
          <div className="section-card mb-4">
            <div className="info-grid">
              <InfoCard label="Total Assigned" value={assignedPapers.length} />
              <InfoCard label="Pending Reviews" value={assignedPapers.filter((p) => !(p.myReview || p.hasReviewed)).length} />
              <InfoCard label="Submitted Reviews" value={assignedPapers.filter((p) => (p.myReview || p.hasReviewed)).length} />
            </div>
          </div>
          {loading ? (
            <Loader text="Loading assigned papers..." />
          ) : assignedPapers.length ? (
            <div className="reviewer-papers-grid">
              {assignedPapers.map((paper) => <PaperCard key={paper._id} paper={paper} role={user.role} />)}
            </div>
          ) : (
            <EmptyState title="No assigned papers" body="You currently have no under-review assignments." />
          )}
        </div>
      )}

      {user?.role === 'editor' && (
        <div className="dash-section fade-up delay-2">
          <div className="dash-section-header">
            <h2>Manage Submissions</h2>
            <select className="input" style={{ maxWidth: 220 }} value={editorStatusFilter} onChange={(e) => setEditorStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="revision_required">Revision Required</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>
          {loading ? (
            <Loader text="Loading submissions..." />
          ) : !editorData.papers.length ? (
            <div className="card text-slate-400">No papers found for selected status.</div>
          ) : (
            <div className="dash-pub-list editor-pub-list">
              {editorData.papers.map((paper) => (
                <div key={paper._id} className="dash-pub-row editor-pub-row">
                  <div className="dash-pub-info">
                    <div className="dash-pub-top">
                      <StatusBadge status={paper.status} />
                      <span className="dash-pub-date">{formatDate(paper.createdAt || paper.submissionDate)}</span>
                    </div>
                    <h3 className="dash-pub-title">
                      <Link to={`/papers/${paper._id}`}>{paper.title}</Link>
                    </h3>
                    <p className="dash-pub-abstract">{truncate(paper.abstract, 140)}</p>
                    <p className="dash-pub-authors">Author: {paper.authorId?.name || 'Unknown'}</p>
                    <div className="editor-actions">
                      <Link to={`/papers/${paper._id}`} className="btn btn-ghost btn-sm"><FiEye /> Open Paper Detail</Link>
                    </div>

                    <div className="editor-controls">
                      {(paper.assignedReviewers || []).length ? (
                        <div className="mb-3 rounded border border-white/10 p-3">
                          <p className="text-sm text-slate-300">Assigned reviewers</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {paper.reviewProgress?.submitted || 0}/{paper.reviewProgress?.assigned || (paper.assignedReviewers || []).length} reviews submitted
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-slate-400">
                            {(paper.assignedReviewers || []).map((reviewer) => {
                              const reviewerId = String(reviewer._id || reviewer);
                              const submitted = (paper.submittedReviewerIds || []).includes(reviewerId);
                              return (
                                <li key={reviewer._id || reviewer}>
                                  {reviewer.name || reviewer.email || 'Reviewer'} - {submitted ? 'Submitted' : 'Pending'}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}
                      <p className="editor-controls-title">Assign Reviewers (1-3)</p>
                      <div className="editor-reviewers">
                        {editorData.reviewers
                          .filter((r) => r.role === 'reviewer')
                          .filter((r) => !(paper.assignedReviewers || []).some((a) => String(a._id || a) === String(r._id)))
                          .map((r) => (
                          <label key={r._id} className="editor-reviewer-item">
                            <input
                              type="checkbox"
                              checked={(assignState[paper._id] || []).includes(r._id)}
                              onChange={(e) => toggleReviewer(paper._id, r._id, e.target.checked)}
                            />
                            <span>{r.name} ({r.activeReviews || 0})</span>
                          </label>
                        ))}
                      </div>
                      <div className="editor-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={busyPaperId === paper._id || paper.status !== 'submitted'}
                          onClick={() => onAssignReviewers(paper._id)}
                          title={paper.status !== 'submitted' ? 'Only submitted papers can be assigned reviewers' : ''}
                        >
                          Assign Reviewers
                        </button>
                      </div>
                    </div>

                    {paper.status === 'under_review' && (
                      <div className="editor-controls">
                        <p className="editor-controls-title">Editorial Decision</p>
                        <div className="editor-actions">
                          <select
                            className="input"
                            value={decisions[paper._id] || ''}
                            onChange={(e) => setDecisions((prev) => ({ ...prev, [paper._id]: e.target.value }))}
                          >
                            <option value="">Select decision</option>
                            <option value="accept">Accept</option>
                            <option value="reject">Reject</option>
                            <option value="revision_required">Revision Required</option>
                          </select>
                          <button className="btn btn-outline btn-sm" disabled={busyPaperId === paper._id} onClick={() => onDecision(paper._id)}>
                            Save Decision
                          </button>
                        </div>
                        <textarea
                          className="input"
                          placeholder="Editor note (required for revision guidance, optional otherwise)"
                          value={editorNotes[paper._id] || ''}
                          onChange={(e) => setEditorNotes((prev) => ({ ...prev, [paper._id]: e.target.value }))}
                        />
                      </div>
                    )}

                    {paper.status === 'accepted' && (
                      <div className="editor-controls">
                        <p className="editor-controls-title">Publish Accepted Paper</p>
                        <div className="editor-reviewers">
                          <input
                            className="input"
                            placeholder="Journal name"
                            value={publishForms[paper._id]?.journalName || ''}
                            onChange={(e) => setPublishForms((prev) => ({ ...prev, [paper._id]: { ...(prev[paper._id] || {}), journalName: e.target.value } }))}
                          />
                          <input
                            className="input"
                            placeholder="Volume (optional)"
                            value={publishForms[paper._id]?.volume || ''}
                            onChange={(e) => setPublishForms((prev) => ({ ...prev, [paper._id]: { ...(prev[paper._id] || {}), volume: e.target.value } }))}
                          />
                          <input
                            className="input"
                            placeholder="Issue (optional)"
                            value={publishForms[paper._id]?.issue || ''}
                            onChange={(e) => setPublishForms((prev) => ({ ...prev, [paper._id]: { ...(prev[paper._id] || {}), issue: e.target.value } }))}
                          />
                          <input
                            className="input"
                            placeholder="DOI (optional)"
                            value={publishForms[paper._id]?.doi || ''}
                            onChange={(e) => setPublishForms((prev) => ({ ...prev, [paper._id]: { ...(prev[paper._id] || {}), doi: e.target.value } }))}
                          />
                        </div>
                        <div className="editor-actions">
                          <button className="btn btn-primary btn-sm" disabled={busyPaperId === paper._id} onClick={() => onPublish(paper._id)}>
                            Publish
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

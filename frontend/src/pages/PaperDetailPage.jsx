import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/papers/StatusBadge';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import StatusTimeline from '../components/common/StatusTimeline';
import EmptyState from '../components/common/EmptyState';
import {
  checkPlagiarism,
  deletePaper,
  formatCitation,
  getPaperById,
  updatePaper,
} from '../services/paperService';
import { assignReviewers, getReviewers, makeDecision } from '../services/editorService';
import { createPublication } from '../services/publicationService';
import { useAuth } from '../context/AuthContext';
import { formatDate, getErrorMessage } from '../utils/helpers';
import '../components/common/ui.css';

export default function PaperDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [citation, setCitation] = useState('');
  const [plagiarism, setPlagiarism] = useState(null);
  const [revising, setRevising] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviewers, setReviewers] = useState([]);

  const [revisionForm, setRevisionForm] = useState({ file: null, revisionNote: '' });
  const [decision, setDecision] = useState('');
  const [editorNote, setEditorNote] = useState('');
  const [publishForm, setPublishForm] = useState({ journalName: '', doi: '', volume: '', issue: '' });
  const [assignIds, setAssignIds] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [paperRes, reviewerRes] = await Promise.all([
        getPaperById(id),
        user?.role === 'editor' ? getReviewers() : Promise.resolve(null),
      ]);
      setPaper(paperRes.data.data.paper);
      if (reviewerRes) {
        setReviewers((reviewerRes.data?.data?.reviewers || []).filter((r) => r.role === 'reviewer'));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const existingReviewerIds = useMemo(() => {
    return new Set((paper?.assignedReviewers || []).map((r) => String(r._id || r)));
  }, [paper]);

  if (loading) return <Loader fullScreen label="Loading paper..." />;
  if (!paper) return <main className="page-shell"><EmptyState title="Paper not found" /></main>;
  const isOwner = String(paper.authorId?._id || paper.authorId || '') === String(user?._id || '');

  const onCitation = async (format) => {
    try {
      const res = await formatCitation(id, format);
      setCitation(res.data.data.citation);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onCopyCitation = async () => {
    if (!citation) return;
    try {
      await navigator.clipboard.writeText(citation);
      toast.success('Citation copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const onPlagiarism = async () => {
    try {
      const res = await checkPlagiarism(id);
      setPlagiarism(res.data.data.result);
      toast.success('Plagiarism check completed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this paper?')) return;
    try {
      await deletePaper(id);
      toast.success('Paper deleted');
      navigate('/my-papers');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onRevisionSubmit = async (e) => {
    e.preventDefault();
    if (paper.status !== 'revision_required') return toast.error('Paper is not in revision_required status');
    if (!revisionForm.file) return toast.error('Please upload revised PDF');
    if (revisionForm.file.size > 10 * 1024 * 1024) return toast.error('Revised PDF must be 10MB or smaller');
    if (revisionForm.file.type !== 'application/pdf' && !revisionForm.file.name.toLowerCase().endsWith('.pdf')) {
      return toast.error('Only PDF files are allowed');
    }

    setRevising(true);
    try {
      const fd = new FormData();
      fd.append('file', revisionForm.file);
      if (revisionForm.revisionNote.trim()) fd.append('revisionNote', revisionForm.revisionNote.trim());
      await updatePaper(id, fd);
      toast.success('Revision uploaded successfully');
      setRevisionForm({ file: null, revisionNote: '' });
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRevising(false);
    }
  };

  const onAssign = async () => {
    if (paper.status !== 'submitted') return;
    if (assignIds.length < 1 || assignIds.length > 3) return toast.error('Select between 1 and 3 reviewers');

    setBusy(true);
    try {
      await assignReviewers({ paperId: paper._id, reviewerIds: assignIds });
      toast.success('Reviewers assigned');
      setAssignIds([]);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onDecision = async () => {
    if (!decision) return toast.error('Select a decision first');
    if (decision === 'revision_required' && !editorNote.trim()) return toast.error('Editor note is required for revision required');

    setBusy(true);
    try {
      await makeDecision(paper._id, { decision, editorNote: editorNote.trim() });
      toast.success('Decision recorded');
      setDecision('');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onPublish = async () => {
    if (!publishForm.journalName.trim()) return toast.error('Journal name is required');

    setBusy(true);
    try {
      await createPublication({
        paperId: paper._id,
        journalName: publishForm.journalName.trim(),
        doi: publishForm.doi.trim(),
        volume: publishForm.volume.trim(),
        issue: publishForm.issue.trim(),
      });
      toast.success('Published successfully');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-shell" style={{ maxWidth: 1100 }}>
      <PageHeader
        title="Paper Details"
        subtitle="Track manuscript progress, reviews, and publication readiness."
        right={<Link to={user?.role === 'researcher' ? '/my-papers' : '/dashboard'} className="btn btn-ghost btn-sm">Back</Link>}
      />

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl">{paper.title}</h2>
            <p className="helper-text mt-2">Author: {paper.authorId?.name} • Submitted {formatDate(paper.createdAt || paper.submissionDate)}</p>
          </div>
          <StatusBadge status={paper.status} />
        </div>
        <div className="mt-4">
          <StatusTimeline status={paper.status} />
        </div>
      </SectionCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Metadata">
          <div className="space-y-2 text-sm text-slate-300">
            <p>Status: <strong>{paper.status}</strong></p>
            <p>Submission Date: {formatDate(paper.submissionDate || paper.createdAt)}</p>
            <p>Last Updated: {formatDate(paper.updatedAt)}</p>
            <p>Co-authors: {(paper.coAuthors || []).length || 0}</p>
          </div>
        </SectionCard>

        <SectionCard title="Keywords">
          <div className="flex flex-wrap gap-2">
            {(paper.keywords || []).map((k) => <span key={k} className="keyword-chip">{k}</span>)}
          </div>
        </SectionCard>

        <SectionCard title="Co-authors">
          {(paper.coAuthors || []).length ? (
            <ul className="space-y-1 text-sm text-slate-300">
              {paper.coAuthors.map((author) => <li key={author._id || author.email || author}>{author.name || author.email || 'Co-author'}</li>)}
            </ul>
          ) : <p className="helper-text">No co-authors listed.</p>}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Abstract">
          <p className="text-slate-300">{paper.abstract}</p>
        </SectionCard>

        <SectionCard title="Actions">
          <div className="action-row">
            <button className="btn btn-outline btn-sm" onClick={() => onCitation('apa')}>APA Citation</button>
            <button className="btn btn-outline btn-sm" onClick={() => onCitation('ieee')}>IEEE Citation</button>
            {['researcher', 'editor'].includes(user.role) && <button className="btn btn-ghost btn-sm" onClick={onPlagiarism}>Run Plagiarism</button>}
            {user.role === 'researcher' && isOwner && paper.status === 'submitted' && (
              <button
                className="btn btn-danger btn-sm"
                onClick={onDelete}
                title="Delete this paper"
              >
                Delete
              </button>
            )}
          </div>
          {user.role === 'researcher' && isOwner && paper.status !== 'submitted' ? (
            <p className="helper-text mt-2">Delete is available only while status is Submitted.</p>
          ) : null}

          {citation ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="helper-text">Citation</p>
              <p className="mt-1 text-sm text-slate-200">{citation}</p>
              <button className="btn btn-ghost btn-sm mt-3" onClick={onCopyCitation}>Copy Citation</button>
            </div>
          ) : null}

          {plagiarism ? (
            <div className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
              <p className="font-semibold">Plagiarism Check (Demo)</p>
              <p className="mt-1">{plagiarism.details}</p>
            </div>
          ) : null}
        </SectionCard>
      </div>

      {paper.editorNote ? (
        <SectionCard title="Editor Note">
          <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">{paper.editorNote}</div>
        </SectionCard>
      ) : null}

      <SectionCard title="Reviews">
        {(paper.reviews || []).length ? paper.reviews.map((review) => (
          <div key={review._id} className="mb-3 rounded-lg border border-white/10 p-3">
            <p className="text-xs text-slate-400">Reviewer: {review.reviewerId?.name || 'Assigned Reviewer'}</p>
            <p className="mt-1 text-sm text-slate-300">{review.comments}</p>
            <p className="mt-2 text-xs text-slate-500">Score: {review.score} • Decision: {review.decision}</p>
          </div>
        )) : <p className="helper-text">No visible reviews yet.</p>}
      </SectionCard>

      {user.role === 'researcher' && paper.status === 'revision_required' && (
        <SectionCard title="Revision Upload">
          <p className="helper-text mb-3">Upload revised manuscript PDF and optional revision note.</p>
          <form onSubmit={onRevisionSubmit} className="form-shell">
            <textarea
              className="input min-h-24"
              placeholder="Revision note (optional)"
              value={revisionForm.revisionNote}
              onChange={(e) => setRevisionForm((prev) => ({ ...prev, revisionNote: e.target.value }))}
            />
            <input
              className="input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setRevisionForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
            />
            <button disabled={revising} className="btn btn-primary">{revising ? 'Uploading...' : 'Revise Paper'}</button>
          </form>
        </SectionCard>
      )}

      {user.role === 'editor' && (
        <SectionCard title="Editor Workflow Controls">
          {(paper.assignedReviewers || []).length ? (
            <div className="mb-4 rounded-lg border border-white/10 p-3">
              <p className="text-sm text-slate-300">Assigned Reviewers</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                {(paper.assignedReviewers || []).map((reviewer) => {
                  const submitted = (paper.reviews || []).some((r) => String(r.reviewerId?._id || r.reviewerId) === String(reviewer._id || reviewer));
                  return <li key={reviewer._id || reviewer}>{reviewer.name || reviewer.email || 'Reviewer'} • {submitted ? 'Submitted' : 'Pending'}</li>;
                })}
              </ul>
            </div>
          ) : null}

          {paper.status === 'submitted' && (
            <div className="mb-4">
              <p className="helper-text mb-2">Assign 1–3 reviewers</p>
              <div className="grid gap-2 md:grid-cols-2">
                {reviewers.filter((r) => !existingReviewerIds.has(String(r._id))).map((r) => (
                  <label key={r._id} className="rounded border border-white/10 p-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={assignIds.includes(r._id)}
                      onChange={(e) => setAssignIds((prev) => e.target.checked ? [...new Set([...prev, r._id])] : prev.filter((idValue) => idValue !== r._id))}
                    />
                    <span className="ml-2">{r.name} ({r.email})</span>
                  </label>
                ))}
              </div>
              <button disabled={busy} className="btn btn-primary btn-sm mt-3" onClick={onAssign}>Assign Reviewers</button>
            </div>
          )}

          {paper.status === 'under_review' && (
            <div className="mb-4 space-y-3">
              <p className="helper-text">Editorial Decision (requires at least one review)</p>
              <select className="input" value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="">Select decision</option>
                <option value="accept">Accept</option>
                <option value="reject">Reject</option>
                <option value="revision_required">Revision Required</option>
              </select>
              <textarea className="input min-h-24" value={editorNote} placeholder="Editor note (required for revision required)" onChange={(e) => setEditorNote(e.target.value)} />
              <button disabled={busy} className="btn btn-outline btn-sm" onClick={onDecision}>Save Decision</button>
            </div>
          )}

          {paper.status === 'accepted' && (
            <div className="space-y-2">
              <p className="helper-text">Publish accepted paper</p>
              <input className="input" placeholder="Journal Name" value={publishForm.journalName} onChange={(e) => setPublishForm((prev) => ({ ...prev, journalName: e.target.value }))} />
              <div className="grid gap-2 md:grid-cols-3">
                <input className="input" placeholder="DOI (optional)" value={publishForm.doi} onChange={(e) => setPublishForm((prev) => ({ ...prev, doi: e.target.value }))} />
                <input className="input" placeholder="Volume" value={publishForm.volume} onChange={(e) => setPublishForm((prev) => ({ ...prev, volume: e.target.value }))} />
                <input className="input" placeholder="Issue" value={publishForm.issue} onChange={(e) => setPublishForm((prev) => ({ ...prev, issue: e.target.value }))} />
              </div>
              <button disabled={busy} className="btn btn-primary btn-sm" onClick={onPublish}>Publish</button>
            </div>
          )}
        </SectionCard>
      )}

      {user.role === 'editor' && (
        <SectionCard title="Revision History">
          {(paper.revisionHistory || []).length ? (
            <div className="space-y-3">
              {paper.revisionHistory.map((rev, idx) => (
                <div key={`${rev.uploadedAt}-${idx}`} className="rounded-lg border border-white/10 p-3">
                  <p className="text-xs text-slate-400">{formatDate(rev.uploadedAt)}</p>
                  <p className="mt-1 text-sm text-slate-200">{rev.revisionNote}</p>
                  <a className="mt-2 inline-block text-sm text-amber-300 hover:text-amber-200" href={rev.fileUrl} target="_blank" rel="noreferrer">Open previous version</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="helper-text">No revisions uploaded yet.</p>
          )}
        </SectionCard>
      )}
    </main>
  );
}

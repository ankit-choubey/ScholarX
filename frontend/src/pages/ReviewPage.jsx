import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ReviewForm from '../components/reviews/ReviewForm';
import { getPaperById } from '../services/paperService';
import { submitReview, updateReview } from '../services/reviewService';
import { getErrorMessage } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import '../components/common/ui.css';

const VALID_DECISIONS = ['accept', 'minor_revision', 'major_revision', 'reject'];

export default function ReviewPage() {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [form, setForm] = useState({ comments: '', score: 7, decision: 'minor_revision', isConfidential: false });
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPaperById(id);
      const data = res.data.data.paper;
      setPaper(data);
      const existing = data.reviews?.[0];
      if (existing) {
        setExistingReviewId(existing._id);
        setForm({
          comments: existing.comments || '',
          score: existing.score || 7,
          decision: existing.decision || 'minor_revision',
          isConfidential: Boolean(existing.isConfidential),
        });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const comments = String(form.comments || '').trim();
    const score = Number(form.score);
    const nextErrors = {};
    if (comments.length < 50) nextErrors.comments = 'Comments must be at least 50 characters';
    if (score < 1 || score > 10) nextErrors.score = 'Score must be between 1 and 10';
    if (!VALID_DECISIONS.includes(form.decision)) nextErrors.decision = 'Invalid review decision';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      const payload = { ...form, comments, score };
      if (existingReviewId) {
        await updateReview(existingReviewId, payload);
        toast.success('Review updated');
      } else {
        await submitReview({ paperId: id, ...payload });
        toast.success('Review submitted');
      }
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen label="Loading review page..." />;

  return (
    <main className="page-shell" style={{ maxWidth: 1200 }}>
      <PageHeader title="Review Assignment" subtitle="Provide structured reviewer feedback for this manuscript." />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title={paper?.title}>
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Author: {paper?.authorId?.name}</p>
            <p className="text-slate-300">{paper?.abstract}</p>
            <div className="flex flex-wrap gap-2">
              {(paper?.keywords || []).map((k) => <span key={k} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{k}</span>)}
            </div>
          </div>
        </SectionCard>
        <ReviewForm form={form} onChange={onChange} onSubmit={onSubmit} saving={saving} errors={errors} submitted={Boolean(existingReviewId)} />
      </div>
    </main>
  );
}

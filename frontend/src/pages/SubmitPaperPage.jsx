import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submitPaper } from '../services/paperService';
import { getErrorMessage } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import FormShell from '../components/common/FormShell';
import '../components/common/ui.css';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubmitPaperPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', abstract: '', keywords: '', coAuthors: '', file: null });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    const title = form.title.trim();
    const abstract = form.abstract.trim();
    const keywords = form.keywords.split(',').map((v) => v.trim()).filter(Boolean);
    const coAuthors = form.coAuthors.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);

    if (title.length < 10) next.title = 'Title must be at least 10 characters.';
    if (title.length > 300) next.title = 'Title cannot exceed 300 characters.';
    if (abstract.length < 100) next.abstract = 'Abstract must be at least 100 characters.';
    if (abstract.length > 5000) next.abstract = 'Abstract cannot exceed 5000 characters.';
    if (keywords.length < 1) next.keywords = 'At least one keyword is required.';
    if (keywords.length > 10) next.keywords = 'No more than 10 keywords are allowed.';
    if (!form.file) next.file = 'Please upload a PDF file.';
    if (form.file && form.file.size > MAX_FILE_BYTES) next.file = 'PDF must be 10MB or smaller.';
    if (form.file && form.file.type !== 'application/pdf' && !form.file.name.toLowerCase().endsWith('.pdf')) {
      next.file = 'Only .pdf files are allowed.';
    }
    const invalidEmail = coAuthors.find((email) => !EMAIL_RE.test(email));
    if (invalidEmail) next.coAuthors = `Invalid co-author email: ${invalidEmail}`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const title = form.title.trim();
    const abstract = form.abstract.trim();
    const keywords = form.keywords.split(',').map((v) => v.trim()).filter(Boolean);
    const coAuthors = form.coAuthors.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('abstract', abstract);
    fd.append('keywords', keywords.join(', '));
    fd.append('file', form.file);
    if (coAuthors.length) fd.append('coAuthors', JSON.stringify(coAuthors));

    setLoading(true);
    try {
      const res = await submitPaper(fd);
      const paper = res.data?.data?.paper;
      toast.success(`Paper submitted with status: ${paper?.status || 'submitted'}`);
      if (paper?._id) {
        navigate(`/papers/${paper._id}`);
      } else {
        navigate('/my-papers');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell" style={{ maxWidth: 900 }}>
      <PageHeader title="Submit Manuscript" subtitle="Submit your work for editorial screening and peer review." />
      <FormShell onSubmit={onSubmit}>
        <SectionCard title="Manuscript Details">
          <div className="space-y-3">
            <div>
              <label className="helper-text">Title</label>
              <input className="input" placeholder="Paper title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title ? <p className="field-error">{errors.title}</p> : null}
            </div>
            <div>
              <label className="helper-text">Abstract ({form.abstract.trim().length}/5000)</label>
              <textarea className="input min-h-40" placeholder="Abstract (minimum 100 characters)" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
              {errors.abstract ? <p className="field-error">{errors.abstract}</p> : null}
            </div>
            <div>
              <label className="helper-text">Keywords (comma-separated, up to 10)</label>
              <input className="input" placeholder="machine learning, systems, optimization" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
              {errors.keywords ? <p className="field-error">{errors.keywords}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Authors">
          <label className="helper-text">Co-author emails</label>
          <input className="input" placeholder="alice@uni.edu, bob@lab.org" value={form.coAuthors} onChange={(e) => setForm({ ...form, coAuthors: e.target.value })} />
          <p className="helper-text mt-2">Co-authors must already be registered users and will be able to track this manuscript.</p>
          {errors.coAuthors ? <p className="field-error">{errors.coAuthors}</p> : null}
        </SectionCard>

        <SectionCard title="Upload PDF">
          <div className="rounded-lg border border-dashed border-amber-300/35 bg-amber-500/5 p-4">
            <input className="input" type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
            <p className="helper-text mt-2">Only PDF files up to 10MB are accepted.</p>
            {form.file ? <p className="helper-text mt-1">Selected: {form.file.name} ({(form.file.size / (1024 * 1024)).toFixed(2)} MB)</p> : null}
            {errors.file ? <p className="field-error">{errors.file}</p> : null}
          </div>
        </SectionCard>

        <SectionCard title="Submit">
          <div className="action-row">
            <button disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Paper'}
            </button>
            <p className="helper-text">After submission, status starts at <strong>submitted</strong>.</p>
          </div>
        </SectionCard>
      </FormShell>
    </main>
  );
}

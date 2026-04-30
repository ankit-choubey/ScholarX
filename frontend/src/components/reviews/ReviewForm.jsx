import { REVIEW_DECISIONS } from '../../utils/constants';
import '../common/ui.css';

export default function ReviewForm({ form, onChange, onSubmit, saving, errors = {}, submitted = false }) {
  return (
    <form onSubmit={onSubmit} className="card space-y-5">
      <h2 className="text-lg font-semibold">Review</h2>

      <div className="space-y-2">
        <label className="mb-2 block text-sm text-slate-300">Score (1-10)</label>
        <input
          type="range"
          min="1"
          max="10"
          value={form.score}
          onChange={(e) => onChange('score', Number(e.target.value))}
          className="w-full"
        />
        <p className="mt-1 text-sm text-slate-400">Selected: {form.score}</p>
        {errors.score ? <p className="field-error">{errors.score}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="mb-2 block text-sm text-slate-300">Decision</label>
        <select className="input" value={form.decision} onChange={(e) => onChange('decision', e.target.value)}>
          {REVIEW_DECISIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        {errors.decision ? <p className="field-error">{errors.decision}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="mb-2 block text-sm text-slate-300">Comments</label>
        <textarea className="input min-h-36" value={form.comments} onChange={(e) => onChange('comments', e.target.value)} />
        <p className="mt-1 text-xs text-slate-500">{String(form.comments || '').length} characters (minimum 50).</p>
        {errors.comments ? <p className="field-error">{errors.comments}</p> : null}
      </div>

      <label className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">
        <input type="checkbox" checked={form.isConfidential} onChange={(e) => onChange('isConfidential', e.target.checked)} />
        Mark as confidential
      </label>

      <button disabled={saving} className="btn btn-primary w-full disabled:opacity-60">{saving ? 'Saving...' : submitted ? 'Update Review' : 'Submit Review'}</button>
    </form>
  );
}

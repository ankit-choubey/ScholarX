import { STATUS_LABELS } from '../../utils/constants';

const cls = {
  submitted: 'bg-sky-500/18 text-sky-200 border-sky-400/45',
  under_review: 'bg-amber-500/18 text-amber-200 border-amber-400/45',
  revision_required: 'bg-orange-500/20 text-orange-200 border-orange-400/50',
  accepted: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/45',
  rejected: 'bg-rose-500/20 text-rose-200 border-rose-400/50',
  published: 'bg-violet-500/20 text-violet-200 border-violet-400/50',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-pill-strong inline-flex rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${cls[status] || cls.submitted}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

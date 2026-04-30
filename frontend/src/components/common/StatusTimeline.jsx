import { STATUS_LABELS } from '../../utils/constants';
import './ui.css';

const ORDER = ['submitted', 'under_review', 'revision_required', 'accepted', 'published'];

export default function StatusTimeline({ status }) {
  const currentIndex = ORDER.indexOf(status);

  return (
    <div className="workflow-timeline">
      {ORDER.map((s, idx) => {
        const active = currentIndex >= 0 ? idx <= currentIndex : s === status;
        return <span key={s} className={`workflow-node ${active ? 'active' : ''}`}>{STATUS_LABELS[s] || s}</span>;
      })}
      {status === 'rejected' ? <span className="workflow-node active">Rejected</span> : null}
    </div>
  );
}

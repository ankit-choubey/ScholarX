import './ui.css';

export default function EmptyState({ title, body, action }) {
  return (
    <div className="empty-state-box">
      <h3 className="text-lg">{title}</h3>
      {body ? <p className="mt-1">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

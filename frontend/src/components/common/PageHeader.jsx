import './ui.css';

export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="page-header">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {right || null}
      </div>
    </div>
  );
}

import './ui.css';

export default function SectionCard({ title, children, actions }) {
  return (
    <section className="section-card">
      {(title || actions) ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          {title ? <h2>{title}</h2> : <span />}
          {actions || null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

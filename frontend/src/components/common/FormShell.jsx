import './ui.css';

export default function FormShell({ children, onSubmit, className = '' }) {
  return <form onSubmit={onSubmit} className={`form-shell ${className}`.trim()}>{children}</form>;
}

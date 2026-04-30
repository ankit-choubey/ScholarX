export default function ActionButton({ children, variant = 'primary', size = 'sm', className = '', ...props }) {
  const variantClass = variant === 'outline' ? 'btn-outline' : variant === 'ghost' ? 'btn-ghost' : variant === 'danger' ? 'btn-danger' : 'btn-primary';
  return <button className={`btn ${variantClass} btn-${size} ${className}`.trim()} {...props}>{children}</button>;
}

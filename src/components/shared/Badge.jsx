export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'border-charcoal-light text-slate-text',
    cyan: 'border-cyan/30 text-cyan bg-cyan/5',
    emerald: 'border-emerald/30 text-emerald bg-emerald/5',
    amber: 'border-amber/30 text-amber bg-amber/5',
  }

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-mono border rounded-md ${variants[variant]}`}>
      {children}
    </span>
  )
}

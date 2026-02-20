import { Link } from 'react-router-dom'

export default function Button({ children, to, href, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200'
  const variants = {
    primary: 'bg-cyan text-navy hover:bg-cyan-dark',
    secondary: 'border border-charcoal-light text-off-white hover:border-cyan hover:text-cyan',
    ghost: 'text-slate-text hover:text-cyan',
  }
  const classes = `${base} ${variants[variant]} ${className}`

  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>{children}</a>
  return <button className={classes} {...props}>{children}</button>
}

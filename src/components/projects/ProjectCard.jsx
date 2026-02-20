import { Link } from 'react-router-dom'
import Badge from '../shared/Badge'

const categoryColors = {
  networking: 'cyan',
  security: 'emerald',
  fullstack: 'amber',
  other: 'default',
}

export default function ProjectCard({ project }) {
  const hasDetail = true
  const Wrapper = hasDetail ? Link : 'div'
  const wrapperProps = hasDetail ? { to: `/projects/${project.slug}` } : {}

  return (
    <Wrapper
      {...wrapperProps}
      className="group block bg-charcoal rounded-xl border border-charcoal-light hover:border-cyan/30 transition-all duration-300 overflow-hidden"
    >
      {/* Image or gradient placeholder */}
      <div className="h-40 bg-gradient-to-br from-charcoal-light to-navy flex items-center justify-center relative overflow-hidden">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 font-mono text-xs text-cyan/50 leading-relaxed">
                {project.tech.slice(0, 3).map(t => (
                  <div key={t}>import &quot;{t.toLowerCase()}&quot;</div>
                ))}
              </div>
            </div>
            <span className="font-mono text-cyan/40 text-4xl font-bold group-hover:text-cyan/60 transition-colors">
              {project.title.charAt(0)}
            </span>
          </>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-off-white group-hover:text-cyan transition-colors line-clamp-1">
            {project.title}
          </h3>
          <Badge variant={categoryColors[project.category]}>{project.category}</Badge>
        </div>

        <p className="text-sm text-slate-text line-clamp-2 mb-4">
          {project.tagline}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map(tech => (
            <span key={tech} className="text-xs font-mono text-slate-text">
              {tech}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="text-xs font-mono text-slate-text">
              +{project.tech.length - 4}
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

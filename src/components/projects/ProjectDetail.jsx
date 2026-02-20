import Badge from '../shared/Badge'
import Button from '../shared/Button'

const categoryColors = {
  networking: 'cyan',
  security: 'emerald',
  fullstack: 'amber',
  other: 'default',
}

export default function ProjectDetail({ project }) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant={categoryColors[project.category]}>{project.category}</Badge>
          {project.stats && project.stats.commits && (
            <span className="text-xs font-mono text-slate-text">{project.stats.commits} commits</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-off-white">{project.title}</h1>
        <p className="text-lg text-cyan mt-2 font-mono">{project.tagline}</p>
      </div>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-2 mb-8">
        {project.tech.map(tech => (
          <span
            key={tech}
            className="px-3 py-1.5 text-sm font-mono bg-charcoal border border-charcoal-light rounded-md text-off-white"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Project image */}
      {project.image && (
        <div className="mb-8 rounded-xl overflow-hidden border border-charcoal-light">
          <img src={project.image} alt={project.title} className="w-full object-cover" />
        </div>
      )}

      {/* Links */}
      <div className="flex gap-3 mb-10">
        {project.links.github && (
          <Button href={project.links.github}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View Source
          </Button>
        )}
        {project.links.live && (
          <Button href={project.links.live} variant="secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Live Demo
          </Button>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-invert max-w-none">
        <div className="bg-charcoal rounded-xl border border-charcoal-light p-6 mb-8">
          <h2 className="text-xl font-semibold text-off-white mb-4">About This Project</h2>
          <p className="text-slate-text leading-relaxed">{project.description}</p>
        </div>

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <div className="bg-charcoal rounded-xl border border-charcoal-light p-6 mb-8">
            <h2 className="text-xl font-semibold text-off-white mb-4">Technical Highlights</h2>
            <ul className="space-y-3">
              {project.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-text">
                  <span className="text-cyan mt-0.5 font-mono text-sm">▸</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats */}
        {project.stats && (
          <div className="grid grid-cols-3 gap-4">
            {project.stats.commits && (
              <div className="bg-charcoal rounded-lg border border-charcoal-light p-4 text-center">
                <div className="text-2xl font-bold text-cyan">{project.stats.commits}</div>
                <div className="text-xs text-slate-text mt-1 font-mono">Commits</div>
              </div>
            )}
            {project.stats.lines && (
              <div className="bg-charcoal rounded-lg border border-charcoal-light p-4 text-center">
                <div className="text-2xl font-bold text-emerald">{project.stats.lines}</div>
                <div className="text-xs text-slate-text mt-1 font-mono">Lines of Code</div>
              </div>
            )}
            {project.stats.tests && (
              <div className="bg-charcoal rounded-lg border border-charcoal-light p-4 text-center">
                <div className="text-2xl font-bold text-amber">{project.stats.tests}</div>
                <div className="text-xs text-slate-text mt-1 font-mono">Tests</div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

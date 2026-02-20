import { useState } from 'react'
import projects from '../data/projects.json'
import ProjectCard from '../components/projects/ProjectCard'
import SectionHeading from '../components/shared/SectionHeading'

const categories = [
  { key: 'all', label: 'All' },
  { key: 'networking', label: 'Networking' },
  { key: 'security', label: 'Security' },
  { key: 'fullstack', label: 'Full-Stack' },
  { key: 'other', label: 'Other' },
]

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.category === activeFilter)

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading subtitle="A curated selection of projects that demonstrate real engineering depth.">
          All Projects
        </SectionHeading>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={`px-4 py-2 text-sm font-mono rounded-lg transition-all ${
                activeFilter === cat.key
                  ? 'bg-cyan text-navy'
                  : 'bg-charcoal border border-charcoal-light text-slate-text hover:border-cyan/30 hover:text-cyan'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-text py-12 font-mono">No projects in this category yet.</p>
        )}
      </div>
    </section>
  )
}

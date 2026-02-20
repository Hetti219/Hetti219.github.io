import { useParams, Link } from 'react-router-dom'
import projects from '../data/projects.json'
import ProjectDetail from '../components/projects/ProjectDetail'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)

  if (!project) {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-off-white mb-4">Project Not Found</h1>
          <p className="text-slate-text mb-6">The project you're looking for doesn't exist.</p>
          <Link to="/projects" className="text-cyan hover:underline font-mono text-sm">
            &larr; Back to Projects
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/projects" className="inline-flex items-center gap-2 text-slate-text hover:text-cyan transition-colors font-mono text-sm mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Back to Projects
        </Link>
        <ProjectDetail project={project} />
      </div>
    </section>
  )
}

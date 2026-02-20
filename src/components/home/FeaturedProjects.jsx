import projects from '../../data/projects.json'
import ProjectCard from '../projects/ProjectCard'
import SectionHeading from '../shared/SectionHeading'
import Button from '../shared/Button'

export default function FeaturedProjects() {
  const featured = projects.filter(p => p.featured)

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading subtitle="The work that defines my professional identity.">
          Featured Projects
        </SectionHeading>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(project => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button to="/projects" variant="secondary">
            View All Projects
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  )
}

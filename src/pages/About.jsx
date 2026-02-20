import SectionHeading from '../components/shared/SectionHeading'
import Timeline from '../components/about/Timeline'
import SkillGrid from '../components/about/SkillGrid'

export default function About() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading>About Me</SectionHeading>

        {/* Bio */}
        <div className="max-w-3xl mb-16">
          <div className="bg-charcoal rounded-xl border border-charcoal-light p-6 sm:p-8">
            <p className="text-slate-text leading-relaxed text-lg">
              Computer Networks graduate who builds the infrastructure others take for granted.
              My work lives at the intersection of networking and software engineering — from
              a <span className="text-off-white">Byzantine fault-tolerant distributed validation network</span> in
              Go (PBFT consensus, libp2p, gossip protocols) to a high-performance{' '}
              <span className="text-off-white">TCP SYN flood detector</span> written in C that processes
              65,000+ packets per second at the kernel/userspace boundary.
            </p>
            <p className="text-slate-text leading-relaxed text-lg mt-4">
              I don't just configure networks — I write the software that makes them secure,
              observable, and resilient.
            </p>
          </div>
        </div>

        {/* Education Timeline */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-off-white mb-6">Education</h2>
          <Timeline />
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-xl font-semibold text-off-white mb-6">Technical Skills</h2>
          <SkillGrid />
        </div>
      </div>
    </section>
  )
}

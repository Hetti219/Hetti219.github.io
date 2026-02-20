import SectionHeading from '../components/shared/SectionHeading'
import Button from '../components/shared/Button'

const contactLinks = [
  { label: 'Email', value: 'sathikahettiarachchi219@gmail.com', href: 'mailto:sathikahettiarachchi219@gmail.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'LinkedIn', value: 'sathika-hettiarachchi', href: 'https://www.linkedin.com/in/sathika-hettiarachchi-516112303', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
  { label: 'GitHub', value: 'Hetti219', href: 'https://github.com/Hetti219', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { label: 'Discord', value: 'discord.com/invite/nrhgUBNd', href: 'https://discord.com/invite/nrhgUBNd', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
]

export default function Contact() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading subtitle="Have a project in mind or want to discuss opportunities? Let's connect.">
          Get In Touch
        </SectionHeading>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* CTA */}
          <div className="flex flex-col justify-center">
            <p className="text-slate-text text-lg leading-relaxed mb-6">
              The best way to reach me is via email. Whether it's about a job opportunity,
              a collaboration, or just a question — I'd love to hear from you.
            </p>
            <div>
              <Button href="mailto:sathikahettiarachchi219@gmail.com">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Me an Email
              </Button>
            </div>
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-off-white mb-4">Find me on</h3>
            {contactLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="flex items-center gap-4 p-4 bg-charcoal rounded-lg border border-charcoal-light hover:border-cyan/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-charcoal-light flex items-center justify-center group-hover:bg-cyan/10 transition-colors">
                  <svg className="w-5 h-5 text-slate-text group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-text">{link.label}</div>
                  <div className="text-off-white font-mono text-sm group-hover:text-cyan transition-colors">{link.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import SectionHeading from '../components/shared/SectionHeading'
import Button from '../components/shared/Button'

const contactLinks = [
  { label: 'Email', value: 'sathikahettiarachchi219@gmail.com', href: 'mailto:sathikahettiarachchi219@gmail.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'LinkedIn', value: 'sathika-hettiarachchi', href: 'https://www.linkedin.com/in/sathika-hettiarachchi-516112303', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
  { label: 'GitHub', value: 'Hetti219', href: 'https://github.com/Hetti219', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { label: 'Discord', value: 'discord.com/invite/nrhgUBNd', href: 'https://discord.com/invite/nrhgUBNd', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
]

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('https://formspree.io/f/xpwdkjab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch {
      // Fallback: open email
      window.location.href = `mailto:sathikahettiarachchi219@gmail.com?subject=Portfolio Contact from ${formData.name}&body=${formData.message}`
    }
  }

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading subtitle="Have a project in mind or want to discuss opportunities? Let's connect.">
          Get In Touch
        </SectionHeading>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="bg-charcoal rounded-xl border border-emerald/30 p-8 text-center">
                <div className="text-emerald text-4xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-off-white mb-2">Message Sent</h3>
                <p className="text-slate-text">Thanks for reaching out. I'll get back to you soon.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-cyan hover:underline font-mono"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-mono text-slate-text mb-1.5">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-charcoal-light rounded-lg text-off-white placeholder-slate-text/50 focus:border-cyan focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-mono text-slate-text mb-1.5">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-charcoal-light rounded-lg text-off-white placeholder-slate-text/50 focus:border-cyan focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-mono text-slate-text mb-1.5">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-charcoal-light rounded-lg text-off-white placeholder-slate-text/50 focus:border-cyan focus:outline-none transition-colors resize-none"
                    placeholder="What's on your mind?"
                  />
                </div>
                <Button type="submit">
                  Send Message
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </form>
            )}
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-off-white mb-4">Or reach out directly</h3>
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

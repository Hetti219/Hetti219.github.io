import Button from '../shared/Button'

export default function Hero() {
  return (
    <section className="min-h-[85vh] flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <p className="font-mono text-cyan text-sm mb-4">Hi, my name is</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white leading-tight">
            Sathika Hettiarachchi
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-text mt-3">
            Network Engineer <span className="text-cyan">&times;</span> Software Developer
          </h2>
          <p className="mt-6 text-slate-text text-lg max-w-xl leading-relaxed">
            I build the software that makes networks work — from{' '}
            <span className="text-off-white">distributed consensus systems</span> to{' '}
            <span className="text-off-white">real-time DDoS mitigation</span> at the packet level.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/projects">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              View Projects
            </Button>
            <Button to="/about" variant="secondary">
              About Me
            </Button>
          </div>

          {/* Terminal-style accent */}
          <div className="mt-12 font-mono text-xs text-slate-text">
            <span className="text-emerald">$</span> cat ~/status.txt
            <br />
            <span className="text-off-white">Computer Networks graduate | Ready to deploy</span>
          </div>
        </div>
      </div>
    </section>
  )
}

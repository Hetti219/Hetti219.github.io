const entries = [
  {
    year: '2022 — 2026',
    title: 'BSc (Hons) Computer Networks',
    org: 'University Education',
    description: 'Specialization in network security, distributed systems, and systems programming.',
    type: 'education',
  },
]

export default function Timeline() {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-charcoal-light" />
      <div className="space-y-8">
        {entries.map((entry, i) => (
          <div key={i} className="relative pl-12">
            <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-cyan bg-navy" />
            <div className="bg-charcoal rounded-lg border border-charcoal-light p-5">
              <span className="font-mono text-xs text-cyan">{entry.year}</span>
              <h3 className="font-semibold text-off-white mt-1">{entry.title}</h3>
              <p className="text-sm text-slate-text">{entry.org}</p>
              <p className="text-sm text-slate-text mt-2">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

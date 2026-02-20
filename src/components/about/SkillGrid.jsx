import skills from '../../data/skills.json'

export default function SkillGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(skills).map(([category, items]) => (
        <div
          key={category}
          className="bg-charcoal rounded-xl border border-charcoal-light p-5"
        >
          <h3 className="font-semibold text-off-white text-sm mb-3">{category}</h3>
          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <span
                key={item}
                className="text-xs font-mono text-slate-text bg-charcoal-light px-2 py-1 rounded"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

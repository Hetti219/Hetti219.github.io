import skills from '../../data/skills.json'
import SectionHeading from '../shared/SectionHeading'

const categoryIcons = {
  'Systems & Networking': '🔗',
  'Languages (Proven)': '⚙️',
  'Languages (Familiar)': '📚',
  'Frameworks & Tools': '🛠️',
  'Databases': '🗄️',
  'Testing & Quality': '🧪',
}

export default function SkillsOverview() {
  const topCategories = ['Systems & Networking', 'Languages (Proven)', 'Frameworks & Tools']

  return (
    <section className="py-20 bg-charcoal/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading subtitle="Technologies proven through substantial projects, not just tutorials.">
          Technical Skills
        </SectionHeading>

        <div className="grid md:grid-cols-3 gap-6">
          {topCategories.map(category => (
            <div
              key={category}
              className="bg-charcoal rounded-xl border border-charcoal-light p-6"
            >
              <h3 className="font-semibold text-off-white mb-4 flex items-center gap-2">
                <span>{categoryIcons[category]}</span>
                {category}
              </h3>
              <ul className="space-y-2">
                {skills[category].map(skill => (
                  <li key={skill} className="text-sm text-slate-text font-mono">
                    <span className="text-cyan mr-2">▸</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

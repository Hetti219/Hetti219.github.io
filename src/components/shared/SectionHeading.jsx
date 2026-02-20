export default function SectionHeading({ children, subtitle }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-off-white">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-2 text-slate-text max-w-2xl">{subtitle}</p>
      )}
    </div>
  )
}

export default function Card({ title, action, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-ww-line bg-white p-5 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold text-ww-navy">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
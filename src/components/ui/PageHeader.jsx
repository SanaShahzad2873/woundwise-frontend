export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ww-navy">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-ww-muted">{subtitle}</p>}
    </div>
  )
}
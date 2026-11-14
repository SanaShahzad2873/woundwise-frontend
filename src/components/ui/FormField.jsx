export default function FormField({ label, optional, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-2 text-sm font-medium text-ww-navy">
        {label}
        {optional && (
          <span className="text-xs font-normal text-ww-muted">(optional)</span>
        )}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
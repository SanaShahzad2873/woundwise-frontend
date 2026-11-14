export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ww-line bg-white px-6 py-12 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ww-mint-soft">
          <Icon className="h-6 w-6 text-ww-teal" />
        </div>
      )}
      <div>
        <p className="font-medium text-ww-navy">{title}</p>
        {text && <p className="mt-1 text-sm text-ww-muted">{text}</p>}
      </div>
      {children}
    </div>
  )
}
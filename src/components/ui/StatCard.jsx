export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-ww-line bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ww-muted">{label}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ww-mint-soft">
            <Icon className="h-5 w-5 text-ww-teal" />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ww-navy">
        {value}
      </p>
    </div>
  )
}
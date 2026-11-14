import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

const styles = {
  good: { label: 'Good quality', cls: 'bg-ww-mint-soft text-ww-teal-dark', Icon: CheckCircle2 },
  fair: { label: 'Fair quality', cls: 'bg-amber-50 text-amber-800', Icon: AlertCircle },
  poor: { label: 'Poor quality', cls: 'bg-red-50 text-red-700', Icon: XCircle },
}

export default function QualityBadge({ quality }) {
  if (!quality) return <span className="text-sm text-ww-muted">Not assessed</span>
  const { label, cls, Icon } = styles[quality.status] || styles.fair
  return (
    <div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      {quality.issues?.length > 0 && (
        <p className="mt-1 text-xs text-ww-muted">{quality.issues.join(' · ')}</p>
      )}
    </div>
  )
}
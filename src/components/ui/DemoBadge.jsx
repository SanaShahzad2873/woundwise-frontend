import { FlaskConical } from 'lucide-react'

export default function DemoBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
      title="All patients, images and results on screen are fictional demo data"
    >
      <FlaskConical className="h-3.5 w-3.5" />
      Demo data
    </span>
  )
}
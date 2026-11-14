import { Loader2 } from 'lucide-react'

export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ww-muted">
      <Loader2 className="h-7 w-7 animate-spin text-ww-teal" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
import { ShieldAlert } from 'lucide-react'

export default function DisclaimerBanner() {
  return (
  
    <footer className="print:hidden border-t border-ww-line bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-start gap-2 text-xs text-ww-muted">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ww-teal" />
        <p>
          WoundWise AI provides AI-assisted visual analysis and wound progress
          documentation. It is not a substitute for professional medical
          assessment, diagnosis, or treatment.
        </p>
      </div>
    </footer>
  )
}
import { ShieldAlert } from 'lucide-react'

export default function LimitationsPanel() {
  return (
    <div className="rounded-2xl border border-ww-line bg-ww-mint-soft/60 p-5">
      <h2 className="flex items-center gap-2 font-semibold text-ww-navy">
        <ShieldAlert className="h-5 w-5 text-ww-teal" />
        What this result can and cannot tell you
      </h2>
      <div className="mt-3 grid gap-4 text-sm text-ww-text sm:grid-cols-2">
        <div>
          <p className="font-medium text-ww-teal-dark">It can</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-ww-muted">
            <li>Outline the visible wound region in this photo.</li>
            <li>Measure that region in pixels.</li>
            <li>Keep dated photos together so changes are easy to see.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-ww-teal-dark">It cannot</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-ww-muted">
            <li>Give real-world size in cm² (no calibration reference).</li>
            <li>Show that a wound is healing, infected, or needs treatment.</li>
            <li>Replace assessment by a healthcare professional.</li>
          </ul>
        </div>
      </div>
      <p className="mt-3 text-xs text-ww-muted">
        Camera distance, angle and lighting all change pixel measurements.
      </p>
    </div>
  )
}
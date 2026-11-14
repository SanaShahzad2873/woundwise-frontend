import { Link } from 'react-router-dom'
import { Menu, Plus } from 'lucide-react'
import { isMock } from '../../services/api'
import DemoBadge from '../ui/DemoBadge'

export default function TopBar({ onMenuClick }) {
  return (
    <header className="sticky print:hidden top-0 z-20 flex h-16 items-center justify-between border-b border-ww-line bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ww-navy hover:bg-ww-bg lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden text-sm font-medium text-ww-muted sm:inline">
          AI-assisted wound documentation
        </span>
        {isMock && <DemoBadge />}
      </div>

      <Link
        to="/upload"
        className="inline-flex items-center gap-2 rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ww-teal-dark"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New analysis</span>
        <span className="sm:hidden">New</span>
      </Link>
    </header>
  )
}
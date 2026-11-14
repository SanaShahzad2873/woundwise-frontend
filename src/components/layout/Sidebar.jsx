import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UploadCloud, Activity, X } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/upload', label: 'New Analysis', icon: UploadCloud },
]

// "open" and "onClose" only matter on phones, where the sidebar slides in and out.
export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Dark overlay behind the menu on mobile. Clicking it closes the menu. */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
       
        className={`fixed print:hidden inset-y-0 left-0 z-40 flex w-64 flex-col bg-ww-navy text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Activity className="h-5 w-5 text-ww-mint" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              WoundWise <span className="text-ww-mint">AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-ww-mint'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 text-xs text-white/50">
          Hackathon prototype
          <br />
          Not a certified medical device
        </div>
      </aside>
    </>
  )
}
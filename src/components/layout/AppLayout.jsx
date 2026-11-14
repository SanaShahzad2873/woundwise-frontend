import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import DisclaimerBanner from '../ui/DisclaimerBanner'

export default function AppLayout() {
  // This remembers whether the mobile menu is open (true) or closed (false).
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-64 print:pl-0">
        <TopBar onMenuClick={() => setMenuOpen(true)} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>

        <DisclaimerBanner />
      </div>
    </div>
  )
}
import { NavLink } from 'react-router-dom'
import { Calculator, Settings } from 'lucide-react'
import Logo from './Logo'

const navItems = [
  { to: '/calculator', label: 'Kalkulator', Icon: Calculator },
  { to: '/settings', label: 'Innstillinger', Icon: Settings },
]

export default function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <Logo size={32} />

        <nav className="flex items-center gap-1" aria-label="Hovedmeny">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-filament/10 text-filament'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

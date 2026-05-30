import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, MessageSquare, Users, BarChart3,
  Settings, Menu, X, Bell, Search, ChevronDown, Bot,
  LogOut, User
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/products', icon: Package, label: 'Products' },
  { to: '/dashboard/conversations', icon: MessageSquare, label: 'Conversations' },
  { to: '/dashboard/leads', icon: Users, label: 'Leads' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [agentMode, setAgentMode] = useState('on')
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()

  const userInitials = user?.initials || (
    (user?.first_name && user?.last_name)
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user?.first_name
        ? user.first_name[0].toUpperCase()
        : user?.email
          ? user.email[0].toUpperCase()
          : '?'
  )

  const userFullName = user?.full_name || (
    (user?.first_name && user?.last_name)
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.email || 'User'
  )

  const userEmail = user?.email || ''

  const pageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path.includes('products')) return 'Products'
    if (path.includes('conversations')) return 'Conversations'
    if (path.includes('leads')) return 'Leads'
    if (path.includes('analytics')) return 'Analytics'
    if (path.includes('settings')) return 'Settings'
    return 'Dashboard'
  }

  const agentModes = [
    { key: 'on', label: 'ON', color: 'bg-emerald-500' },
    { key: 'busy', label: 'BUSY', color: 'bg-amber-500' },
    { key: 'off', label: 'OFF', color: 'bg-zinc-500' },
  ]

  const handleLogout = () => {
    if (logout) {
      logout()
    } else {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/'
    }
  }

  return (
    <div className="flex h-screen bg-zinc-50">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SalesAgent</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-zinc-800">
            <NavLink
              to="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`
              }
            >
              <Settings size={19} />
              Settings
            </NavLink>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-zinc-800">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
            Agent Status
          </p>
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
            {agentModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setAgentMode(mode.key)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                  agentMode === mode.key
                    ? `${mode.color} text-white shadow-md`
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          {agentMode === 'on' && (
            <div className="flex items-center gap-2 mt-2.5 px-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-400">Agent is live</span>
            </div>
          )}
          {agentMode === 'busy' && (
            <div className="flex items-center gap-2 mt-2.5 px-1">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs text-amber-400">Agent is busy</span>
            </div>
          )}
          {agentMode === 'off' && (
            <div className="flex items-center gap-2 mt-2.5 px-1">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
              </span>
              <span className="text-xs text-zinc-400">Agent is offline</span>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userFullName}</p>
              <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-600 hover:text-zinc-900"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900">{pageTitle()}</h1>
          </div>

          <div className="hidden md:flex items-center bg-zinc-100 rounded-lg px-3 py-2 w-72">
            <Search size={16} className="text-zinc-400 mr-2" />
            <input
              type="text"
              placeholder="Search products, leads..."
              className="bg-transparent text-sm text-zinc-700 outline-none w-full placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="relative p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {userInitials}
                </div>
                <ChevronDown size={14} className="text-zinc-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{userFullName}</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{userEmail}</p>
                      </div>
                      <NavLink
                        to="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        <User size={15} /> Profile
                      </NavLink>
                      <NavLink
                        to="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        <Settings size={15} /> Settings
                      </NavLink>
                      <div className="border-t border-zinc-100 my-1" />
                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut size={15} /> Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-4 lg:p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
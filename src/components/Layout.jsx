import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Clock, CheckSquare, ShieldAlert, User, LogOut, Bell, Menu, Sun, Moon 
} from 'lucide-react'
import Notifications from './Notifications'

export default function Layout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'User'] },
    { name: 'Time Tracker', path: '/time', icon: Clock, roles: ['Admin', 'Manager', 'User'] },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare, roles: ['Admin', 'Manager', 'User'] },
    { name: 'Admin Panel', path: '/admin', icon: ShieldAlert, roles: ['Admin'] },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700">
            <h1 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">Safari HRM</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
              item.roles.includes(profile?.role) && (
                <Link key={item.path} to={item.path} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            ))}
          </nav>
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <img src={profile?.avatar_url || `/default-avatar-${profile?.gender?.toLowerCase() || 'male'}.png`} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.role}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 w-full p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Notifications />
            <Link to="/profile" className="flex items-center gap-2">
              <User size={20} />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

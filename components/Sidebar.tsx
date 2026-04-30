'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Shield, 
  User, 
  LogOut,
  Moon,
  Sun,
  UserCheck          // <-- added for approvals
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, profile, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
    { href: '/tasks', label: 'My Tasks', icon: CheckSquare, roles: ['admin', 'manager', 'staff'] },
    { href: '/admin', label: 'Admin Panel', icon: Shield, roles: ['admin'] },
    { href: '/profile', label: 'Profile', icon: User, roles: ['admin', 'manager', 'staff'] },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          HRM Pro
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time & Task Manager</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          if (!item.roles.includes(profile?.role || 'staff')) return null
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}

        {/* Admin Approvals Link - only visible to admin */}
        {profile?.role === 'admin' && (
          <Link href="/admin/approvals">
            <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
              pathname === '/admin/approvals'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              <UserCheck size={20} />
              <span>User Approvals</span>
            </div>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="text-gray-700 dark:text-gray-300">Theme</span>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

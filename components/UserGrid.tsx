'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatTime, getCurrentStatusFromEntries } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'

interface User {
  id: string
  name: string
  user_id: string
  role: string
  status: 'active' | 'break' | 'offline'
  lastIn: Date | null
  lastOut: Date | null
}

export default function UserGrid() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchUsersWithStatus = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('name')
    
    if (!profiles) return

    const today = new Date().toISOString().split('T')[0]
    const usersWithStatus = await Promise.all(
      profiles.map(async (profile) => {
        const { data: entries } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', profile.id)
          .gte('start_time', today)
          .order('start_time', { ascending: false })
        
        const status = getCurrentStatusFromEntries(entries || [])
        const lastIn = entries?.find(e => e.type === 'work')?.start_time || null
        const lastOut = entries?.find(e => e.type === 'break')?.start_time || null
        return {
          ...profile,
          status,
          lastIn,
          lastOut
        }
      })
    )
    setUsers(usersWithStatus)
  }

  useEffect(() => {
    fetchUsersWithStatus()
    const subscription = supabase
      .channel('user_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries' }, fetchUsersWithStatus)
      .subscribe()
    return () => { subscription.unsubscribe() }
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                          user.user_id.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="break">On Break</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.user_id}</p>
                <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                  {user.role}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                user.status === 'break' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {user.status === 'active' ? '🟢 Active' : user.status === 'break' ? '🟡 On Break' : '⚫ Offline'}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last IN</p>
                <p className="font-medium">{user.lastIn ? formatTime(user.lastIn) : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last OUT</p>
                <p className="font-medium">{user.lastOut ? formatTime(user.lastOut) : '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

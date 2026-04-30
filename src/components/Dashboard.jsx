import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()

    // Real-time subscription – use a custom channel name
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_logs' }, () => fetchUsers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchUsers() {
    setLoading(true)
    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, user_id, gender, role, avatar_url')

    if (error) {
      console.error('Error fetching profiles:', error)
      toast.error('Failed to load dashboard')
      setLoading(false)
      return
    }

    if (!profiles || profiles.length === 0) {
      setUsers([])
      setLoading(false)
      return
    }

    const today = new Date().toISOString().split('T')[0]

    // Process each user to get latest status and totals
    const enhanced = await Promise.all(profiles.map(async (u) => {
      // Get latest time log for status
      const { data: lastLog } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', u.id)  // ✅ u.id is UUID
        .eq('date', today)
        .order('in_time', { ascending: false })
        .limit(1)

      let status = 'Offline'
      let lastIn = null
      let lastOut = null
      let totalWork = 0
      let totalBreak = 0

      if (lastLog && lastLog[0]) {
        const log = lastLog[0]
        lastIn = log.in_time
        if (log.out_time && !log.return_time) {
          status = 'On Break'
          lastOut = log.out_time
        } else if (log.in_time && !log.out_time) {
          status = 'Active'
        }

        // Get all logs for today to calculate totals
        const { data: daily } = await supabase
          .from('time_logs')
          .select('in_time, out_time, return_time')
          .eq('user_id', u.id)
          .eq('date', today)

        if (daily) {
          daily.forEach(l => {
            if (l.in_time && l.out_time && l.return_time) {
              totalWork += (new Date(l.out_time) - new Date(l.in_time)) / 1000 / 60
              totalBreak += (new Date(l.return_time) - new Date(l.out_time)) / 1000 / 60
            } else if (l.in_time && l.out_time && !l.return_time) {
              totalBreak += (new Date() - new Date(l.out_time)) / 1000 / 60
            } else if (l.in_time && !l.out_time) {
              totalWork += (new Date() - new Date(l.in_time)) / 1000 / 60
            }
          })
        }
      }

      return {
        ...u,
        status,
        last_in_time: lastIn,
        last_out_time: lastOut,
        total_worked_today: Math.round(totalWork),
        total_break_today: Math.round(totalBreak),
      }
    }))

    setUsers(enhanced)
    setLoading(false)
  }

  // Helper for default avatar – using a reliable placeholder service (UI Avatars)
  const getAvatarUrl = (user) => {
    if (user.avatar_url) return user.avatar_url
    const gender = user.gender?.toLowerCase() || 'male'
    // Using ui-avatars.com as fallback (free, reliable)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=${gender === 'male' ? '0D8ABC' : 'D23669'}&color=fff&size=128`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Dashboard</h1>
      {users.length === 0 ? (
        <div className="text-center text-gray-500">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <img 
                  src={getAvatarUrl(user)} 
                  className="w-12 h-12 rounded-full object-cover" 
                  alt={user.full_name}
                />
                <div>
                  <h3 className="font-semibold">{user.full_name}</h3>
                  <p className="text-sm text-gray-500">{user.user_id}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  Status: 
                  <span className={`font-bold ml-1 ${
                    user.status === 'Active' ? 'text-green-500' : 
                    user.status === 'On Break' ? 'text-yellow-500' : 
                    'text-gray-500'
                  }`}>
                    {user.status}
                  </span>
                </p>
                <p>Last IN: {user.last_in_time ? new Date(user.last_in_time).toLocaleTimeString() : '--'}</p>
                <p>Last OUT: {user.last_out_time ? new Date(user.last_out_time).toLocaleTimeString() : '--'}</p>
                <p>Worked today: {user.total_worked_today} min</p>
                <p>Break today: {user.total_break_today} min</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

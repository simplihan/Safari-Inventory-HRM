import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
    // Subscribe to realtime changes on time_logs and profiles
    const channel = supabase
      .channel('public:time_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_logs' }, () => fetchUsers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchUsers() {
    setLoading(true)
    // Get all profiles with latest status & today's totals
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
    if (error) console.error(error)

    const today = new Date().toISOString().split('T')[0]
    const enhanced = await Promise.all(profiles.map(async (u) => {
      // Get latest time log for status
      const { data: lastLog } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', u.id)
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
        // Calculate totals (simplified)
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar_url || `/default-avatar-${user.gender}.png`} className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="font-semibold">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.user_id}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p>Status: <span className={`font-bold ${user.status === 'Active' ? 'text-green-500' : user.status === 'On Break' ? 'text-yellow-500' : 'text-gray-500'}`}>{user.status}</span></p>
              <p>Last IN: {user.last_in_time ? new Date(user.last_in_time).toLocaleTimeString() : '--'}</p>
              <p>Last OUT: {user.last_out_time ? new Date(user.last_out_time).toLocaleTimeString() : '--'}</p>
              <p>Worked today: {user.total_worked_today} min</p>
              <p>Break today: {user.total_break_today} min</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

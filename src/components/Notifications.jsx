import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import { Bell } from 'lucide-react'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const sub = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new, ...prev])
        if (Notification.permission === 'granted') new Notification(payload.new.message)
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [user])

  async function fetchNotifications() {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    setNotifications(data || [])
  }

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative">
        <Bell size={20} />
        {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{notifications.length}</span>}
      </button>
      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded shadow-lg z-50 p-2">
          {notifications.length === 0 && <p className="text-gray-500 p-2">No notifications</p>}
          {notifications.map(n => (
            <div key={n.id} className="p-2 border-b text-sm">{n.message}</div>
          ))}
        </div>
      )}
    </div>
  )
}

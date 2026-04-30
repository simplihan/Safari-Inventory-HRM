'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatDuration, getCurrentStatus } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TimeTrackerProps {
  userId: string
}

export default function TimeTracker({ userId }: TimeTrackerProps) {
  const [status, setStatus] = useState<'active' | 'break' | 'offline'>('offline')
  const [totalWork, setTotalWork] = useState(0)
  const [totalBreak, setTotalBreak] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data: entries } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', today)
      .order('start_time', { ascending: true })

    if (!entries) return

    // Calculate totals
    let workSecs = 0, breakSecs = 0
    entries.forEach(entry => {
      const end = entry.end_time ? new Date(entry.end_time) : new Date()
      const start = new Date(entry.start_time)
      const duration = (end.getTime() - start.getTime()) / 1000
      if (entry.type === 'work') workSecs += duration
      else breakSecs += duration
    })
    setTotalWork(workSecs)
    setTotalBreak(breakSecs)
    setStatus(getCurrentStatus(entries))
  }

  const handleClock = async (action: 'in' | 'out') => {
    setLoading(true)
    const now = new Date().toISOString()
    const { data: lastEntry } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .single()

    if (action === 'in') {
      if (!lastEntry || lastEntry.type === 'break') {
        // Close break if exists
        if (lastEntry?.type === 'break') {
          await supabase
            .from('time_entries')
            .update({ end_time: now })
            .eq('id', lastEntry.id)
        }
        // Start work session
        await supabase
          .from('time_entries')
          .insert({
            user_id: userId,
            type: 'work',
            start_time: now,
            work_session_id: lastEntry?.work_session_id || crypto.randomUUID()
          })
        toast.success('Work started')
      }
    } else if (action === 'out') {
      if (lastEntry?.type === 'work') {
        // Start break
        await supabase
          .from('time_entries')
          .insert({
            user_id: userId,
            type: 'break',
            start_time: now,
            work_session_id: lastEntry.work_session_id
          })
        toast('Break started', { icon: '☕' })
      }
    }
    await fetchStats()
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
    const subscription = supabase
      .channel('time_entries_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries', filter: `user_id=eq.${userId}` }, fetchStats)
      .subscribe()
    return () => { subscription.unsubscribe() }
  }, [userId])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Time Tracking</h3>
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => handleClock('in')}
            disabled={loading || status === 'active'}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
          >
            IN • Start Work
          </button>
          <button
            onClick={() => handleClock('out')}
            disabled={loading || status !== 'active'}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
          >
            OUT • Break
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className={`text-xl font-bold ${
              status === 'active' ? 'text-green-600' : status === 'break' ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {status === 'active' ? 'Active' : status === 'break' ? 'On Break' : 'Offline'}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Today Worked</p>
            <p className="text-xl font-bold">{formatDuration(totalWork)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Break Time</p>
            <p className="text-xl font-bold">{formatDuration(totalBreak)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

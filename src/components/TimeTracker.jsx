import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function TimeTracker() {
  const { user, profile } = useAuth()
  const [status, setStatus] = useState('Offline')
  const [todayWork, setTodayWork] = useState(0)
  const [todayBreak, setTodayBreak] = useState(0)
  const [breakModal, setBreakModal] = useState(false)
  const [breakType, setBreakType] = useState('')
  const [breakRemarks, setBreakRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTodayStatus()
    const interval = setInterval(fetchTodayStatus, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchTodayStatus() {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data: logs, error } = await supabase
      .from('time_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('in_time', { ascending: false })

    if (error) return

    let work = 0, breakTime = 0, currentStatus = 'Offline'
    if (logs && logs.length > 0) {
      const last = logs[0]
      if (last.in_time && !last.out_time) currentStatus = 'Active'
      else if (last.out_time && !last.return_time) currentStatus = 'On Break'
      
      logs.forEach(log => {
        if (log.in_time && log.out_time && log.return_time) {
          work += (new Date(log.out_time) - new Date(log.in_time)) / 1000 / 60
          breakTime += (new Date(log.return_time) - new Date(log.out_time)) / 1000 / 60
        } else if (log.in_time && !log.out_time) {
          work += (new Date() - new Date(log.in_time)) / 1000 / 60
        } else if (log.out_time && !log.return_time) {
          breakTime += (new Date() - new Date(log.out_time)) / 1000 / 60
        }
      })
    }
    setStatus(currentStatus)
    setTodayWork(Math.round(work))
    setTodayBreak(Math.round(breakTime))
  }

  async function handleIn() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    const { error } = await supabase.from('time_logs').insert({
      user_id: user.id,
      date: today,
      in_time: now,
      break_type: null,
      break_remarks: null,
    })
    if (error) toast.error(error.message)
    else toast.success('Work session started')
    await fetchTodayStatus()
    setLoading(false)
  }

  async function handleOut() {
    setBreakModal(true)
  }

  async function confirmBreak() {
    if (!breakType) return toast.error('Please select break type')
    if (breakType === 'Other Purpose' && !breakRemarks.trim()) return toast.error('Remarks required')
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    // Find the active session (in_time without out_time)
    const { data: active } = await supabase
      .from('time_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .is('out_time', null)
      .order('in_time', { ascending: false })
      .limit(1)
    
    if (active && active[0]) {
      const { error } = await supabase
        .from('time_logs')
        .update({ out_time: now, break_type: breakType, break_remarks: breakRemarks || null })
        .eq('id', active[0].id)
      if (error) toast.error(error.message)
      else toast.success('Break started')
    }
    setBreakModal(false)
    setBreakType('')
    setBreakRemarks('')
    await fetchTodayStatus()
    setLoading(false)
  }

  async function handleReturn() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    const { data: activeBreak } = await supabase
      .from('time_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .not('out_time', 'is', null)
      .is('return_time', null)
      .order('out_time', { ascending: false })
      .limit(1)
    
    if (activeBreak && activeBreak[0]) {
      const { error } = await supabase
        .from('time_logs')
        .update({ return_time: now })
        .eq('id', activeBreak[0].id)
      if (error) toast.error(error.message)
      else toast.success('Back from break')
    }
    await fetchTodayStatus()
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Time Tracking</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="text-center">
          <p className="text-lg mb-2">Current Status: 
            <span className={`font-bold ml-2 ${status === 'Active' ? 'text-green-500' : status === 'On Break' ? 'text-yellow-500' : 'text-gray-500'}`}>
              {status}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm">Today Worked</p>
              <p className="text-2xl font-bold">{todayWork} min</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm">Today Break</p>
              <p className="text-2xl font-bold">{todayBreak} min</p>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            {status === 'Offline' && (
              <button onClick={handleIn} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                IN (Start Work)
              </button>
            )}
            {status === 'Active' && (
              <button onClick={handleOut} disabled={loading} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                OUT (Take Break)
              </button>
            )}
            {status === 'On Break' && (
              <button onClick={handleReturn} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                IN (Return from Break)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Break Modal */}
      {breakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Select Break Type</h2>
            <select value={breakType} onChange={e => setBreakType(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 mb-4">
              <option value="">Select...</option>
              <option value="Tea Break">Tea Break</option>
              <option value="Lunch Break">Lunch Break</option>
              <option value="Other Purpose">Other Purpose</option>
            </select>
            {breakType === 'Other Purpose' && (
              <textarea placeholder="Remarks (required)" value={breakRemarks} onChange={e => setBreakRemarks(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 mb-4" rows="2" />
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBreakModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
              <button onClick={confirmBreak} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm Break</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

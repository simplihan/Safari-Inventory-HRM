import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
  }

  async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return
    setLoading(true)
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) {
      toast.error('Failed to delete user: ' + error.message)
    } else {
      toast.success('User deleted')
      fetchUsers() // Refresh list
    }
    setLoading(false)
  }

  async function exportExcel() {
    // Fetch time logs with user details
    const { data, error } = await supabase
      .from('time_logs')
      .select(`
        date,
        in_time,
        out_time,
        break_type,
        profiles:user_id ( full_name, user_id )
      `)
    if (error) {
      toast.error('Export failed: ' + error.message)
      return
    }
    if (!data || data.length === 0) {
      toast('No data to export')
      return
    }
    // Convert to CSV
    const rows = data.map(row => {
      const profile = row.profiles?.[0] || {}
      return `${profile.full_name || ''},${profile.user_id || ''},${row.date},${row.in_time || ''},${row.out_time || ''},${row.break_type || ''}`
    })
    const csv = ['Name,User ID,Date,IN Time,OUT Time,Break Type', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`
    link.click()
    toast.success('Export started')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="mb-4 flex gap-3">
        <button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export to Excel (CSV)</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Role</th>
              <th className="p-2">Gender</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.full_name}</td>
                <td className="p-2">{u.user_id}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.gender}</td>
                <td className="p-2">
                  <button 
                    onClick={() => deleteUser(u.id, u.full_name)} 
                    className="text-red-600 hover:underline"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

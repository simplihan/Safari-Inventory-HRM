import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
  }

  async function deleteUser(userId) {
    if (confirm('Delete user?')) {
      await supabase.from('profiles').delete().eq('id', userId)
      toast.success('User deleted')
      fetchUsers()
    }
  }

  async function exportExcel() {
    const { data } = await supabase.from('time_logs').select('*, profiles(full_name, user_id)')
    const csv = data.map(row => `${row.profiles.full_name},${row.date},${row.in_time},${row.out_time},${row.break_type}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'attendance.csv'
    link.click()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="mb-4 flex gap-3">
        <button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded">Export to Excel</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr><th>Name</th><th>User ID</th><th>Role</th><th>Gender</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.full_name}</td><td>{u.user_id}</td><td>{u.role}</td><td>{u.gender}</td>
                <td><button onClick={() => deleteUser(u.id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

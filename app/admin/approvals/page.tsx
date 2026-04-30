'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface PendingUser {
  id: string
  name: string
  user_id: string
  sgc_number: string
  role: string
  created_at: string
}

export default function ApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPending = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (!error) setPendingUsers(data || [])
    setLoading(false)
  }

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', userId)

    if (error) {
      toast.error('Approval failed')
    } else {
      toast.success('User approved')
      fetchPending()
    }
  }

  const handleReject = async (userId: string) => {
    // Delete auth user and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    if (profile) {
      await supabase.auth.admin.deleteUser(profile.id)
      toast.success('User rejected and removed')
      fetchPending()
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
      {pendingUsers.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map(user => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">ID: {user.user_id} | SGC: {user.sgc_number}</p>
                <p className="text-xs">Role: {user.role} | Requested: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleApprove(user.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

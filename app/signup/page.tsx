'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    userId: '',
    userIdManual: false,
    sgcNumber: '',
    password: '',
    role: 'staff'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalUserId = form.userIdManual ? form.userId : form.sgcNumber
    const email = `${finalUserId}@hrmapp.com` // internal email for Supabase Auth

    // Check if user ID already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', finalUserId)
      .maybeSingle()

    if (existing) {
      toast.error('User ID already taken.')
      setLoading(false)
      return
    }

    // Create auth user (disabled login until approved)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: { name: form.name, role: form.role, sgc_number: form.sgcNumber },
        // Disable email confirmation
        emailRedirectTo: undefined,
      }
    })

    if (authError) {
      toast.error(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      toast.error('Signup failed.')
      setLoading(false)
      return
    }

    // Create profile with is_approved = false
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: form.name,
        user_id: finalUserId,
        sgc_number: form.sgcNumber,
        role: form.role,
        is_approved: false
      })

    if (profileError) {
      // Cleanup: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      toast.error('Profile creation failed: ' + profileError.message)
    } else {
      toast.success('Registration submitted! Awaiting admin approval.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Request Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.userIdManual}
              onChange={e => setForm({ ...form, userIdManual: e.target.checked })}
            />
            <label>Set custom User ID?</label>
          </div>
          {form.userIdManual ? (
            <input
              type="text"
              placeholder="User ID"
              value={form.userId}
              onChange={e => setForm({ ...form, userId: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
          ) : (
            <p className="text-sm text-gray-500">User ID will be your SGC Number</p>
          )}
          <input
            type="text"
            placeholder="SGC Number"
            value={form.sgcNumber}
            onChange={e => setForm({ ...form, sgcNumber: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full p-3 border rounded-lg"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? 'Submitting...' : 'Request Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

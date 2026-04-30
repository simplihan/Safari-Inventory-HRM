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
    const email = `${finalUserId}@hrmapp.com`  // use a consistent domain

    // 1. Check if user ID already exists in profiles (optional but avoids duplication)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', finalUserId)
      .maybeSingle()

    if (existingProfile) {
      toast.error('User ID already taken. Please use another one.')
      setLoading(false)
      return
    }

    // 2. Sign up with Supabase Auth (email/password)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          role: form.role,
          sgc_number: form.sgcNumber
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      if (authError.message.includes('Anonymous sign-ins are disabled')) {
        toast.error(
          'Email sign-ups are disabled in Supabase. ' +
          'Please enable "Email" provider in your Supabase Authentication settings.'
        )
      } else if (authError.message.includes('User already registered')) {
        toast.error('This email is already registered. Please log in instead.')
      } else {
        toast.error(authError.message)
      }
      setLoading(false)
      return
    }

    if (!authData.user) {
      toast.error('Sign-up failed. Please try again.')
      setLoading(false)
      return
    }

    // 3. Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: form.name,
        user_id: finalUserId,
        sgc_number: form.sgcNumber,
        role: form.role,
      })

    if (profileError) {
      // Rollback: delete the auth user (requires admin API – optional)
      // For simplicity, just tell the user to contact support
      console.error('Profile insert error:', profileError)
      toast.error(
        'Account created but profile setup failed. ' +
        'Please contact support or try signing up again.'
      )
      // Optional: sign out the user to avoid half‑created state
      await supabase.auth.signOut()
    } else {
      toast.success('Registration successful! Please log in.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="manualUserId"
              checked={form.userIdManual}
              onChange={e => setForm({ ...form, userIdManual: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="manualUserId" className="text-sm">
              Use custom User ID (otherwise SGC Number will be used)
            </label>
          </div>

          {form.userIdManual ? (
            <input
              type="text"
              placeholder="User ID (login name)"
              value={form.userId}
              onChange={e => setForm({ ...form, userId: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              required
            />
          ) : (
            <p className="text-sm text-gray-500">User ID will be set to your SGC Number</p>
          )}

          <input
            type="text"
            placeholder="SGC Number (unique)"
            value={form.sgcNumber}
            onChange={e => setForm({ ...form, sgcNumber: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            required
            minLength={6}
          />

          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

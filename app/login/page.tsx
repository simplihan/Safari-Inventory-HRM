'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const email = `${userId}@hrmapp.com`

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error('Invalid credentials')
      setLoading(false)
      return
    }

    // Check approval status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_approved, role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile?.is_approved) {
      await supabase.auth.signOut()
      toast.error('Your account is pending admin approval. Please try later.')
      setLoading(false)
      return
    }

    toast.success('Logged in successfully')
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="User ID (SGC or custom)"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-sm">
            No account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Request access
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

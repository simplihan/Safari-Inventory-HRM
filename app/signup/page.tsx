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
    
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${finalUserId}@example.com`, // User ID as email placeholder
      password: form.password,
      options: {
        data: { name: form.name, role: form.role }
      }
    })
    
    if (authError) {
      toast.error(authError.message)
      setLoading(false)
      return
    }
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user!.id,
        name: form.name,
        user_id: finalUserId,
        sgc_number: form.sgcNumber,
        role: form.role,
      })
    
    if (profileError) {
      toast.error(profileError.message)
    } else {
      toast.success('Registration successful! Please login.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded" required />
          
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.userIdManual} onChange={e => setForm({...form, userIdManual: e.target.checked})} />
            <label>Manual User ID?</label>
          </div>
          {form.userIdManual ? (
            <input type="text" placeholder="User ID" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} className="w-full p-2 border rounded" required />
          ) : (
            <div className="text-sm text-gray-500">User ID will be same as SGC Number</div>
          )}
          
          <input type="text" placeholder="SGC Number" value={form.sgcNumber} onChange={e => setForm({...form, sgcNumber: e.target.value})} className="w-full p-2 border rounded" required />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-2 border rounded" required />
          
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full p-2 border rounded">
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

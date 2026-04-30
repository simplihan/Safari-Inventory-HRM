import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, unique_number, user_id, full_name, gender, role, avatar_url, email')
      .eq('id', userId)
      .single()
    if (error) console.error('fetchProfile error:', error)
    else setProfile(data)
  }

  // Login: look up real email by unique number, then sign in
  const login = async (uniqueNumber, password) => {
    const { data: email, error: lookupError } = await supabase
      .rpc('get_email_by_unique_number', { p_unique_number: uniqueNumber })

    if (lookupError || !email) {
      throw new Error('No account found for that unique number.')
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
  }

  // Register: pass real email — Supabase trigger auto-creates the profile row
  const register = async ({
    uniqueNumber,
    fullName,
    gender,
    password,
    role,
    email,
    customUserId,
    profileImage,
  }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:     fullName,
          role,
          gender,
          unique_number: uniqueNumber,
          user_id:       customUserId || uniqueNumber,
          avatar_url:    profileImage || null,
        },
      },
    })
    if (authError) throw authError

    // ✅ No manual profile insert needed — the DB trigger handles it automatically
    return authData
  }

  const logout = async () => supabase.auth.signOut()

  const updateProfile = async (updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (error) throw error
    setProfile(prev => ({ ...prev, ...updates }))
    toast.success('Profile updated')
  }

  const changePassword = async (_oldPassword, newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    toast.success('Password changed')
  }

  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    toast.success('Password reset link sent to your email!')
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, register, logout,
      updateProfile, changePassword, forgotPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

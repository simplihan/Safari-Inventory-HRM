import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => listener?.unsubscribe()
  }, [])

const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, unique_number, user_id, full_name, gender, role, avatar_url')  // ✅ includes user_id
    .eq('id', userId)  // ✅ use UUID
    .single()
  if (error) console.error(error)
  else setProfile(data)
}

  const login = async (uniqueNumber, password) => {
    // Custom login flow – we store unique_number in email field (or use raw SQL)
    // For simplicity, we assume user's email = unique_number + '@safari.local'
    const email = `${uniqueNumber}@safari.local`
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const register = async (uniqueNumber, fullName, gender, password, role, customUserId, profileImage) => {
  const email = `${uniqueNumber}@safari.local`
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, gender, unique_number: uniqueNumber }
    }
  })
  if (authError) throw authError

  const userId = authData.user.id  // ✅ this is the UUID from auth.users

  const finalDisplayUserId = customUserId || uniqueNumber

  // Insert into profiles table using the UUID as 'id'
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,                     // ✅ UUID
    unique_number: uniqueNumber,
    user_id: finalDisplayUserId,    // ✅ display text ID
    full_name: fullName,
    gender,
    role,
    avatar_url: profileImage || null,
  })
  if (profileError) throw profileError

  return authData
}

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (error) throw error
    setProfile(prev => ({ ...prev, ...updates }))
    toast.success('Profile updated')
  }

  const changePassword = async (oldPassword, newPassword) => {
    // Supabase requires re-authentication for password change
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    toast.success('Password changed')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id) // ✅ FIX: removed broken markdown artifact
      }
      setLoading(false)
    })

    // ✅ FIX: Supabase v2 returns { data: { subscription } }, not { data: listener }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe() // ✅ FIX: was listener?.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, unique_number, user_id, full_name, gender, role, avatar_url')
      .eq('id', userId)
      .single()
    if (error) console.error(error)
    else setProfile(data)
  }

  const login = async (uniqueNumber, password) => {
    // ✅ FIX: was @gmail.com — must match the @safari.local used in register
    const email = `${uniqueNumber}@safari.local`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const register = async (uniqueNumber, fullName, gender, password, role, customUserId, profileImage) => {
    const email = `${uniqueNumber}@safari.local`
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          gender: gender,
          unique_number: uniqueNumber,
          user_id: customUserId || uniqueNumber,
          avatar_url: profileImage || null
        }
      }
    })
    if (authError) throw authError
    return authData
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id) // ✅ FIX: removed markdown artifact
    if (error) throw error
    setProfile(prev => ({ ...prev, ...updates }))
    toast.success('Profile updated')
  }

  const changePassword = async (oldPassword, newPassword) => {
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

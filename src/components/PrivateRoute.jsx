import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (allowedRoles.length && !allowedRoles.includes(profile?.role)) return <Navigate to="/dashboard" />
  return children
}

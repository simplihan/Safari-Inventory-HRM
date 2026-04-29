import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './components/Dashboard'
import TimeTracker from './components/TimeTracker'
import Tasks from './components/Tasks'
import AdminPanel from './components/AdminPanel'
import Profile from './components/Profile'
import Login from './components/Login'
import Register from './components/Register'

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="time" element={<TimeTracker />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="admin" element={<PrivateRoute allowedRoles={['Admin']}><AdminPanel /></PrivateRoute>} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    uniqueNumber: '',
    customUserId: '',
    gender: 'Male',
    password: '',
    confirmPassword: '',
    role: 'User',
    profileImage: null
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (formData.password.length < 4) {
      toast.error('Password must be at least 4 characters')
      return
    }
    setLoading(true)
    try {
      await register(
        formData.uniqueNumber,
        formData.fullName,
        formData.gender,
        formData.password,
        formData.role,
        formData.customUserId || null,
        null // profile image (simplified)
      )
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        
        <input name="fullName" placeholder="Full Name" required onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        <input name="uniqueNumber" placeholder="Unique Number (used for login)" required onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        <input name="customUserId" placeholder="Custom User ID (optional)" onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        
        <select name="gender" onChange={handleChange} className="w-full p-2 border rounded mb-2">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" required onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        
        <select name="role" onChange={handleChange} className="w-full p-2 border rounded mb-4">
          <option value="User">User</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
        
        <button type="submit" disabled={loading} className="w-full bg-cyan-600 text-white p-2 rounded">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-cyan-600">Login</Link></p>
      </form>
    </div>
  )
}

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
        null // profile image (optional)
      )
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
        />
        
        <input
          type="text"
          name="uniqueNumber"
          placeholder="Unique Number (used for login)"
          value={formData.uniqueNumber}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
        />
        
        <input
          type="text"
          name="customUserId"
          placeholder="Custom User ID (optional)"
          value={formData.customUserId}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
        />
        
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
        />
        
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
        />
        
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700"
        >
          <option value="User">User</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 text-white p-2 rounded hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-cyan-600">Login</Link>
        </p>
      </form>
    </div>
  )
}

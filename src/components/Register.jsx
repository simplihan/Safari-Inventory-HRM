import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [uniqueNumber, setUniqueNumber] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(uniqueNumber, password)
      toast.success('Logged in')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Safari HRM Login</h1>
        <input type="text" placeholder="Unique Number" value={uniqueNumber} onChange={e => setUniqueNumber(e.target.value)} className="w-full p-2 border rounded mb-2" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded mb-4" required />
        <button type="submit" className="w-full bg-cyan-600 text-white p-2 rounded">Login</button>
        <p className="mt-4 text-center"><Link to="/register" className="text-cyan-600">Register</Link></p>
      </form>
    </div>
  )
}

import { useRef, useState, useEffect, memo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Label = ({ children }) => (
  <label style={{
    color: '#9CA3AF', fontSize: 11, fontWeight: 600, display: 'block',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em',
  }}>{children}</label>
)

const ROLES = ['Staff', 'Manager', 'Admin']
const GENDERS = ['Male', 'Female', 'Other']

export default memo(function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // All form values live only in refs
  const refs = {
    uniqueNumber: useRef(),
    customUserId: useRef(),
    fullName: useRef(),
    email: useRef(),
    gender: useRef(),
    role: useRef(),
    password: useRef(),
    confirmPassword: useRef(),
  }

  // Submit handler – validates once at the end
  const handleSubmit = async (e) => {
    e.preventDefault()

    const get = (field) => refs[field]?.current?.value || ''
    const data = {
      uniqueNumber: get('uniqueNumber'),
      fullName: get('fullName'),
      email: get('email'),
      password: get('password'),
      confirmPassword: get('confirmPassword'),
      gender: get('gender') || 'Male',
      role: get('role') || 'Staff',
      customUserId: get('customUserId'),
    }

    // One-time validation
    if (!data.uniqueNumber) return toast.error('Unique number required')
    if (!data.fullName) return toast.error('Full name required')
    if (!data.email.includes('@')) return toast.error('Valid email required')
    if (data.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (data.password !== data.confirmPassword) return toast.error('Passwords do not match')

    setIsLoading(true)
    try {
      await register({
        ...data,
        customUserId: data.customUserId || data.uniqueNumber,
      })
      toast.success('Account created! Please verify your email.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Styles (static, no re‑creation)
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '11px 14px',
    color: '#FFFFFF',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  }

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    background: '#1F2937',
    color: '#F9FAFB',
    cursor: 'pointer',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 65% 25%, #1a2744 0%, #080e1c 55%, #0d1a10 100%)',
      padding: '32px 20px',
    }}>
      <div style={{
        background: 'rgba(13, 19, 33, 0.88)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20,
        padding: '40px 36px', width: '100%', maxWidth: 480,
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Row: Unique Number + User ID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Unique Number *</Label>
              <input type="text" ref={refs.uniqueNumber} style={inputStyle} />
            </div>
            <div>
              <Label>User ID (optional)</Label>
              <input type="text" ref={refs.customUserId} style={inputStyle} />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label>Full Name *</Label>
            <input type="text" ref={refs.fullName} style={inputStyle} />
          </div>

          {/* Email */}
          <div>
            <Label>Email Address *</Label>
            <input type="email" ref={refs.email} style={inputStyle} />
          </div>

          {/* Gender + Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Gender *</Label>
              <select ref={refs.gender} style={selectStyle} defaultValue="Male">
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <Label>Role *</Label>
              <select ref={refs.role} style={selectStyle} defaultValue="Staff">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Password + Confirm */}
          <div>
            <Label>Password *</Label>
            <input type="password" ref={refs.password} style={inputStyle} />
          </div>
          <div>
            <Label>Confirm Password *</Label>
            <input type="password" ref={refs.confirmPassword} style={inputStyle} />
          </div>

          <button type="submit" disabled={isLoading} style={{
            background: isLoading ? 'rgba(245,158,11,0.35)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: isLoading ? 'rgba(0,0,0,0.4)' : '#000',
            fontWeight: 700, padding: '13px', borderRadius: 10, border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: 6,
          }}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#4B5563' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#F59E0B', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
})

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLES = ['Staff', 'Manager', 'Admin']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    uniqueNumber: '',
    fullName:     '',
    email:        '',
    password:     '',
    confirmPassword: '',
    gender:       'Male',
    role:         'Staff',
    customUserId: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [focused, setFocused]     = useState(null)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    try {
      await register({
        uniqueNumber: form.uniqueNumber,
        fullName:     form.fullName,
        gender:       form.gender,
        password:     form.password,
        role:         form.role,
        email:        form.email,
        customUserId: form.customUserId || form.uniqueNumber,
      })
      toast.success('Account created! Please check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = (field) => ({
    background:  'rgba(255,255,255,0.05)',
    border:      `1px solid ${focused === field ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    padding:     '11px 14px',
    color:       '#FFFFFF',
    fontSize:    14,
    outline:     'none',
    width:       '100%',
    boxSizing:   'border-box',
    transition:  'border-color .2s',
    fontFamily:  "'DM Sans', sans-serif",
  })

  const selectStyle = (field) => ({
    ...inputStyle(field),
    appearance:     'none',
    WebkitAppearance: 'none',
    cursor:         'pointer',
  })

  const Label = ({ children }) => (
    <label style={{
      color: '#9CA3AF', fontSize: 11, fontWeight: 600, display: 'block',
      marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em',
    }}>
      {children}
    </label>
  )

  const Field = ({ id, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{children}</div>
  )

  return (
    <div style={{
      minHeight:       '100vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      background:      'radial-gradient(ellipse at 65% 25%, #1a2744 0%, #080e1c 55%, #0d1a10 100%)',
      fontFamily:      "'DM Sans', sans-serif",
      padding:         '32px 20px',
    }}>

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '10%', left: '8%', width: 320, height: 320,
                    background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '6%', width: 260, height: 260,
                    background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{
        background:       'rgba(13, 19, 33, 0.88)',
        backdropFilter:   'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border:           '1px solid rgba(255,255,255,0.07)',
        borderRadius:     20,
        padding:          '40px 36px',
        width:            '100%',
        maxWidth:         480,
        boxShadow:        '0 30px 70px rgba(0,0,0,0.6)',
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 24,
          }}>🦁</div>
          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700,
            color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em',
          }}>Create Account</h1>
          <p style={{ color: '#4B5563', fontSize: 13, marginTop: 5 }}>
            Safari Inventory HRM
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Row: Unique Number + Custom User ID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field id="uniqueNumber">
              <Label>Unique Number *</Label>
              <input type="text" placeholder="e.g. SHR-001"
                value={form.uniqueNumber} onChange={set('uniqueNumber')}
                onFocus={() => setFocused('uniqueNumber')} onBlur={() => setFocused(null)}
                style={inputStyle('uniqueNumber')} required />
            </Field>
            <Field id="customUserId">
              <Label>User ID (optional)</Label>
              <input type="text" placeholder="Leave blank to auto-fill"
                value={form.customUserId} onChange={set('customUserId')}
                onFocus={() => setFocused('customUserId')} onBlur={() => setFocused(null)}
                style={inputStyle('customUserId')} />
            </Field>
          </div>

          {/* Full Name */}
          <Field id="fullName">
            <Label>Full Name *</Label>
            <input type="text" placeholder="Your full name"
              value={form.fullName} onChange={set('fullName')}
              onFocus={() => setFocused('fullName')} onBlur={() => setFocused(null)}
              style={inputStyle('fullName')} required />
          </Field>

          {/* Email — for verification & password reset */}
          <Field id="email">
            <Label>Email Address *</Label>
            <input type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')}
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              style={inputStyle('email')} required />
            <p style={{ color: '#4B5563', fontSize: 11, marginTop: 4 }}>
              Used for account verification and password reset only.
            </p>
          </Field>

          {/* Row: Gender + Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field id="gender">
              <Label>Gender *</Label>
              <div style={{ position: 'relative' }}>
                <select value={form.gender} onChange={set('gender')}
                  onFocus={() => setFocused('gender')} onBlur={() => setFocused(null)}
                  style={selectStyle('gender')} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                               color: '#6B7280', pointerEvents: 'none', fontSize: 10 }}>▾</span>
              </div>
            </Field>
            <Field id="role">
              <Label>Role *</Label>
              <div style={{ position: 'relative' }}>
                <select value={form.role} onChange={set('role')}
                  onFocus={() => setFocused('role')} onBlur={() => setFocused(null)}
                  style={selectStyle('role')} required>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                               color: '#6B7280', pointerEvents: 'none', fontSize: 10 }}>▾</span>
              </div>
            </Field>
          </div>

          {/* Password */}
          <Field id="password">
            <Label>Password *</Label>
            <input type="password" placeholder="At least 6 characters"
              value={form.password} onChange={set('password')}
              onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
              style={inputStyle('password')} required minLength={6} />
          </Field>

          {/* Confirm Password */}
          <Field id="confirmPassword">
            <Label>Confirm Password *</Label>
            <input type="password" placeholder="Repeat your password"
              value={form.confirmPassword} onChange={set('confirmPassword')}
              onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused(null)}
              style={{
                ...inputStyle('confirmPassword'),
                borderColor: form.confirmPassword && form.confirmPassword !== form.password
                  ? 'rgba(239,68,68,0.5)'
                  : focused === 'confirmPassword'
                  ? 'rgba(245,158,11,0.5)'
                  : 'rgba(255,255,255,0.08)',
              }}
              required />
            {form.confirmPassword && form.confirmPassword !== form.password && (
              <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>Passwords do not match</p>
            )}
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background:   isLoading ? 'rgba(245,158,11,0.35)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
              color:        isLoading ? 'rgba(0,0,0,0.4)' : '#000',
              fontWeight:   700,
              fontSize:     15,
              padding:      '13px',
              borderRadius: 10,
              border:       'none',
              cursor:       isLoading ? 'not-allowed' : 'pointer',
              marginTop:    6,
              width:        '100%',
              fontFamily:   "'Sora', sans-serif",
              letterSpacing: '-0.01em',
              transition:   'all .2s',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              gap:          8,
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000',
                  borderRadius: '50%', display: 'inline-block',
                  animation: 'spin .7s linear infinite',
                }} />
                Creating account…
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#4B5563', fontSize: 13 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

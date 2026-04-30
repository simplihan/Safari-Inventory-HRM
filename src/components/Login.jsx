import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [tab, setTab]               = useState('login')   // 'login' | 'forgot'
  const [uniqueNumber, setUniqueNumber] = useState('')
  const [password, setPassword]     = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const [focused, setFocused]       = useState(null)
  const { login, forgotPassword }   = useAuth()

  async function handleLogin(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(uniqueNumber, password)
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await forgotPassword(forgotEmail)
      setForgotEmail('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = (field) => ({
    background:   'rgba(255,255,255,0.05)',
    border:       `1px solid ${focused === field ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    padding:      '12px 16px',
    color:        '#FFFFFF',
    fontSize:     14,
    outline:      'none',
    width:        '100%',
    boxSizing:    'border-box',
    transition:   'border-color .2s',
    fontFamily:   "'DM Sans', sans-serif",
  })

  const Label = ({ children }) => (
    <label style={{
      color: '#9CA3AF', fontSize: 11, fontWeight: 600, display: 'block',
      marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em',
    }}>{children}</label>
  )

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'radial-gradient(ellipse at 65% 25%, #1a2744 0%, #080e1c 55%, #0d1a10 100%)',
      fontFamily:     "'DM Sans', sans-serif",
      padding:        20,
    }}>

      <div style={{ position: 'fixed', top: '15%', left: '10%', width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '8%', width: 250, height: 250,
                    background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{
        background:           'rgba(13, 19, 33, 0.88)',
        backdropFilter:       'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border:               '1px solid rgba(255,255,255,0.07)',
        borderRadius:         20,
        padding:              '44px 40px',
        width:                '100%',
        maxWidth:             420,
        boxShadow:            '0 30px 70px rgba(0,0,0,0.6)',
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 26,
          }}>🦁</div>
          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700,
            color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em',
          }}>Safari HRM</h1>
          <p style={{ color: '#4B5563', fontSize: 13, marginTop: 5 }}>
            Inventory & Human Resource Management
          </p>
        </div>

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Label>Unique Number</Label>
              <input type="text" placeholder="e.g. SHR-001"
                value={uniqueNumber} onChange={e => setUniqueNumber(e.target.value)}
                onFocus={() => setFocused('id')} onBlur={() => setFocused(null)}
                style={inputStyle('id')} required />
            </div>
            <div>
              <Label>Password</Label>
              <input type="password" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
                style={inputStyle('pw')} required />
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button type="button" onClick={() => setTab('forgot')}
                style={{ background: 'none', border: 'none', color: '#F59E0B', fontSize: 12,
                         cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={isLoading} style={{
              background:    isLoading ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
              color:         isLoading ? 'rgba(0,0,0,0.5)' : '#000',
              fontWeight:    700, fontSize: 15, padding: '13px',
              borderRadius:  10, border: 'none',
              cursor:        isLoading ? 'not-allowed' : 'pointer',
              width:         '100%', fontFamily: "'Sora', sans-serif",
              letterSpacing: '-0.01em', transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {isLoading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)',
                                 borderTopColor: '#000', borderRadius: '50%',
                                 animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── FORGOT PASSWORD FORM ── */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)',
                          borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ color: '#D97706', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Enter the email address you used when registering. We'll send you a reset link.
              </p>
            </div>
            <div>
              <Label>Email Address</Label>
              <input type="email" placeholder="you@example.com"
                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                onFocus={() => setFocused('fe')} onBlur={() => setFocused(null)}
                style={inputStyle('fe')} required />
            </div>
            <button type="submit" disabled={isLoading} style={{
              background:    isLoading ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
              color:         isLoading ? 'rgba(0,0,0,0.5)' : '#000',
              fontWeight:    700, fontSize: 15, padding: '13px',
              borderRadius:  10, border: 'none',
              cursor:        isLoading ? 'not-allowed' : 'pointer',
              width:         '100%', fontFamily: "'Sora', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {isLoading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)',
                                 borderTopColor: '#000', borderRadius: '50%',
                                 animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Sending…
                </>
              ) : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => setTab('login')}
              style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13,
                       cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
              ← Back to sign in
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, color: '#4B5563', fontSize: 13 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

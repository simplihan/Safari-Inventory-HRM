import { useState, useRef, useCallback, memo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ---------- Static helpers (no re‑creation) ----------
const Label = ({ children }) => (
  <label style={{
    color: '#9CA3AF', fontSize: 11, fontWeight: 600, display: 'block',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em',
  }}>{children}</label>
)

const ROLES   = ['Staff', 'Manager', 'Admin']
const GENDERS = ['Male', 'Female', 'Other']

// ---------- Memoised Input for stability ----------
const MemoInput = memo(({ label, type, name, placeholder, required, refObj, onBlur, error }) => (
  <div>
    <Label>{label} {required && '*'}</Label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      ref={refObj}
      onBlur={onBlur}
      defaultValue=""  // uncontrolled – no re‑render on keystroke
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10,
        padding: '11px 14px',
        color: '#FFFFFF',
        fontSize: 14,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color .2s',
        fontFamily: "'DM Sans', sans-serif",
      }}
    />
    {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
  </div>
))

// ---------- Memoised Select (uncontrolled + visible) ----------
const MemoSelect = memo(({ label, name, options, refObj, onBlur }) => (
  <div>
    <Label>{label} *</Label>
    <div style={{ position: 'relative' }}>
      <select
        name={name}
        ref={refObj}
        defaultValue={options[0]}
        onBlur={onBlur}
        style={{
          background: '#1F2937',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '11px 14px',
          color: '#F9FAFB',          // light text on dark bg
          fontSize: 14,
          outline: 'none',
          width: '100%',
          appearance: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt} style={{ background: '#1F2937', color: '#F9FAFB' }}>
            {opt}
          </option>
        ))}
      </select>
      <span style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        color: '#9CA3AF', pointerEvents: 'none', fontSize: 12
      }}>▾</span>
    </div>
  </div>
))

// ---------- Main Component (memoised) ----------
const Register = memo(function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // Refs for all form fields (uncontrolled)
  const uniqueNumberRef = useRef()
  const customUserIdRef = useRef()
  const fullNameRef = useRef()
  const emailRef = useRef()
  const genderRef = useRef()
  const roleRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()

  // Validation errors (only update state when needed, not on every keystroke)
  const [errors, setErrors] = useState({})

  const validateField = useCallback((fieldName, value) => {
    switch (fieldName) {
      case 'password':
        return value && value.length < 6 ? 'Password must be at least 6 characters' : ''
      case 'confirmPassword':
        if (value && value !== passwordRef.current?.value) return 'Passwords do not match'
        return ''
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) return 'Invalid email address'
        return ''
      default:
        return ''
    }
  }, [])

  const handleBlur = useCallback((fieldName, refObj) => () => {
    const value = refObj.current?.value || ''
    const error = validateField(fieldName, value)
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [validateField])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Gather all values from refs
    const formValues = {
      uniqueNumber: uniqueNumberRef.current?.value || '',
      fullName: fullNameRef.current?.value || '',
      email: emailRef.current?.value || '',
      password: passwordRef.current?.value || '',
      confirmPassword: confirmPasswordRef.current?.value || '',
      gender: genderRef.current?.value || 'Male',
      role: roleRef.current?.value || 'Staff',
      customUserId: customUserIdRef.current?.value || '',
    }

    // Full validation on submit
    const newErrors = {
      uniqueNumber: formValues.uniqueNumber ? '' : 'Unique number is required',
      fullName: formValues.fullName ? '' : 'Full name is required',
      email: validateField('email', formValues.email),
      password: validateField('password', formValues.password),
      confirmPassword: validateField('confirmPassword', formValues.confirmPassword),
    }
    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors)
      toast.error('Please correct the errors before submitting')
      return
    }

    setIsLoading(true)
    try {
      await register({
        uniqueNumber: formValues.uniqueNumber,
        fullName: formValues.fullName,
        gender: formValues.gender,
        password: formValues.password,
        role: formValues.role,
        email: formValues.email,
        customUserId: formValues.customUserId || formValues.uniqueNumber,
      })
      toast.success('Account created! Check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 65% 25%, #1a2744 0%, #080e1c 55%, #0d1a10 100%)',
      fontFamily: "'DM Sans', sans-serif", padding: '32px 20px',
    }}>
      {/* decorative blobs (unchanged) */}
      <div style={{ position:'fixed', top:'10%', left:'8%', width:320, height:320,
                    background:'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
                    borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'15%', right:'6%', width:260, height:260,
                    background:'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
                    borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{
        background: 'rgba(13, 19, 33, 0.88)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 480,
        boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width:56, height:56, borderRadius:14, margin:'0 auto 14px', fontSize:26,
            background:'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
            border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'center',
          }}>🦁</div>
          <h1 style={{ fontFamily:"'Sora', sans-serif", fontSize:22, fontWeight:700,
                       color:'#FFFFFF', margin:0, letterSpacing:'-0.03em' }}>Create Account</h1>
          <p style={{ color:'#4B5563', fontSize:13, marginTop:5 }}>Safari Inventory HRM</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Row: Unique Number + User ID */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <MemoInput
              label="Unique Number" type="text" name="uniqueNumber"
              placeholder="e.g. SHR-001" required
              refObj={uniqueNumberRef}
              onBlur={handleBlur('uniqueNumber', uniqueNumberRef)}
              error={errors.uniqueNumber}
            />
            <MemoInput
              label="User ID (optional)" type="text" name="customUserId"
              placeholder="Auto-fills if blank"
              refObj={customUserIdRef}
              onBlur={handleBlur('customUserId', customUserIdRef)}
              error={errors.customUserId}
            />
          </div>

          {/* Full Name */}
          <MemoInput
            label="Full Name" type="text" name="fullName"
            placeholder="Your full name" required
            refObj={fullNameRef}
            onBlur={handleBlur('fullName', fullNameRef)}
            error={errors.fullName}
          />

          {/* Email */}
          <MemoInput
            label="Email Address" type="email" name="email"
            placeholder="you@example.com" required
            refObj={emailRef}
            onBlur={handleBlur('email', emailRef)}
            error={errors.email}
          />
          <p style={{ color:'#4B5563', fontSize:11, marginTop:-8 }}>
            Used for verification and password reset only.
          </p>

          {/* Gender + Role (Dropdowns) */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <MemoSelect label="Gender" name="gender" options={GENDERS} refObj={genderRef} />
            <MemoSelect label="Role" name="role" options={ROLES} refObj={roleRef} />
          </div>

          {/* Password */}
          <MemoInput
            label="Password" type="password" name="password"
            placeholder="At least 6 characters" required
            refObj={passwordRef}
            onBlur={handleBlur('password', passwordRef)}
            error={errors.password}
          />

          {/* Confirm Password */}
          <MemoInput
            label="Confirm Password" type="password" name="confirmPassword"
            placeholder="Repeat your password" required
            refObj={confirmPasswordRef}
            onBlur={handleBlur('confirmPassword', confirmPasswordRef)}
            error={errors.confirmPassword}
          />

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} style={{
            background: isLoading ? 'rgba(245,158,11,0.35)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: isLoading ? 'rgba(0,0,0,0.4)' : '#000',
            fontWeight: 700, fontSize: 15, padding: '13px',
            borderRadius: 10, border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: 6, width: '100%',
            fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {isLoading ? (
              <>
                <span style={{ width:14, height:14, border:'2px solid rgba(0,0,0,0.3)',
                               borderTopColor:'#000', borderRadius:'50%', display:'inline-block',
                               animation:'spin .7s linear infinite' }} />
                Creating account…
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, color:'#4B5563', fontSize:13 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#F59E0B', textDecoration:'none', fontWeight:600 }}>
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        /* Force all select options to have high contrast */
        select, select option {
          background-color: #1F2937 !important;
          color: #F9FAFB !important;
        }
      `}</style>
    </div>
  )
})

export default Register

import { useRef, useState, memo, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// Neon Label Component
const NeonLabel = ({ children }) => (
  <label style={{
    color: '#0ff',
    fontSize: 11,
    fontWeight: 600,
    display: 'block',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    textShadow: '0 0 5px #0ff, 0 0 10px #0ff',
    fontFamily: "'Orbitron', 'DM Sans', monospace",
  }}>{children}</label>
)

const ROLES = ['Staff', 'Manager', 'Admin']
const GENDERS = ['Male', 'Female', 'Other']

export default memo(function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

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
      toast.success('Account created! Verify your email.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Dynamic particle background effect
  useEffect(() => {
    const canvas = document.getElementById('neon-bg')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 1.5
        this.speedY = (Math.random() - 0.5) * 1.5
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 60%)` // cyan/blue/neon green
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.shadowBlur = 10
        ctx.shadowColor = this.color
        ctx.fill()
      }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle())

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.shadowBlur = 0
      particles.forEach(p => {
        p.update()
        p.draw()
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const neonInputStyle = (hasError = false) => ({
    background: 'rgba(0, 0, 0, 0.7)',
    border: hasError ? '1px solid #f0f' : '1px solid rgba(0, 255, 255, 0.5)',
    borderRadius: 8,
    padding: '12px 14px',
    color: '#0ff',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Share Tech Mono', 'DM Sans', monospace",
    transition: 'all 0.2s ease',
    boxShadow: hasError ? '0 0 10px #f0f' : '0 0 5px rgba(0, 255, 255, 0.3)',
  })

  const neonSelectStyle = {
    ...neonInputStyle(),
    appearance: 'none',
    background: '#0a0f1a',
    color: '#0ff',
    cursor: 'pointer',
  }

  return (
    <>
      {/* Canvas for particles */}
      <canvas id="neon-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '32px 20px',
        fontFamily: "'Orbitron', 'DM Sans', sans-serif",
      }}>
        {/* Neon card with animated border glow */}
        <div style={{
          background: 'rgba(5, 10, 20, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: 24,
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.05)',
          padding: '40px 36px',
          width: '100%',
          maxWidth: 500,
          transition: 'box-shadow 0.3s ease',
          animation: 'pulseGlow 3s infinite alternate',
        }}>
          <style>{`
            @keyframes pulseGlow {
              0% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.3), 0 0 20px rgba(0, 255, 255, 0.2); border-color: rgba(0, 255, 255, 0.3); }
              100% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.7), 0 0 60px rgba(0, 255, 255, 0.5); border-color: rgba(0, 255, 255, 0.8); }
            }
            @keyframes textPulse {
              0% { text-shadow: 0 0 2px #0ff, 0 0 5px #0ff; }
              100% { text-shadow: 0 0 8px #0ff, 0 0 15px #0ff; }
            }
            input:focus, select:focus {
              border-color: #f0f !important;
              box-shadow: 0 0 15px #f0f !important;
              color: #fff !important;
            }
            button:hover {
              transform: scale(1.02);
              filter: brightness(1.1);
            }
          `}</style>

          {/* Brand with neon flicker */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 14px', fontSize: 32,
              background: 'linear-gradient(135deg, #0ff, #f0f)',
              boxShadow: '0 0 20px #0ff, 0 0 40px #f0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulseGlow 1.5s infinite alternate',
            }}>⚡</div>
            <h1 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 28,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0ff, #f0f)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              letterSpacing: '-0.02em',
              textShadow: '0 0 10px rgba(0,255,255,0.5)',
            }}>NEON REGISTER</h1>
            <p style={{ color: '#0ff', fontSize: 12, marginTop: 5, textShadow: '0 0 5px #0ff' }}>⚡ ELECTRO SYSTEM v2.0 ⚡</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Row Unique + User ID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <NeonLabel>⚡ UNIQUE NUMBER *</NeonLabel>
                <input type="text" ref={refs.uniqueNumber} style={neonInputStyle()} placeholder="e.g. SHR-001" />
              </div>
              <div>
                <NeonLabel>🔮 USER ID (optional)</NeonLabel>
                <input type="text" ref={refs.customUserId} style={neonInputStyle()} placeholder="Auto fills" />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <NeonLabel>👤 FULL NAME *</NeonLabel>
              <input type="text" ref={refs.fullName} style={neonInputStyle()} placeholder="Your neon identity" />
            </div>

            {/* Email */}
            <div>
              <NeonLabel>📧 EMAIL *</NeonLabel>
              <input type="email" ref={refs.email} style={neonInputStyle()} placeholder="cyber@neon.com" />
            </div>

            {/* Gender + Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <NeonLabel>⚥ GENDER *</NeonLabel>
                <select ref={refs.gender} style={neonSelectStyle} defaultValue="Male">
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <NeonLabel>🎭 ROLE *</NeonLabel>
                <select ref={refs.role} style={neonSelectStyle} defaultValue="Staff">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <NeonLabel>🔒 PASSWORD *</NeonLabel>
              <input type="password" ref={refs.password} style={neonInputStyle()} placeholder="•••••• (min 6 chars)" />
            </div>

            <div>
              <NeonLabel>🔁 CONFIRM PASSWORD *</NeonLabel>
              <input type="password" ref={refs.confirmPassword} style={neonInputStyle()} placeholder="repeat password" />
            </div>

            <button type="submit" disabled={isLoading} style={{
              background: 'linear-gradient(135deg, #0ff, #f0f)',
              color: '#000',
              fontWeight: 800,
              fontSize: 16,
              padding: '14px',
              borderRadius: 40,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: 8,
              fontFamily: "'Orbitron', monospace",
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              boxShadow: '0 0 15px #0ff, 0 0 30px #f0f',
              opacity: isLoading ? 0.6 : 1,
            }}>
              {isLoading ? '⚡ CHARGING... ⚡' : '⚡ ACTIVATE ACCOUNT ⚡'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#0ff', fontSize: 12, textShadow: '0 0 4px #0ff' }}>
            Already have a cipher?{' '}
            <Link to="/login" style={{ color: '#f0f', textDecoration: 'none', fontWeight: 'bold', textShadow: '0 0 5px #f0f' }}>
              LOGIN →
            </Link>
          </p>
        </div>
      </div>
    </>
  )
})

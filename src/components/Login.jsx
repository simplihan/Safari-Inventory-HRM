import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;
    if (!email || !password) return toast.error('Email and password required');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- ONLY DESIGN CHANGES BELOW ----------
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 30%, #1a1a2e, #16213e)',
      fontFamily: "'Poppins', sans-serif",
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{
          fontSize: '32px',
 fontWeight: '700',
          background: 'linear-gradient(135deg, #e0eafc, #cfdef3)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          textAlign: 'center',
          marginBottom: '8px'
        }}>Welcome Back</h2>
        <p style={{ color: '#a0aec0', textAlign: 'center', marginBottom: '32px' }}>Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e0', fontSize: '14px' }}>Email Address</label>
            <input
              ref={emailRef}
              type="email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #2d3748',
                background: '#1a202c',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: '0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#2d3748'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e0', fontSize: '14px' }}>Password</label>
            <input
              ref={passwordRef}
              type="password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #2d3748',
                background: '#1a202c',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#2d3748'}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '28px' }}>
            <Link to="/forgot-password" style={{ color: '#63b3ed', textDecoration: 'none', fontSize: '13px' }}>Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '40px',
              border: 'none',
              background: 'linear-gradient(135deg, #4299e1, #3182ce)',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: '0.2s'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '28px', color: '#a0aec0', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#63b3ed', textDecoration: 'none', fontWeight: '500' }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}

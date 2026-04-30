import React, { useRef, useState } from 'react';   // ← ADD THIS
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Label = ({ children }) => (
  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#1e293b' }}>
    {children}
  </label>
);

const Input = React.forwardRef(({ label, type = 'text', placeholder, required, ...props }, ref) => (
  <div style={{ marginBottom: 20 }}>
    {label && <Label>{label} {required && '*'}</Label>}
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: 12,
        border: '1px solid #cbd5e1', fontSize: 14,
        outline: 'none', boxSizing: 'border-box'
      }}
      onFocus={(e) => e.target.style.borderColor = '#6366f1'}
      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
      {...props}
    />
  </div>
));

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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9eef5 100%)', padding: '24px'
    }}>
      <div style={{
        maxWidth: 440, width: '100%', background: 'white', borderRadius: 32,
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1)', padding: '40px 32px'
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#0f172a', textAlign: 'center' }}>Login Account</h2>
        <form onSubmit={handleSubmit}>
          <Input ref={emailRef} label="Email Address" type="email" placeholder="hello@example.com" required />
          <Input ref={passwordRef} label="Password" type="password" placeholder="••••••••" required />
          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none' }}>Forgot Password?</Link>
          </div>
          <button type="submit" disabled={isLoading} style={{
            width: '100%', padding: '14px', borderRadius: 40, border: 'none',
            background: '#6366f1', color: 'white', fontWeight: 600, fontSize: 15,
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1
          }}>
            {isLoading ? 'Logging in...' : 'Login Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#475569' }}>
          Don't Have an Account?{' '}
          <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}

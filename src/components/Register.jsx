import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ---------- Helper Components ----------
const StepIndicator = ({ current, total, labels }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ textAlign: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: i <= current ? '#6366f1' : '#e2e8f0',
          color: i <= current ? 'white' : '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', transition: '0.2s'
        }}>{i + 1}</div>
        <div style={{ fontSize: 10, marginTop: 4, color: '#475569' }}>{labels[i]}</div>
      </div>
    ))}
  </div>
);

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
        outline: 'none', transition: '0.2s', boxSizing: 'border-box'
      }}
      onFocus={(e) => e.target.style.borderColor = '#6366f1'}
      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
      {...props}
    />
  </div>
));

// ---------- Main Component ----------
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('email');

  // Refs for all inputs (uncontrolled = no re‑render on type)
  const fullNameRef = useRef();
  const emailRef = useRef();
  const dayRef = useRef();
  const monthRef = useRef();
  const yearRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const verifyContactRef = useRef();

  // Birthday helpers
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Step validation
  const validateStep = () => {
    if (step === 0) {
      const fullName = fullNameRef.current?.value.trim();
      const email = emailRef.current?.value.trim();
      if (!fullName) { toast.error('Full name required'); return false; }
      if (!email || !email.includes('@')) { toast.error('Valid email required'); return false; }
      return true;
    }
    if (step === 1) {
      const username = usernameRef.current?.value.trim();
      const password = passwordRef.current?.value;
      if (!username) { toast.error('Username required'); return false; }
      if (!password || password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      return true;
    }
    if (step === 2) {
      const contact = verifyContactRef.current?.value.trim();
      if (!contact) { toast.error(`${verificationMethod === 'email' ? 'Email' : 'Phone number'} required`); return false; }
      if (verificationMethod === 'email' && !contact.includes('@')) {
        toast.error('Valid email address required');
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  // Final registration after sending code
  const sendCodeAndRegister = async () => {
    if (!validateStep()) return;

    const contactValue = verifyContactRef.current?.value.trim();
    setIsLoading(true);

    // Simulate sending verification code (mock)
    toast.success(`Verification code sent to ${contactValue} (mock)`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Prepare registration data
    const birthday = `${dayRef.current?.value || '1'} ${months[monthRef.current?.value - 1] || 'Jan'} ${yearRef.current?.value || currentYear}`;
    const userData = {
      fullName: fullNameRef.current?.value.trim(),
      email: emailRef.current?.value.trim(),
      username: usernameRef.current?.value.trim(),
      password: passwordRef.current?.value,
      birthday,
      verificationContact: contactValue,
      uniqueNumber: `USR-${Date.now()}`,
      role: 'Staff',               // default role
      gender: 'Other',             // not collected in this form
      customUserId: usernameRef.current?.value.trim(),
    };

    try {
      await register(userData);  // your existing auth function
      toast.success('Account created! Check your email to verify.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9eef5 100%)',
      fontFamily: "'Inter', system-ui, sans-serif", padding: '24px'
    }}>
      <div style={{
        maxWidth: 500, width: '100%', background: 'white', borderRadius: 32,
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1)', padding: '32px 28px'
      }}>
        <StepIndicator current={step} total={3} labels={['Create', 'Security', 'Verify']} />

        {/* Step 0 – Create Account */}
        {step === 0 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Create Account</h2>
            <Input ref={fullNameRef} label="Full Name" placeholder="John Doe" required />
            <Input ref={emailRef} label="Email Address" type="email" placeholder="hello@example.com" required />

            <Label>Birthday</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12, marginBottom: 28 }}>
              <select ref={dayRef} style={selectStyle()} defaultValue="1">
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select ref={monthRef} style={selectStyle()} defaultValue="1">
                {months.map((m, idx) => <option key={m} value={idx+1}>{m}</option>)}
              </select>
              <select ref={yearRef} style={selectStyle()} defaultValue={currentYear}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button onClick={nextStep} style={buttonStyle(true)}>Next →</button>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#475569' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Login to Account</Link>
            </div>
          </>
        )}

        {/* Step 1 – Security */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Security</h2>
            <Input ref={usernameRef} label="Username" placeholder="Username1234" required />
            <Input ref={passwordRef} label="Set Password" type="password" placeholder="At least 6 characters" required />

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={prevStep} style={buttonStyle(false)}>Back</button>
              <button onClick={nextStep} style={buttonStyle(true)}>Next →</button>
            </div>
          </>
        )}

        {/* Step 2 – Verification */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Verification</h2>
            <div style={{ marginBottom: 20 }}>
              <Label>Verify via</Label>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="radio" name="method" value="email" checked={verificationMethod === 'email'}
                         onChange={() => setVerificationMethod('email')} /> Email
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="radio" name="method" value="phone" checked={verificationMethod === 'phone'}
                         onChange={() => setVerificationMethod('phone')} /> Phone
                </label>
              </div>
            </div>

            <Input
              ref={verifyContactRef}
              label={verificationMethod === 'email' ? 'Email Address' : 'Phone Number'}
              type={verificationMethod === 'email' ? 'email' : 'tel'}
              placeholder={verificationMethod === 'email' ? 'you@example.com' : '12345678910'}
              required
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={prevStep} style={buttonStyle(false)}>Back</button>
              <button onClick={sendCodeAndRegister} disabled={isLoading} style={buttonStyle(true)}>
                {isLoading ? 'Sending...' : 'Send Code →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Reusable style for selects
const selectStyle = () => ({
  width: '100%', padding: '12px 10px', borderRadius: 12,
  border: '1px solid #cbd5e1', background: 'white', fontSize: 14,
  outline: 'none', cursor: 'pointer'
});

const buttonStyle = (primary) => ({
  flex: 1, padding: '12px', borderRadius: 40, border: 'none',
  background: primary ? '#6366f1' : '#f1f5f9',
  color: primary ? 'white' : '#334155',
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
  transition: '0.2s', boxShadow: primary ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
});

export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9eef5 100%)'
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: 'white',
        borderRadius: 32,
        padding: '40px 32px',
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 12, border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            style={{ width: '100%', padding: 12, marginBottom: 24, borderRadius: 12, border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{ width: '100%', padding: 14, borderRadius: 40, background: '#6366f1', color: 'white', border: 'none', fontSize: 16 }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

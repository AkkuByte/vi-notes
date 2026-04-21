import { useState } from 'react';
import { loginWithGoogle, loginWithEmail, signupWithEmail } from './firebase';

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      setLoading(false);
    }
  };

  // Modern input aesthetics
  const inputStyle = {
    width: '100%', padding: '16px 20px', marginBottom: '16px', borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    color: 'white', boxSizing: 'border-box' as const, fontSize: '15px',
    outline: 'none', transition: 'border-color 0.2s, background-color 0.2s',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', minHeight: '100vh', width: '100vw',
      backgroundColor: '#0f172a',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(30, 27, 75, 1) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(15, 23, 42, 1) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(17, 24, 39, 1) 0, transparent 50%), radial-gradient(at 50% 100%, rgba(6, 78, 59, 0.4) 0, transparent 60%)',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: 'white',
    }}>
      <div style={{
        padding: '48px 40px', backgroundColor: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.02) inset', 
        textAlign: 'center', width: '100%', maxWidth: '420px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Subtle decorative glow inside card */}
        <div style={{ position: 'absolute', top: -50, left: -50, width: 100, height: 100, background: 'rgba(16, 185, 129, 0.2)', filter: 'blur(40px)', borderRadius: '50%' }}></div>

        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em' }}>Vi-Notes</h1>
        <p style={{ color: '#94a3b8', marginBottom: '36px', fontSize: '15px' }}>Verify your authenticity.</p>
        
        <form onSubmit={handleEmailAuth} style={{ textAlign: 'left', position: 'relative', zIndex: 1 }}>
          <input 
            type="email" 
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '16px', fontSize: '16px', fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white', border: 'none', borderRadius: '14px', 
              cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s',
              boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '20px 0', position: 'relative', zIndex: 1 }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span 
            style={{ color: '#34d399', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }} 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
            onMouseOut={(e) => e.currentTarget.style.color = '#34d399'}
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </span>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{ 
            width: '100%', padding: '16px', fontSize: '15px', fontWeight: 600,
            backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', 
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', 
            cursor: 'pointer', transition: 'all 0.2s', position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        
        {error && <p style={{ color: '#ef4444', marginTop: '20px', fontSize: '14px', position: 'relative', zIndex: 1 }}>{error}</p>}
      </div>
    </div>
  );
}
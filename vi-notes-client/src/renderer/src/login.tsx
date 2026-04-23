import { useState } from 'react';
import { loginWithGoogle, loginWithEmail, signupWithEmail } from './firebase';
import electronLogo from './assets/notes-svgrepo-com_1.svg';
import './login.css';

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

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={electronLogo} alt="Vi-Notes App Logo" className="login-logo" />
        <h1 className="login-title">Vi-Notes</h1>
        <p className="login-subtitle">Verify your authenticity.</p>

        <form onSubmit={handleEmailAuth} className="login-form">
          <input
            type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <input
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button
            type="submit" disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="login-switch-text">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            className="login-switch-link"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </span>
        </p>

        <div className="login-divider-container">
          <div className="login-divider-line"></div>
          <span className="login-divider-text">or</span>
          <div className="login-divider-line"></div>
        </div>

        <button
          onClick={handleGoogleAuth} disabled={loading}
          className="login-google-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
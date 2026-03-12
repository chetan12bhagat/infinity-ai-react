import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onNeedsVerify: (email: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin, onNeedsVerify }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { signUp, googleLogin, githubLogin } = useAuth();

  // Determine current active step based on form completion
  const activeStep = (() => {
    if (!firstName || !lastName || !email || !password || password.length < 8) return 1;
    return 2; // In this UI, we mainly show step 1 as active for the initial form
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password);
      onNeedsVerify(email);
    } catch (err: any) {
      if (err.name === 'UsernameExistsException') {
        onNeedsVerify(email);
        return;
      }
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'GitHub') => {
    setSocialLoading(provider);
    try {
      if (provider === 'Google') await googleLogin();
      else await githubLogin();
    } catch (err: any) {
      setError(err.message || `Failed to start ${provider} login`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <svg width="48" height="30" viewBox="0 0 36 22" fill="none">
              <path d="M18 11C18 11 14 4 9 4C5.13 4 2 7.13 2 11C2 14.87 5.13 18 9 18C14 18 18 11 18 11Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M18 11C18 11 22 4 27 4C30.87 4 34 7.13 34 11C34 14.87 30.87 18 27 18C22 18 18 11 18 11Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <h1 className="auth-left-title">Get Started with Us</h1>
          <p className="auth-left-subtitle">Complete these easy steps to create your account</p>
          
          <div className="auth-steps">
            <div className={`auth-step ${activeStep === 1 ? 'active' : ''}`}>
              <div className="auth-step-circle">1</div>
              <div>Sign up your account</div>
            </div>
            <div className={`auth-step ${activeStep === 2 ? 'active' : ''}`}>
              <div className="auth-step-circle">2</div>
              <div>Set up your workspace</div>
            </div>
            <div className="auth-step">
              <div className="auth-step-circle">3</div>
              <div>Set up your profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-right-content">
          <h2 className="auth-title-large stagger-1">Sign Up Account</h2>
          <p className="auth-subtitle-small stagger-1">Enter your personal data to create your account</p>

          <div className="auth-social-row stagger-2">
            <button className="social-btn" onClick={() => handleSocialLogin('Google')} disabled={!!socialLoading}>
              {socialLoading === 'Google' ? <div className="dot" style={{width: 12, height: 12}} /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#ea4335" d="M12 5.04c1.94 0 3.68.67 5.05 1.97l3.77-3.77C18.54 1.25 15.51 0 12 0 7.29 0 3.25 2.7 1.24 6.7l4.35 3.37c1.02-3.07 3.89-5.03 6.41-5.03z"/>
                    <path fill="#4285f4" d="M23.64 12.2c0-.85-.08-1.68-.22-2.48H12v4.69h6.53c-.28 1.48-1.11 2.74-2.37 3.58l3.7 2.87c2.16-1.99 3.41-4.93 3.41-8.66z"/>
                    <path fill="#34a853" d="M5.59 14.71c-.26-.77-.4-1.6-.4-2.46s.14-1.69.4-2.46L1.24 6.45C.45 8.11 0 9.99 0 12s.45 3.89 1.24 5.55l4.35-3.37z"/>
                    <path fill="#fbbc05" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.7-2.87c-1.04.7-2.38 1.11-3.7 1.11-3.06 0-5.65-2.07-6.57-4.86l-4.35 3.37C3.25 21.3 7.29 24 12 24z"/>
                  </svg>
                  Google
                </>
              )}
            </button>
            <button className="social-btn" onClick={() => handleSocialLogin('GitHub')} disabled={!!socialLoading}>
              {socialLoading === 'GitHub' ? <div className="dot" style={{width: 12, height: 12}} /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Github
                </>
              )}
            </button>
          </div>

          <div className="auth-divider-text stagger-2">Or</div>

          {error && <div className="error-msg stagger-3">{error}</div>}

          <form className="stagger-3" onSubmit={handleSubmit}>
            <div className="auth-form-row">
              <div className="auth-input-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName" type="text" className="auth-input-premium"
                  placeholder="eg. John" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} required
                />
              </div>
              <div className="auth-input-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName" type="text" className="auth-input-premium"
                  placeholder="eg. Francisco" value={lastName}
                  onChange={(e) => setLastName(e.target.value)} required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" className="auth-input-premium"
                placeholder="eg. johnfrans@gmail.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-field-wrap">
                <input
                  id="password" type={showPassword ? 'text' : 'password'} className="auth-input-premium"
                  placeholder="Enter your password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <div className="auth-helper">Must be at least 8 characters.</div>
            </div>
            
            <button type="submit" className="auth-btn-primary" disabled={loading || !!socialLoading}>
              {loading ? 'Account Creating...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-footer-text stagger-4">
            Already have an account? 
            <span className="auth-link-purple" onClick={onSwitchToLogin}>Log in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

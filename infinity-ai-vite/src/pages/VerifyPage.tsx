import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface VerifyPageProps {
  email: string;
  onVerified: () => void;
  onSwitchToLogin: () => void;
}

const VerifyPage: React.FC<VerifyPageProps> = ({ email, onVerified, onSwitchToLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { confirmSignUp, resendCode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmSignUp(email, code.trim());
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => onVerified(), 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await resendCode(email);
      setSuccess('A new code has been sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-bg" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.92 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.84 1.27h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.1a16 16 0 006 6l1.87-1.87a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.02z" />
            </svg>
          </div>
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">Enter the code sent to<br /><strong style={{ color: 'var(--accent)' }}>{email}</strong></p>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && (
          <div className="error-msg" style={{ background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.35)', color: '#4ade80' }}>
            ✅ {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="verify-code">Verification Code</label>
            <input
              id="verify-code"
              type="text"
              className="auth-input"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              style={{ letterSpacing: '0.25em', textAlign: 'center', fontSize: '20px' }}
              required
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="auth-footer" style={{ flexDirection: 'column', gap: '8px' }}>
          <span>
            Didn't receive a code?{' '}
            <span className="auth-link" onClick={handleResend} style={{ cursor: resending ? 'not-allowed' : 'pointer', opacity: resending ? 0.5 : 1 }}>
              {resending ? 'Sending...' : 'Resend Code'}
            </span>
          </span>
          <span>
            <span className="auth-link" onClick={onSwitchToLogin}>← Back to Login</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;

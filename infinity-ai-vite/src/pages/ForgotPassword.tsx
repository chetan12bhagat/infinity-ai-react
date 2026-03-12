import React, { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: request code, 2: confirm reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword({ username: email });
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-bg" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
          </p>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div style={{ color: '#4ade80', padding: '10px', background: 'rgba(74,222,128,0.1)', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>{success}</div>}

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRequestCode}>
            <div className="auth-input-group">
              <label>Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <div className="auth-footer">
              <span className="auth-link" onClick={() => navigate('/login')}>Back to Login</span>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleConfirmReset}>
            <div className="auth-input-group">
              <label>Confirmation Code</label>
              <input
                type="text"
                className="auth-input"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="auth-input-group">
              <label>New Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Confirm Reset'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

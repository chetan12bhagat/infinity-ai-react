import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          checkUser();
          break;
        case 'signInWithRedirect_failure':
          setError('Failed to sign in with Google. Please try again.');
          break;
      }
    });

    const checkUser = async () => {
      try {
        await getCurrentUser();
        navigate('/');
      } catch (err) {
        // Still processing or not authenticated yet
      }
    };

    // Also check immediately in case Hub event was already fired
    checkUser();

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
        {error ? (
          <div className="error-msg">{error}</div>
        ) : (
          <>
            <div className="dot" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Completing Sign In</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Connecting you to Infinity AI...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

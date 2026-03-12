import { useState, useEffect } from 'react';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  fetchAuthSession,
  signInWithRedirect,
  confirmSignUp,
  resendSignUpCode
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    // Listen for auth events (OAuth redirect, sign out, etc)
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          checkUser();
          break;
        case 'signInWithRedirect_failure':
          console.error('OAuth redirect failure:', payload.data);
          setLoading(false);
          break;
        case 'signedOut':
          setUser(null);
          setLoading(false);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  async function checkUser() {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // Extract useful attributes from the session tokens
      const idToken = session.tokens?.idToken?.payload;
      const accessToken = session.tokens?.accessToken?.toString();
      
      setUser({
        ...currentUser,
        email: idToken?.email as string,
        name: (idToken?.name || idToken?.given_name || (idToken?.email as string)?.split('@')[0]) as string,
        picture: idToken?.picture as string,
        token: accessToken
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn({ username: email, password });
    if (result.isSignedIn) {
      await checkUser();
    }
    return result;
  };

  const handleSignUp = async (email: string, password: string) => {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email
        }
      }
    });
    return result;
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    const result = await confirmSignUp({ username: email, confirmationCode: code });
    return result;
  };

  const handleResendCode = async (email: string) => {
    const result = await resendSignUpCode({ username: email });
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const handleGoogleLogin = async () => {
    await signInWithRedirect({ provider: 'Google' });
  };

  // Force refresh session tokens
  const refreshSession = async () => {
    const session = await fetchAuthSession({ forceRefresh: true });
    await checkUser();
    return session.tokens?.accessToken;
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    resendCode: handleResendCode,
    signOut: handleSignOut,
    googleLogin: handleGoogleLogin,
    githubLogin: async () => { await signInWithRedirect({ provider: 'GitHub' as any }); },
    refreshSession,
    checkUser
  };
}

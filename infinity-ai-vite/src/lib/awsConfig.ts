// Diagnostic logging for production
if (import.meta.env.PROD) {
  const missing = [];
  if (!import.meta.env.VITE_COGNITO_USER_POOL_ID) missing.push('VITE_COGNITO_USER_POOL_ID');
  if (!import.meta.env.VITE_COGNITO_CLIENT_ID) missing.push('VITE_COGNITO_CLIENT_ID');
  if (!import.meta.env.VITE_COGNITO_DOMAIN) missing.push('VITE_COGNITO_DOMAIN');
  
  if (missing.length > 0) {
    console.error('CRITICAL: Missing environment variables on Netlify:', missing.join(', '));
    console.warn('Ensure these are set in Netlify -> Site Settings -> Environment Variables and then RE-DEPLOY the site.');
  }
}

export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [
            'http://localhost:5173/auth/callback',
            'https://infinity-ai-cb.netlify.app/auth/callback'
          ],
          redirectSignOut: [
            'http://localhost:5173',
            'https://infinity-ai-cb.netlify.app'
          ],
          responseType: 'code'
        }
      }
    }
  },
  API: {
    REST: {
      'infinity-ai-api': {
        endpoint: import.meta.env.VITE_API_GATEWAY_URL || '',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
      }
    }
  }
};

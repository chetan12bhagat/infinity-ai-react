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

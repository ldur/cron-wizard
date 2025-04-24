
import { Amplify } from 'aws-amplify';

// Configure Amplify
export const configureCognito = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
        signUpVerificationMethod: 'code',
      }
    }
  });
};

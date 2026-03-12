import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify';
import { awsConfig } from './lib/awsConfig';
import './index.css'
import App from './App.tsx'

Amplify.configure(awsConfig as any);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

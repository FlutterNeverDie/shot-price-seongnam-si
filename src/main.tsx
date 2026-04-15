import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OverlayProvider } from '@toss/use-overlay'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OverlayProvider>
      <App />
    </OverlayProvider>
  </StrictMode>,
)

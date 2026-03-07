import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initAnalytics } from './services/analytics'
import { registerSW } from 'virtual:pwa-register'

// Register the PWA service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version of ElevateAI is available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('ElevateAI is ready to work offline.')
  },
})

// Initialise GA4 once before the React tree mounts
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

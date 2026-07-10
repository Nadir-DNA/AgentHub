import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initPreferences } from './services/preferences'
import App from './App.tsx'

initPreferences()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setApiBaseUrl } from './api/axios'
import './index.css'
import App from './App.tsx'

async function init() {
  try {
    const res = await fetch('/config.json')
    const config = (await res.json()) as { VITE_API_URL?: string }
    if (config?.VITE_API_URL) {
      setApiBaseUrl(config.VITE_API_URL)
    }
  } catch {
    // usa VITE_API_URL do build ou fallback em axios
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init()

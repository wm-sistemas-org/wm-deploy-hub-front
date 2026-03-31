import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setApiBaseUrl } from './api/axios'
import './index.css'
import App from './App.tsx'

async function init() {
  try {
    const res = await fetch('/config.json')
    if (!res.ok) return
    const config = (await res.json()) as { VITE_API_URL?: string }
    const url = config?.VITE_API_URL?.trim()
    // Só sobrescreve a base URL se o JSON definir algo (evita public/config.json vazio ou placeholder quebrar o .env)
    if (url) {
      setApiBaseUrl(url)
    }
  } catch {
    // usa VITE_API_URL do build / .env
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init()

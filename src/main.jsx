import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './styles/tokens.css'
import './index.css'
import './styles/components.css'
import './styles/dashboard.css'
import App from './App.jsx'

async function start() {
  // Demo estática (GitHub Pages): sin backend PHP, responde con datos de demostración.
  if (import.meta.env.VITE_DEMO === 'true') {
    const { installMockBackend } = await import('./demo/mockBackend.js')
    installMockBackend()
  }
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

start()

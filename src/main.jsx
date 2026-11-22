import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/components.css'  // ← CSS global de componentes (paginación, modales, etc.)
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
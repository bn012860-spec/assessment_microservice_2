import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Prevent accidental changes to focused number inputs or selects via mouse wheel
document.addEventListener('wheel', (e) => {
  const active = document.activeElement;
  if (!active) return;
  const tag = active.tagName;
  if ((tag === 'INPUT' && active.type === 'number') || tag === 'SELECT') {
    // Remove focus so wheel doesn't change the value
    active.blur();
  }
}, { passive: true });

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.jsx'

function applyPerfMode() {
  if (typeof window === 'undefined') return { perfLow: false }

  const params = new URLSearchParams(window.location.search)
  const perfParam = params.get('perf')
  if (perfParam === 'low') {
    document.documentElement.classList.add('perf-low')
    return { perfLow: true }
  }
  if (perfParam === 'high') return { perfLow: false }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const deviceMemory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : 8
  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 8

  const perfLow = prefersReducedMotion || deviceMemory <= 4 || cores <= 4
  if (perfLow) document.documentElement.classList.add('perf-low')
  return { perfLow }
}

const { perfLow } = applyPerfMode()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion={perfLow ? 'always' : 'user'}>
      <App />
    </MotionConfig>
  </StrictMode>,
)

import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import * as Sentry from '@sentry/react'

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 1.0,
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
) 
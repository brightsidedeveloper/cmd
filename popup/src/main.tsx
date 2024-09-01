import ReactDOM from 'react-dom/client'
import { BrightProvider, BrightWebTheme } from 'bsdweb'
import './index.css'

// Import the generated route tree
import { StrictMode } from 'react'
import App from './App'


// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <BrightProvider>
        <App />
      </BrightProvider>
    </StrictMode>
  )
}

BrightWebTheme.initializeTheme()
BrightWebTheme.mediaThemeEventListener()
BrightWebTheme.storageThemeEventListener()

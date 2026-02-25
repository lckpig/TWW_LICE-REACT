import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NarrativeProvider } from '@/context/NarrativeContext'
import { UIProvider } from '@/context/UIContext'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <NarrativeProvider>
        <App />
      </NarrativeProvider>
    </UIProvider>
  </StrictMode>,
)

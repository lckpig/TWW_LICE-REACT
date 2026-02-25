import AppShell from '@/components/Layout/AppShell'
import Page from '@/components/Page/Page'
import { useNarrative } from '@/context/NarrativeContext'

// ─── AppContent — Renderiza la página activa ──────────────────────────────────
// Separado de App para poder usar el hook useNarrative dentro del
// NarrativeProvider (los hooks deben usarse dentro de su provider).
function AppContent() {
  const { currentPageConfig, isPageLoading, loadError } = useNarrative()

  if (loadError) {
    return (
      <div
        style={{
          color: '#ff4444',
          padding: '2rem',
          fontFamily: 'monospace',
          fontSize: '14px',
          background: '#1a0000',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
        }}
      >
        <strong>LICE Error:</strong>
        <br />
        {loadError}
      </div>
    )
  }

  if (isPageLoading || !currentPageConfig) {
    return (
      <div
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '12px',
          letterSpacing: '0.2em',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
        }}
      >
        cargando...
      </div>
    )
  }

  return <Page config={currentPageConfig} />
}

// ─── App — Punto de entrada de la aplicación ─────────────────────────────────
// Los providers se montan en main.tsx (NarrativeProvider, UIProvider)
// para mantener App limpio.
export default function App() {
  return (
    <AppShell>
      <AppContent />
    </AppShell>
  )
}

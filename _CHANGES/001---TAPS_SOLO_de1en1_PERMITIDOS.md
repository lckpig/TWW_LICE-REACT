Entendido. Estás en modo Ask así que te explico el análisis completo y la solución antes de implementar.

---

## El problema actual

En `useInteraction.ts` existe `isSwipeLocked`, pero solo se activa durante la **carga del JSON** de la página (en `NarrativeContext`). Una vez que la página carga, los taps quedan libres aunque estén ocurriendo animaciones.

No hay ningún mecanismo que bloquee taps durante:
- La animación de entrada de un panel (0.8s)
- La ventana de 900ms antes de que aparezca la viñeta 1
- La animación de entrada de la viñeta 1

---

## La solución correcta

Un **ref local `tapLocked`** en `Page.tsx` que actúa como cerrojo de animación, independiente del cerrojo de carga del store. Así no interfiere con `NarrativeContext`.

**Tres puntos donde hay que bloquear:**

### 1. Al montar la página (cubre el delay + viñeta 1)
```typescript
useEffect(() => {
  // Bloquea desde el montaje hasta que termina la animación de viñeta 1
  const firstPanel = config.panels[0]
  const entryDir = computeEntryDirection(firstPanel)
  const ap = shotManager.getAnimationParams(firstPanel.shotType, firstPanel.angle, entryDir, 0)
  tapLocked.current = true
  const t = setTimeout(() => { tapLocked.current = false },
    PAGE_FIRST_PANEL_DELAY_MS + ap.entryDuration * 1000 + 100) // +100ms buffer
  return () => clearTimeout(t)
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

### 2. En cada tap (cubre la animación del siguiente panel)
```typescript
const handleTap = useCallback(() => {
  if (tapLocked.current) return  // ← GUARDIA
  const nextIndex = currentPanelIndex + 1
  if (nextIndex >= config.panels.length) {
    handleSwipeUp()
    return
  }
  const nextPanel = config.panels[nextIndex]
  const entryDir = computeEntryDirection(nextPanel)
  const ap = shotManager.getAnimationParams(nextPanel.shotType, nextPanel.angle, entryDir, nextIndex)
  tapLocked.current = true
  setTimeout(() => { tapLocked.current = false }, ap.entryDuration * 1000 + 100)
  advancePanel()
}, [...])
```

### 3. En `handleSwipeUp` no hace falta hacer nada
La página actual se desmonta, y la nueva página al montar ya se bloquea sola con el punto 1.

---

## Timing resultante
| Evento | Duración bloqueado |
|---|---|
| Monta página nueva | `900ms delay + 0.8s animación + 100ms` = ~1800ms |
| Tap panel 2..N (CLOSE_UP) | `0.8s * 0.7 + 100ms` = ~660ms |
| Tap panel 2..N (LONG) | `0.8s + 100ms` = ~900ms |

Cambia a modo Agent para que lo aplique.
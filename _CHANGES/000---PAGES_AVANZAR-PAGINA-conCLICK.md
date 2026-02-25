Ya tengo el panorama completo. Te explico exactamente qué hay que modificar y cómo.

---

## Situación actual

El flujo está en `src/components/Page/Page.tsx`:

```65:97:src/components/Page/Page.tsx
  // ── TAP: avanza al siguiente panel ────────────────────────────────────────
  const handleTap = useCallback(() => {
    const nextIndex = currentPanelIndex + 1
    if (nextIndex >= config.panels.length) return   // ← aquí para cuando no hay más paneles
    advancePanel()
  }, [currentPanelIndex, config.panels.length, advancePanel])

  // ── SWIPE UP: transición a la página siguiente ────────────────────────────
  const handleSwipeUp = useCallback(() => {
    // ... animación GSAP + goToNextPage()
  }, [goToNextPage])
```

Cuando ya se han revelado todos los paneles, el `handleTap` simplemente hace `return` — no hace nada. El SWIPE UP es el único que avanza de página.

---

## El cambio necesario

El arreglo es **una sola línea** en `handleTap`. En lugar de hacer `return` cuando no hay más paneles, llamar a `handleSwipeUp()`:

```typescript
// ANTES:
const handleTap = useCallback(() => {
  const nextIndex = currentPanelIndex + 1
  if (nextIndex >= config.panels.length) return   // ← no hace nada
  advancePanel()
}, [currentPanelIndex, config.panels.length, advancePanel])

// DESPUÉS:
const handleTap = useCallback(() => {
  const nextIndex = currentPanelIndex + 1
  if (nextIndex >= config.panels.length) {
    handleSwipeUp()   // ← cuando no hay más paneles, navega a la siguiente página
    return
  }
  advancePanel()
}, [currentPanelIndex, config.panels.length, advancePanel, handleSwipeUp])
```

**Importante:** hay que añadir `handleSwipeUp` a las dependencias del `useCallback`.

---

## Por qué esto ya funciona con el bloqueo

No hay que preocuparse por clics accidentales durante la transición, porque:
- `handleSwipeUp` llama a `goToNextPage()` internamente
- El store tiene `isSwipeLocked` que se activa durante la carga de la nueva página (en `NarrativeContext.tsx` línea 92)
- `useInteraction` revisa `isSwipeLocked` antes de disparar cualquier gesto

Así que el click solo funcionará cuando corresponda, igual que el swipe. Para implementarlo, cambia a modo Agent.
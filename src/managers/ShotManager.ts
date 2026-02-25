import type { ShotType, Angle, EntryDirection, IShotAnimationParams, IRule180Config, IPanelConfig } from '@/types'
import { ENTRY_ANIMATION_DURATION } from '@/utils/constants'

// ─── ShotManager — Validador Cinemático y Calculador de Parámetros ────────────
// Traduce los tipos de plano y ángulos cinematográficos en parámetros concretos
// de animación para GSAP.
//
// En Unity, este manager se convierte en CinematicRuleValidator.cs, que
// opera sobre los datos del ScriptableObject antes de pasarlos al
// PanelController (equivalente a Panel.tsx).

class ShotManager {
  private static instance: ShotManager

  private constructor() {}

  static getInstance(): ShotManager {
    if (!ShotManager.instance) {
      ShotManager.instance = new ShotManager()
    }
    return ShotManager.instance
  }

  // ── Calcula los parámetros de animación de entrada según el tipo de plano ─
  // Equivale a un método de configuración en PanelController.cs en Unity.
  getAnimationParams(
    shotType: ShotType,
    angle: Angle,
    entryDirection: EntryDirection,
    panelIndex: number,
  ): IShotAnimationParams {
    const zoomFactor = this.getZoomFactor(shotType)
    const parallaxDepth = this.getParallaxDepth(shotType, angle)
    const entryDuration = this.getEntryDuration(shotType, panelIndex)

    return {
      zoomFactor,
      parallaxDepth,
      entryDuration,
      entryDirection,
    }
  }

  // ── Factor de zoom según tipo de plano ────────────────────────────────────
  // CLOSE_UP tiene zoom más pronunciado en la animación de entrada.
  private getZoomFactor(shotType: ShotType): number {
    switch (shotType) {
      case 'EXTREME_CLOSE_UP': return 1.15
      case 'CLOSE_UP':         return 1.08
      case 'MEDIUM':           return 1.04
      case 'LONG':             return 1.0
      default:                 return 1.0
    }
  }

  // ── Profundidad de parallax ───────────────────────────────────────────────
  // Los planos generales se mueven más lento (están "más lejos").
  private getParallaxDepth(shotType: ShotType, angle: Angle): number {
    const baseDepth: Record<ShotType, number> = {
      LONG: 0.3,
      MEDIUM: 0.6,
      CLOSE_UP: 0.85,
      EXTREME_CLOSE_UP: 1.0,
    }
    const angleMultiplier = angle === 'BIRD_EYE' ? 0.8 : 1.0
    return (baseDepth[shotType] ?? 0.5) * angleMultiplier
  }

  // ── Duración de la animación de entrada ───────────────────────────────────
  // Los primeros panels (index bajo) y los LONG tienen entrada más lenta.
  private getEntryDuration(shotType: ShotType, panelIndex: number): number {
    const baseDuration = ENTRY_ANIMATION_DURATION

    if (shotType === 'LONG' || panelIndex === 0) return baseDuration
    if (shotType === 'EXTREME_CLOSE_UP') return baseDuration * 0.7
    return baseDuration * 0.9
  }

  // ── Validación de la Regla de los 180° ───────────────────────────────────
  // Verifica que dos panels consecutivos sean coherentes espacialmente.
  // En Unity, este método se ejecuta en el Editor como una validación de datos.
  validate180Rule(
    currentPanel: Pick<IPanelConfig, 'rule180' | 'id'>,
    previousPanel: Pick<IPanelConfig, 'rule180' | 'id'> | null,
  ): { isValid: boolean; warning: string | null } {
    if (!previousPanel?.rule180 || !currentPanel.rule180) {
      return { isValid: true, warning: null }
    }

    const prev = previousPanel.rule180
    const curr = currentPanel.rule180

    // Si los ejes X son opuestos (ej. prev=left, curr=right), hay ruptura de 180°
    if (
      prev.axisX !== 'neutral' &&
      curr.axisX !== 'neutral' &&
      prev.axisX !== curr.axisX
    ) {
      return {
        isValid: false,
        warning: `⚠️ Posible ruptura de 180° entre "${previousPanel.id}" (axisX: ${prev.axisX}) y "${currentPanel.id}" (axisX: ${curr.axisX})`,
      }
    }

    return { isValid: true, warning: null }
  }

  // ── Valida todos los panels de una página de una vez ─────────────────────
  validatePageRule180(panels: IPanelConfig[]): string[] {
    const warnings: string[] = []
    for (let i = 1; i < panels.length; i++) {
      const result = this.validate180Rule(panels[i], panels[i - 1])
      if (!result.isValid && result.warning) {
        warnings.push(result.warning)
      }
    }
    return warnings
  }

  // ── Determina si el ángulo requiere efecto de perspectiva CSS ─────────────
  getPerspectiveCSS(angle: Angle): React.CSSProperties {
    switch (angle) {
      case 'LOW':      return { transform: 'perspective(800px) rotateX(-3deg)' }
      case 'HIGH':     return { transform: 'perspective(800px) rotateX(3deg)' }
      case 'BIRD_EYE': return { transform: 'perspective(600px) rotateX(8deg)' }
      default:         return {}
    }
  }
}

export const shotManager = ShotManager.getInstance()

// ─── Tipos exportados para uso externo ────────────────────────────────────────
export type { IRule180Config }

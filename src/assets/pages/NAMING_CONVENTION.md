# Naming Convention — Assets de Páginas

## Estructura de carpetas
```
/src/assets/pages/
  /page-01/
    p01_v01_long_loop.mp4        ← Panel 1: plano general, loop
    p01_v02_med_action.mp4       ← Panel 2: plano medio, acción
    p01_v02_med_loop.mp4         ← Panel 2: plano medio, loop (TYPE_B)
    p01_v03_close_loop.mp4       ← Panel 3: close-up, loop
    p01_sfx_extra.mp3            ← SFX puntual de la página
  /page-02/
    ...
/src/assets/shared/
    ambient_rain.mp3             ← Audio ambiental de lluvia (global)
    ambient_wind.mp3
    sfx_impact.mp3
```

## Patrón de nombre
`p{PAGE}_{PANEL_ORDER}_{SHOT_TYPE}_{VIDEO_TYPE}.{EXT}`

- `p01` = página 01
- `v01` = primera viñeta
- `long/med/close/xclose` = shotType abreviado
- `loop` / `action` = tipo de video

## Notas
- Todos los videos deben tener audio **incrustado** (no pistas separadas).
- Resolución recomendada: 720x1280 (9:16) o 1080x1920.
- Codec: H.264, sin keyframe muy distanciados para seek eficiente.

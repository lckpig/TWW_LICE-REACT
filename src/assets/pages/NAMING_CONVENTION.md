# Naming Convention — Assets de Páginas LICE React
## Proyecto OMEGA — La Batería Definitiva

---

## Estructura de carpetas

```
/src/assets/
├── /pages/
│   ├── /page-01/        ← GENESIS — La Calma Antes de la Tormenta
│   │   ├── p01_v01_long_loop.mp4
│   │   ├── p01_v02_med_loop.mp4
│   │   ├── p01_v03_close_loop.mp4
│   │   ├── p01_v04_med_loop.mp4
│   │   └── thumbnail.jpg
│   ├── /page-02/        ← IMPACTO — El Despertar de la Fuerza
│   │   ├── p02_v01_med_action.mp4
│   │   ├── p02_v01_med_loop.mp4
│   │   ├── p02_v02_close_loop.mp4
│   │   ├── p02_v03_xclose_action.mp4
│   │   ├── p02_v03_xclose_loop.mp4
│   │   ├── p02_v04_med_loop.mp4
│   │   ├── p02_v05_med_action.mp4
│   │   ├── p02_v05_med_loop.mp4
│   │   └── thumbnail.jpg
│   ├── /page-03/        ← CONTROL REMOTO — El Poder de la Causalidad
│   │   ├── p03_v01_med_loop.mp4
│   │   ├── p03_v02_close_loop.mp4
│   │   ├── p03_v03_med_loop.mp4
│   │   ├── p03_v04_close_action.mp4
│   │   ├── p03_v04_close_loop.mp4
│   │   └── thumbnail.jpg
│   ├── /page-04/        ← CASCADA — Densidad Máxima
│   │   ├── p04_v01_long_loop.mp4
│   │   ├── p04_v02_xclose_loop.mp4
│   │   ├── p04_v03_xclose_loop.mp4
│   │   ├── p04_v04_xclose_loop.mp4
│   │   ├── p04_v05_close_loop.mp4
│   │   ├── p04_v06_long_action.mp4
│   │   ├── p04_v06_long_loop.mp4
│   │   └── thumbnail.jpg
│   └── /page-05/        ← CLÍMAX — La Prueba Final
│       ├── p05_v01_long_loop.mp4
│       ├── p05_v02_med_action.mp4
│       ├── p05_v02_med_loop.mp4
│       ├── p05_v03_close_action.mp4
│       ├── p05_v03_close_loop.mp4
│       ├── p05_v04_med_action.mp4
│       ├── p05_v04_med_loop.mp4
│       ├── p05_v05_xclose_loop.mp4
│       └── thumbnail.jpg
└── /shared/             ← Audios globales y SFX compartidos
    ├── ambient_rain.mp3
    ├── ambient_wind.mp3
    ├── sfx_metal_impact.mp3
    ├── sfx_explosion.mp3
    ├── sfx_charge.mp3
    ├── sfx_ultimate_impact.mp3
    └── sfx_rumble.mp3
```

---

## Patrón de nombre para VIDEOS

```
p{PAGE}_v{ORDER}_{SHOT_TYPE}_{VIDEO_TYPE}.mp4
```

| Segmento | Valores | Ejemplo |
|----------|---------|---------|
| `p01` | Número de página (01–05) | `p02` = página 2 |
| `v01` | Orden de la viñeta en la página | `v03` = tercera viñeta |
| `long` | ShotType abreviado | `long` / `med` / `close` / `xclose` |
| `loop` | Tipo de video | `loop` / `action` |

### Abreviaturas de ShotType

| Código | ShotType | Descripción |
|--------|----------|-------------|
| `long` | LONG | Plano general (panorámico) |
| `med` | MEDIUM | Plano medio (cintura arriba) |
| `close` | CLOSE_UP | Close-up (hombros/cara) |
| `xclose` | EXTREME_CLOSE_UP | Extreme close-up (detalle extremo) |

---

## Patrón de nombre para AUDIOS COMPARTIDOS

```
/src/assets/shared/
```

| Prefijo | Tipo | Descripción |
|---------|------|-------------|
| `ambient_` | Loop de ambiente global | Clima persistente (lluvia, viento) |
| `sfx_` | Sound Effect puntual | Disparado por keyframe `type: "sfx"` |

### Mapeo audioId → archivo

El campo `audioId` del JSON (`data.audioId` en keyframes de tipo `sfx`) se resuelve como:
```
/src/assets/shared/{audioId}.mp3
```

Ejemplos:
- `"audioId": "sfx_metal_impact"` → `/src/assets/shared/sfx_metal_impact.mp3`
- `"audioId": "sfx_explosion"` → `/src/assets/shared/sfx_explosion.mp3`

---

## Patrón de nombre para THUMBNAILS

```
/src/assets/pages/page-{XX}/thumbnail.jpg
```

- Formato: JPEG, mínimo 400x711px (relación 9:16)
- Un frame representativo de la página (normalmente panel 1)
- Usado en el manifiesto para previsualización

---

## Requisitos técnicos para VIDEOS

| Propiedad | Valor requerido |
|-----------|-----------------|
| Resolución preferida | 1080 × 1920 px (9:16 vertical) |
| Resolución mínima | 720 × 1280 px |
| Codec de video | H.264 (AVC) |
| Codec de audio | AAC |
| Bitrate video | 2-4 Mbps (loop), 4-8 Mbps (action) |
| Keyframe interval | Cada 1-2 segundos (para seek eficiente) |
| Audio | **Incrustado en el video** (no pistas separadas) |
| Duración loops | 4-8 segundos (se reproducen en bucle infinito) |
| Duración actions | 2-4 segundos (reproducción única → transición a loop) |
| Formato contenedor | `.mp4` |
| Contenido de audio | Los videos deben tener audio ambiental propio incrustado |

### Notas sobre el audio en videos

- Cada video lleva su **pista de audio incrustada** para simplificar la sincronización.
- El `AudioManager` ajusta el volumen de cada `<video>` para los crossfades (no usa pistas separadas).
- Los videos de acción (TYPE_B) deben tener el impacto auditivo principal en la pista incrustada.
- Los videos de loop deben tener sonido ambiental continuo en la pista incrustada.

---

## Requisitos técnicos para AUDIOS COMPARTIDOS

| Propiedad | Valor requerido |
|-----------|-----------------|
| Formato | `.mp3` (compatibilidad universal) |
| Bitrate ambient | 128 kbps (loops largos, ahorrar espacio) |
| Bitrate SFX | 192 kbps (SFX puntuales, mayor calidad) |
| Duración ambient | 15-30 segundos (loop sin clicks) |
| Duración SFX | 1-4 segundos |
| Canales | Stereo o Mono (ambos válidos) |
| Sample rate | 44.1 kHz |

---

## Lista completa de assets del Proyecto OMEGA

### Totales: 32 videos + 5 thumbnails + 7 audios = 44 archivos

| Página | Videos | Thumbnails | Notas |
|--------|--------|------------|-------|
| page-01 (GENESIS) | 4 | 1 | Todos TYPE_A_LOOP |
| page-02 (IMPACTO) | 8 | 1 | 3 pares action+loop |
| page-03 (CONTROL REMOTO) | 5 | 1 | 1 par action+loop |
| page-04 (CASCADA) | 7 | 1 | 1 par action+loop |
| page-05 (CLÍMAX) | 8 | 1 | 3 pares action+loop |
| shared | — | — | 2 ambient + 5 SFX |

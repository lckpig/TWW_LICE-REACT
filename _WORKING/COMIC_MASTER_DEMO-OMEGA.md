He completado un análisis exhaustivo de **todo** el codebase del LICE React. Tengo claro cada componente, manager, tipo, hook, store y configuración existente. Voy a presentar ahora el plan completo.

---

## ANÁLISIS COMPLETO: COMIC MASTER DEMO — "PROYECTO OMEGA"

### 1. INVENTARIO DE FEATURES A TESTEAR

Tras analizar todo el código, estas son **todas** las capacidades del LICE React que el cómic demo debe cubrir:

| Categoría | Features | Estado en código |
|---|---|---|
| **PanelType** | `TYPE_A_LOOP`, `TYPE_B_ACTION` | Implementado |
| **ShotType** | `LONG`, `MEDIUM`, `CLOSE_UP`, `EXTREME_CLOSE_UP` | Implementado |
| **Angle** | `NORMAL`, `LOW`, `HIGH`, `PROFILE`, `BIRD_EYE` | Implementado |
| **EntryDirection** | `LEFT`, `RIGHT`, `TOP`, `BOTTOM`, `FADE`, `SCALE` | Implementado |
| **Keyframe: cameraShake** | ejes `both`, `x`, `y` | Implementado |
| **Keyframe: flash** | diferentes colores/duraciones | Implementado |
| **Keyframe: onomatopoeia** | animaciones `bounce`, `elastic`, `pop`, `slam` | Implementado |
| **Keyframe: weather** | `rain`, `snow` | Implementado |
| **Keyframe: weather** | `fog`, `dust` | **NO implementado** en GlobalFX |
| **Keyframe: visualControl** | `dimmed`, `stopped`, `hidden` | Implementado |
| **Keyframe: ambientVolume** | fade de volumen remoto | Implementado |
| **Keyframe: sfx** | reproducción de SFX | **NO implementado** (handler falta en Panel.tsx, Howler.js sin usar) |
| **Weather particles** | `rain`, `snow` | Implementado |
| **Weather particles** | `fog`, `dust` | **NO implementado** en GlobalFX |
| **Audio crossfade** | entre panels al TAP | Implementado |
| **Audio global** | `ambient_rain` | Implementado (solo lluvia) |
| **Audio global** | viento, motores, etc. | **Falta** registrar más audios en AppShell |
| **Gestos** | TAP, SWIPE UP, Wheel | Implementado |
| **Grid 100x100** | posicionamiento relativo | Implementado |
| **Z-Index dinámico** | apilamiento de panels | Implementado |
| **Pacing profiles** | `calm`, `action`, `tension`, `breath` | Definido en tipos |
| **Cliffhanger** | visual guide con gradiente | CSS preparado |
| **180° Rule** | validación espacial | Implementado |
| **Background color** | por página | Implementado (solo al cargar) |
| **Mute global** | botón HUD | Implementado |
| **Preload/Cleanup** | ResourceManager | Implementado |

---

### 2. GAPS CRÍTICOS DE CÓDIGO (REQUIEREN IMPLEMENTACIÓN)

Antes de que el cómic demo funcione al 100%, hay que resolver estos gaps:

#### GAP A — Handler de SFX en `Panel.tsx`

El switch de `handleKeyframe` no tiene case para `'sfx'`. Howler.js está en `package.json` pero no se usa en ningún sitio. Necesitas:

1. Crear un **SfxManager** (o añadir al AudioManager) que use Howler.js para precargar y disparar SFX puntuales.
2. Añadir el case `'sfx'` en el `handleKeyframe` de `Panel.tsx`.

#### GAP B — Weather `fog` y `dust` en `GlobalFX.tsx`

`GlobalFX.tsx` solo renderiza partículas para `rain` y `snow`. Los tipos `fog` y `dust` están definidos en `cinematic.d.ts` pero no tienen rendering. Necesitas:
- `fog`: overlay con gradiente semitransparente + partículas lentas
- `dust`: partículas pequeñas horizontales con drift

#### GAP C — Audios globales adicionales en `AppShell.tsx`

Solo está registrado `ambient_rain`. Para el demo necesitas registrar también `ambient_wind` (para polvo/dust) y potencialmente un SFX de motor/zumbido.

#### GAP D — Keyframe tipo `backgroundChange` (opcional)

El documento Alpha menciona cambios dinámicos de fondo. No existe este keyframe type. Se puede implementar como nuevo tipo o usar el store `setBackgroundColor` directamente desde un keyframe personalizado.

---

### 3. DISEÑO DEL COMIC: 5 PÁGINAS — "PROYECTO OMEGA: LA BATERÍA DEFINITIVA"

#### PÁGINA 1: "GENESIS — La Calma Antes de la Tormenta"

**Objetivo técnico:** TYPE_A_LOOP exclusivo, sistema de clima (rain → none), shots LONG/MEDIUM/CLOSE_UP, ángulos BIRD_EYE/NORMAL/HIGH, entradas FADE/LEFT/RIGHT/BOTTOM, onomatopeya pop, flash blanco.

| Panel | Grid (x,y,w,h) | Type | Shot | Angle | Entry | Keyframes |
|-------|-----------------|------|------|-------|-------|-----------|
| 1 | 0,0,100,35 | TYPE_A_LOOP | LONG | BIRD_EYE | FADE | T=1.0s: weather→rain |
| 2 | 0,37,55,30 | TYPE_A_LOOP | MEDIUM | NORMAL | LEFT | T=1.5s: onomatopoeia "..." (pop) |
| 3 | 57,37,43,30 | TYPE_A_LOOP | CLOSE_UP | HIGH | RIGHT | T=0.5s: flash blanco |
| 4 | 0,69,100,31 | TYPE_A_LOOP | MEDIUM | NORMAL | BOTTOM | T=1.0s: weather→none, T=1.5s: onomatopoeia "HMM..." (pop) |

- **backgroundColor:** `#0a0a12`
- **initialWeather:** `rain`
- **pacingProfile:** `{ totalTaps: 4, mood: "calm", hasCliffhanger: false }`

---

#### PÁGINA 2: "IMPACTO — El Despertar de la Fuerza"

**Objetivo técnico:** TYPE_B_ACTION, las 4 onomatopeyas (bounce/elastic/slam/pop), cameraShake en ejes both/x/y, flash multicolor, SFX, shots MEDIUM/CLOSE_UP/EXTREME_CLOSE_UP, ángulos PROFILE/NORMAL/LOW, entradas FADE/LEFT/RIGHT/SCALE/BOTTOM, cliffhanger.

| Panel | Grid (x,y,w,h) | Type | Shot | Angle | Entry | Keyframes |
|-------|-----------------|------|------|-------|-------|-----------|
| 1 | 10,0,80,32 | TYPE_B_ACTION | MEDIUM | PROFILE | FADE | T=1.0s: shake(8,0.5,both), T=1.1s: onomatopoeia "KRA-KOOM!" (bounce), T=1.2s: sfx, T=1.5s: flash dorado |
| 2 | 0,34,48,25 | TYPE_A_LOOP | CLOSE_UP | NORMAL | LEFT | T=0.8s: onomatopoeia "!!" (elastic) |
| 3 | 50,34,50,25 | TYPE_B_ACTION | XCU | LOW | RIGHT | T=0.2s: flash dorado, T=0.3s: shake(4,0.3,x), T=0.5s: onomatopoeia "ZZRK!" (slam) |
| 4 | 15,61,70,20 | TYPE_A_LOOP | MEDIUM | LOW | SCALE | T=1.0s: onomatopoeia "..." (pop) |
| 5 | 0,83,100,17 | TYPE_B_ACTION | MEDIUM | LOW | BOTTOM | T=0.3s: shake(10,0.8,y), T=0.4s: flash blanco, T=0.6s: sfx, T=0.8s: onomatopoeia "BOOOOM!" (slam) |

- **backgroundColor:** `#080810`
- **initialWeather:** `none`
- **pacingProfile:** `{ totalTaps: 5, mood: "action", hasCliffhanger: true }`

---

#### PÁGINA 3: "CONTROL REMOTO — El Poder de la Causalidad"

**Objetivo técnico:** visualControl (dimmed, stopped), ambientVolume, weather (snow→none), PROFILE angle, SCALE entry, acción en un panel afecta a paneles previos.

| Panel | Grid (x,y,w,h) | Type | Shot | Angle | Entry | Keyframes |
|-------|-----------------|------|------|-------|-------|-----------|
| 1 | 0,0,45,40 | TYPE_A_LOOP | MEDIUM | NORMAL | LEFT | T=0.5s: shake suave(2,3.0,both) |
| 2 | 47,0,53,40 | TYPE_A_LOOP | CLOSE_UP | HIGH | RIGHT | T=1.0s: weather→snow |
| 3 | 5,42,90,28 | TYPE_A_LOOP | MEDIUM | PROFILE | SCALE | T=1.0s: onomatopoeia "TAP TAP" (pop) |
| 4 | 30,72,70,28 | TYPE_B_ACTION | CLOSE_UP | NORMAL | RIGHT | T=0.1s: visualControl→P1(dimmed+brightness(0.3)), T=0.2s: ambientVolume→P1(vol:0), T=0.5s: visualControl→P2(stopped), T=0.8s: weather→none, T=1.0s: flash azul, T=1.2s: onomatopoeia "CLANK!" (slam) |

- **backgroundColor:** `#0a1020`
- **initialWeather:** `none`
- **pacingProfile:** `{ totalTaps: 4, mood: "tension", hasCliffhanger: false }`

---

#### PÁGINA 4: "CASCADA — Densidad Máxima"

**Objetivo técnico:** Video de fondo (100x100), strips verticales (cascada), panel overlay con zIndex alto, fog weather, BIRD_EYE/PROFILE angles, TOP entry, 6 panels (máxima densidad).

| Panel | Grid (x,y,w,h) | Type | Shot | Angle | Entry | zIndex | Keyframes |
|-------|-----------------|------|------|-------|-------|--------|-----------|
| 1 | 0,0,100,100 | TYPE_A_LOOP | LONG | BIRD_EYE | FADE | 5 | T=2.0s: weather→fog |
| 2 | 0,10,33,50 | TYPE_A_LOOP | XCU | PROFILE | LEFT | 15 | — |
| 3 | 34,10,33,50 | TYPE_A_LOOP | XCU | NORMAL | TOP | 16 | T=0.5s: onomatopoeia "!" (elastic) |
| 4 | 67,10,33,50 | TYPE_A_LOOP | XCU | PROFILE | RIGHT | 17 | T=0.5s: flash blanco suave |
| 5 | 20,35,60,35 | TYPE_A_LOOP | CLOSE_UP | NORMAL | SCALE | 50 | T=1.0s: onomatopoeia "..." (pop) |
| 6 | 0,72,100,28 | TYPE_B_ACTION | LONG | LOW | BOTTOM | 20 | T=0.5s: shake(6,0.5,both), T=0.8s: flash dorado, T=1.0s: sfx, T=1.5s: weather→none, T=2.0s: onomatopoeia "KRRRMMM..." (elastic) |

- **backgroundColor:** `#050510`
- **initialWeather:** `none` (cambia a fog en T=2.0s del panel 1)
- **pacingProfile:** `{ totalTaps: 6, mood: "breath", hasCliffhanger: true }`

---

#### PÁGINA 5: "CLÍMAX — La Prueba Final"

**Objetivo técnico:** Todo combinado: múltiples TYPE_B_ACTION, dust weather, visualControl hidden, timeline encadenado complejo, SFX múltiples, cliffhanger definitivo.

| Panel | Grid (x,y,w,h) | Type | Shot | Angle | Entry | Keyframes |
|-------|-----------------|------|------|-------|-------|-----------|
| 1 | 0,0,100,30 | TYPE_A_LOOP | LONG | NORMAL | FADE | T=1.0s: weather→dust |
| 2 | 0,32,50,30 | TYPE_B_ACTION | MEDIUM | LOW | LEFT | T=0.5s: sfx, T=0.8s: shake(5,0.4,both), T=1.0s: onomatopoeia "HAAAA!" (slam) |
| 3 | 52,32,48,30 | TYPE_B_ACTION | CLOSE_UP | PROFILE | RIGHT | T=0.3s: flash rojo, T=0.5s: ambientVolume→P1(vol:0.2), T=0.8s: onomatopoeia "TSK!" (pop) |
| 4 | 10,64,80,20 | TYPE_B_ACTION | MEDIUM | NORMAL | SCALE | T=0.1s: shake(10,1.0,both), T=0.2s: flash blanco, T=0.3s: onomatopoeia "KRAKATHOOM!!" (slam), T=0.5s: sfx, T=0.8s: visualControl→P1(hidden), T=1.0s: weather→none, T=1.5s: ambientVolume→P2(vol:0) |
| 5 | 0,86,100,14 | TYPE_A_LOOP | XCU | LOW | BOTTOM | T=1.0s: onomatopoeia "..." (pop), T=2.0s: flash dorado |

- **backgroundColor:** `#0a0a0a`
- **initialWeather:** `none` (cambia a dust en T=1.0s del panel 1)
- **pacingProfile:** `{ totalTaps: 5, mood: "tension", hasCliffhanger: true }`

---

### 4. LISTA COMPLETA DE ASSETS AUDIOVISUALES

#### Convención de nombres

```
p{PAGE}_v{ORDER}_{SHOT}_{TYPE}.mp4
```
- `p01` = página 01
- `v01` = viñeta 1 (orden de aparición)
- `long/med/close/xclose` = tipo de plano abreviado
- `loop/action` = tipo de video

**Requisitos técnicos para TODOS los videos:**
- Resolución: **1080x1920** (9:16 vertical) preferido, mínimo 720x1280
- Codec: **H.264**, keyframes cada 1-2 segundos para seek eficiente
- Audio: **incrustado** en el video (no pistas separadas)
- Duración loops: **4-8 segundos** (se reproducen en bucle infinito)
- Duración actions: **2-4 segundos** (reproducción única)
- Formato: `.mp4`

---

#### `/src/assets/pages/page-01/` — GENESIS (4 videos + thumbnail)

| Archivo | Contenido | Duración | Audio incrustado |
|---------|-----------|----------|------------------|
| `p01_v01_long_loop.mp4` | **Paisaje panorámico con lluvia.** Vista aérea (bird's eye) de un bosque o valle oscuro bajo tormenta. La cámara está quieta, la lluvia cae constantemente, árboles se mecen suavemente. | 6s loop | Sonido de lluvia y viento atmosférico |
| `p01_v02_med_loop.mp4` | **Personaje de pie bajo la lluvia.** Plano medio, el personaje está a la derecha del encuadre mirando hacia la derecha. Micro-movimientos: respiración, gotas cayendo. | 5s loop | Lluvia cercana + respiración sutil |
| `p01_v03_close_loop.mp4` | **Rostro del personaje mirando al cielo.** Close-up desde ángulo alto (picado). Gotas de lluvia en la cara, parpadeo lento. Expresión contemplativa. | 5s loop | Lluvia suave sobre piel |
| `p01_v04_med_loop.mp4` | **Personaje descubre algo en el suelo.** Plano medio, el personaje se agacha y observa algo brillante entre las raíces. Micro-movimiento de curiosidad. | 5s loop | Sonido de hojas y goteo |
| `thumbnail.jpg` | Miniatura del paisaje lluvioso (frame representativo del panel 1) | — | — |

---

#### `/src/assets/pages/page-02/` — IMPACTO (8 videos + thumbnail)

| Archivo | Contenido | Duración | Audio incrustado |
|---------|-----------|----------|------------------|
| `p02_v01_med_action.mp4` | **Robot guardián despierta y golpea el suelo.** Plano medio perfil. El robot estaba dormido, se activan sus ojos, levanta el brazo y golpea el suelo con fuerza. Impacto visible en T=1.0s. | 3s action | Activación mecánica + impacto metálico |
| `p02_v01_med_loop.mp4` | **Robot guardián en reposo activo.** Mismo encuadre que action. El robot está de pie, ojos encendidos, chispas ocasionales, vapor. Ambientación industrial. | 5s loop | Zumbido mecánico constante |
| `p02_v02_close_loop.mp4` | **Reacción de miedo de la niña.** Close-up frontal. Ojos muy abiertos, parpadeo rápido de miedo, micro-temblor. Mira hacia la izquierda (consistente con 180°). | 5s loop | Respiración acelerada |
| `p02_v03_xclose_action.mp4` | **Orbe de energía dispara rayo.** Extreme close-up desde ángulo bajo (contrapicado). El orbe acumula energía y en T=0.2s dispara un haz de luz. | 2s action | Carga eléctrica + descarga |
| `p02_v03_xclose_loop.mp4` | **Orbe pulsando después del disparo.** Mismo encuadre. El orbe brilla rítmicamente con energía residual. | 4s loop | Pulsación eléctrica suave |
| `p02_v04_med_loop.mp4` | **Ambos personajes en standoff tenso.** Plano medio desde ángulo bajo. La niña a la izquierda, el robot a la derecha. Tensión palpable, micro-movimientos. | 5s loop | Silencio tenso con viento |
| `p02_v05_med_action.mp4` | **Explosión comienza — Cliffhanger.** Plano medio bajo. Una onda de energía sale del orbe, la tierra tiembla, comienza la explosión. | 3s action | Rugido de energía creciente |
| `p02_v05_med_loop.mp4` | **Post-explosión.** Humo, escombros flotantes, chispas. El caos se ha calmado pero la tensión persiste. | 5s loop | Crepitar + viento post-explosión |
| `thumbnail.jpg` | Frame del impacto del robot contra el suelo | — | — |

---

#### `/src/assets/pages/page-03/` — CONTROL REMOTO (5 videos + thumbnail)

| Archivo | Contenido | Duración | Audio incrustado |
|---------|-----------|----------|------------------|
| `p03_v01_med_loop.mp4` | **Máquina/generador funcionando.** Plano medio. Máquina industrial con luces parpadeantes, vibrando, tuberías con vapor. Debe sentirse "viva". | 6s loop | Motor pesado + vibración mecánica |
| `p03_v02_close_loop.mp4` | **Monitor con lecturas.** Close-up picado de una pantalla con datos. Números cambiando, gráficos pulsantes, luz azul/verde del monitor. | 5s loop | Beeps electrónicos suaves |
| `p03_v03_med_loop.mp4` | **Personaje caminando hacia consola.** Plano medio perfil. El personaje avanza de izquierda a derecha hacia un panel de control. Paso decidido. | 5s loop | Pasos resonantes en metal |
| `p03_v04_close_action.mp4` | **Personaje arranca cable de la consola.** Close-up. La mano agarra un cable grueso y tira con fuerza. Chispas salen en T=0.1s. Pantallas se apagan. | 2.5s action | Tirón + chispazo eléctrico |
| `p03_v04_close_loop.mp4` | **Consola apagada, chispas residuales.** Mismo encuadre. Todo oscuro salvo chispas débiles ocasionales. Humo tenue. | 5s loop | Crepitar eléctrico residual |
| `thumbnail.jpg` | Frame de la sala de control con la máquina | — | — |

---

#### `/src/assets/pages/page-04/` — CASCADA (7 videos + thumbnail)

| Archivo | Contenido | Duración | Audio incrustado |
|---------|-----------|----------|------------------|
| `p04_v01_long_loop.mp4` | **Paisaje vasto con niebla.** Vista aérea (bird's eye) de un mundo expansivo: montañas, cielo estrellado o llanura infinita. Niebla moviéndose lentamente. Sirve de FONDO para toda la página. | 8s loop | Ambiente épico/cósmico suave |
| `p04_v02_xclose_loop.mp4` | **Personaje A — Extreme close-up perfil izquierdo.** Solo los ojos y parte del rostro. Expresión de asombro. Mirando hacia la derecha. | 4s loop | Respiración contenida |
| `p04_v03_xclose_loop.mp4` | **Personaje B — Extreme close-up frontal.** Solo los ojos y frente. Expresión de determinación. Micro-movimiento de cejas. | 4s loop | Latido de corazón suave |
| `p04_v04_xclose_loop.mp4` | **Personaje C — Extreme close-up perfil derecho.** Solo los ojos mirando hacia la izquierda. Expresión de miedo o incertidumbre. | 4s loop | Respiración temblorosa |
| `p04_v05_close_loop.mp4` | **Objeto clave revelado (el orbe).** Close-up frontal. Un orbe/artefacto flotando, emitiendo luz pulsante. Partículas a su alrededor. Misterioso. | 5s loop | Zumbido cristalino + reverb |
| `p04_v06_long_action.mp4` | **Onda de energía panorámica.** Plano general bajo. Una onda de energía sale del orbe y se expande por el paisaje. Espectacular. | 3s action | Explosión masiva + onda sónica |
| `p04_v06_long_loop.mp4` | **Post-onda.** Partículas asentándose, el mundo transformado, calma después de la tormenta. | 6s loop | Eco reverberante + silencio |
| `thumbnail.jpg` | Composición de los tres rostros en strip vertical | — | — |

---

#### `/src/assets/pages/page-05/` — CLÍMAX (8 videos + thumbnail)

| Archivo | Contenido | Duración | Audio incrustado |
|---------|-----------|----------|------------------|
| `p05_v01_long_loop.mp4` | **Campo de batalla con polvo.** Plano general. Terreno desolado, viento levantando polvo/arena, cielo turbio. Atmósfera de duelo inminente. | 6s loop | Viento fuerte + crujidos |
| `p05_v02_med_action.mp4` | **Personaje carga hacia adelante.** Plano medio bajo (ángulo héroe). El personaje se lanza corriendo con determinación. | 2.5s action | Grito de batalla + pasos rápidos |
| `p05_v02_med_loop.mp4` | **Personaje en postura de combate.** Mismo encuadre. El personaje mantiene guardia, respiración visible, polvo a su alrededor. | 5s loop | Respiración pesada + viento |
| `p05_v03_close_action.mp4` | **Oponente se prepara para impacto.** Close-up perfil. Los ojos se estrechan, tensa los músculos, prepara defensa. | 2s action | Tensión muscular + gruñido |
| `p05_v03_close_loop.mp4` | **Oponente en guardia defensiva.** Mismo encuadre, en posición defensiva estable. | 5s loop | Respiración controlada |
| `p05_v04_med_action.mp4` | **¡EL CHOQUE! Ambos colisionan.** Plano medio. Momento del impacto: energía, destellos, onda expansiva. El momento climático del cómic. | 3s action | Impacto masivo + onda de choque |
| `p05_v04_med_loop.mp4` | **Energía disipándose.** Mismo encuadre. Las energías se desvanecen lentamente, humo, calma tensa. | 5s loop | Eco del impacto + silencio |
| `p05_v05_xclose_loop.mp4` | **El humo se disipa, algo brilla.** Extreme close-up bajo. Entre el polvo se ve un destello, algo ha cambiado. Cliffhanger visual. | 5s loop | Brillo cristalino + misterio |
| `thumbnail.jpg` | Frame del momento del choque (panel 4) | — | — |

---

#### `/src/assets/shared/` — Audios globales

| Archivo | Contenido | Formato | Duración |
|---------|-----------|---------|----------|
| `ambient_rain.mp3` | **Lluvia atmosférica.** Loop de lluvia constante con truenos lejanos ocasionales. Para clima global "rain". | MP3 128kbps | 15-30s loop |
| `ambient_wind.mp3` | **Viento con polvo/arena.** Loop de viento constante, ráfagas, arena golpeando. Para clima global "dust". | MP3 128kbps | 15-30s loop |
| `sfx_metal_impact.mp3` | **Impacto metálico.** Sonido puntual de metal contra piedra/suelo. Robot golpeando. | MP3 192kbps | 1-2s |
| `sfx_explosion.mp3` | **Explosión grande.** Detonación con reverb prolongada. | MP3 192kbps | 2-3s |
| `sfx_charge.mp3` | **Carga de energía.** Sonido ascendente de energía acumulándose. | MP3 192kbps | 1.5s |
| `sfx_ultimate_impact.mp3` | **Impacto masivo.** El choque final, más potente que la explosión normal. | MP3 192kbps | 2-3s |
| `sfx_rumble.mp3` | **Retumbar grave.** Terremoto suave, vibración profunda. | MP3 192kbps | 3-4s |

**Total de assets:** **32 videos MP4** + **5 thumbnails JPG** + **7 audios MP3** = **44 archivos**

---

### 5. MATRIZ DE COBERTURA DE FEATURES

| Feature | P1 | P2 | P3 | P4 | P5 |
|---------|:--:|:--:|:--:|:--:|:--:|
| TYPE_A_LOOP | x | x | x | x | x |
| TYPE_B_ACTION | | x | x | x | x |
| Shot: LONG | x | | | x | x |
| Shot: MEDIUM | x | x | x | | x |
| Shot: CLOSE_UP | x | x | x | x | x |
| Shot: EXTREME_CLOSE_UP | | x | | x | x |
| Angle: NORMAL | x | x | x | x | x |
| Angle: LOW | | x | | x | x |
| Angle: HIGH | x | | x | | |
| Angle: PROFILE | | x | x | x | x |
| Angle: BIRD_EYE | x | | | x | |
| Entry: FADE | x | x | | x | x |
| Entry: LEFT | x | x | x | x | x |
| Entry: RIGHT | x | x | x | x | x |
| Entry: TOP | | | | x | |
| Entry: BOTTOM | x | x | | x | x |
| Entry: SCALE | | x | x | x | x |
| KF: cameraShake | | x | x | x | x |
| KF: flash | x | x | x | x | x |
| KF: onomatopoeia | x | x | x | x | x |
| KF: sfx | | x | | x | x |
| KF: weather | x | | x | x | x |
| KF: visualControl | | | x | | x |
| KF: ambientVolume | | | x | | x |
| Onom: bounce | | x | | | |
| Onom: elastic | | x | | x | |
| Onom: pop | x | x | x | x | x |
| Onom: slam | | x | x | | x |
| Weather: rain | x | | | | |
| Weather: snow | | | x | | |
| Weather: fog | | | | x | |
| Weather: dust | | | | | x |
| Weather: none (trans.) | x | | x | x | x |
| Shake axis: both | | x | x | x | x |
| Shake axis: x | | x | | | |
| Shake axis: y | | x | | | |
| VisualCtrl: dimmed | | | x | | |
| VisualCtrl: stopped | | | x | | |
| VisualCtrl: hidden | | | | | x |
| Pacing: calm | x | | | | |
| Pacing: action | | x | | | |
| Pacing: tension | | | x | | x |
| Pacing: breath | | | | x | |
| Cliffhanger | | x | | x | x |
| 180° Rule | x | x | x | | |
| Audio crossfade | x | x | x | x | x |
| Global audio | x | | x | | x |

**Cobertura: 100% de todas las features del LICE React.**

---

### 6. LISTA DE TODOS PARA IMPLEMENTACIÓN

He verificado todos los puntos de contacto en el código. Aquí va la **lista de todos DEFINITIVA** para que el agente ejecute mecánicamente, con instrucciones **exactas** archivo por archivo, línea por línea.

---

## LISTA DE TODOS PARA EL AGENTE — COMIC MASTER DEMO "PROYECTO OMEGA"

**Documento de referencia:** `_WORKING/COMIC_MASTER_DEMO-OMEGA.md`

---

### FASE 0 — LECTURA OBLIGATORIA PREVIA

El agente **DEBE** leer estos archivos antes de tocar nada, para tener el contexto completo:

- `_WORKING/COMIC_MASTER_DEMO-OMEGA.md` (diseño completo del cómic)
- `_CONTEXT/APP_GENERAL-CONTEXT.md` (filosofía y especificación del motor)
- `src/types/timeline.d.ts`, `src/types/cinematic.d.ts`, `src/types/config.d.ts` (los tipos existentes)

---

### FASE 1 — GAPS DE CÓDIGO (5 tareas)

Estas tareas corrigen funcionalidades que están tipadas pero **no implementadas**. Son prerrequisitos para que el cómic demo funcione al 100%.

---

**TODO 1: Crear `src/managers/SfxManager.ts`**

**Qué:** Nuevo archivo. Manager Singleton para SFX puntuales usando Howler.js (ya está en `package.json`).

**Cómo:** Seguir el patrón Singleton idéntico a `AudioManager.ts` y `EffectsManager.ts`. Debe:
- Importar `Howl` de `howler`
- Mantener un `Map<string, Howl>` con los SFX precargados
- Método `preload(audioId: string, src: string): void` — crea un `new Howl({ src: [src], preload: true })`
- Método `play(audioId: string, volume?: number): void` — busca en el mapa y llama `.play()`. Si no existe, carga al vuelo desde `/src/assets/shared/${audioId}.mp3`
- Método `dispose(): void` — descarga todos los Howl
- Exportar la instancia como `export const sfxManager = SfxManager.getInstance()`

**Convención de audioId:** El `audioId` del JSON (ej. `"sfx_metal_impact"`) se mapea directamente a `/src/assets/shared/sfx_metal_impact.mp3`.

---

**TODO 2: Añadir handler `sfx` en `src/components/Panel/Panel.tsx`**

**Qué:** Añadir el case faltante en el switch de `handleKeyframe` (línea 79-107).

**Dónde exactamente:** Entre el case `'flash'` (línea 83-84) y el case `'onomatopoeia'` (línea 86-87), o al final antes del cierre del switch.

**Código a añadir:**

```typescript
case 'sfx': {
  const sd = keyframe.data as ISfxData
  sfxManager.play(sd.audioId, sd.volume)
  break
}
```

**Import necesario:** Añadir al inicio del archivo:

```typescript
import { sfxManager } from '@/managers/SfxManager'
```

**También importar** `ISfxData` — ya está disponible vía `@/types` pero verificar que se incluya en la importación existente de types en la línea 11:

```typescript
import type {
  // ... existentes ...
  ISfxData,  // ← añadir
} from '@/types'
```

---

**TODO 3: Implementar weather `fog` en `src/components/Overlays/GlobalFX.tsx`**

**Qué:** Añadir rendering visual para el clima `fog`. Actualmente `GlobalFX.tsx` solo renderiza `rain` y `snow` (líneas 99-112).

**Cómo:** Fog debe ser un **overlay div** (no canvas de partículas) con:
- Gradiente radial semitransparente blanco/gris que cubre toda la página
- Animación pulsante suave con GSAP o CSS: `opacity` oscila entre 0.3 y 0.6 en ciclos de ~4 segundos
- Puede incluir una capa de partículas muy lentas y grandes (simulando nubes de niebla)

**Cambios específicos:**

1. **Línea 132-133** — Ampliar `isWeatherActive` para incluir fog y dust:

```typescript
const isWeatherActive =
  globalEffects.globalWeather !== 'none'
```

2. **En el useEffect de clima (línea 100-112)** — Añadir else if para fog:

```typescript
} else if (globalEffects.globalWeather === 'fog') {
  initParticles(30, true)  // pocas partículas, grandes y lentas
  drawParticles(true)       // reutilizar drawParticles con modo fog
}
```

Nota: Probablemente sea mejor refactorizar `initParticles` y `drawParticles` para aceptar un parámetro de tipo de weather en lugar de solo `isSnow: boolean`. O añadir un sistema separado de fog con un div overlay. El agente debe decidir el enfoque más limpio que sea consistente con el patrón existente.

3. **En el return del JSX** — Añadir un div overlay de niebla:

```tsx
{globalEffects.globalWeather === 'fog' && (
  <div style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: Z_INDEX_GLOBAL_FX - 2,
    background: 'radial-gradient(ellipse at center, rgba(180,190,200,0.4) 0%, rgba(100,110,120,0.2) 50%, transparent 100%)',
    animation: 'fogPulse 4s ease-in-out infinite',
  }} />
)}
```

(O usar GSAP para animar la opacidad del fog overlay.)

---

**TODO 4: Implementar weather `dust` en `src/components/Overlays/GlobalFX.tsx`**

**Qué:** Añadir rendering visual para clima `dust`. Similar a rain pero con partículas **horizontales**.

**Cómo:** Canvas-based como rain, pero:
- Partículas color marrón/arena (`#c4a265` o similar)
- Movimiento principal **horizontal** (izquierda → derecha, simulando viento)
- Partículas pequeñas, drift vertical mínimo
- Cantidad media (~100 partículas)

**En el useEffect de clima:** Añadir else if:

```typescript
} else if (globalEffects.globalWeather === 'dust') {
  initParticles(100, false) // Necesita adaptación para dust
  drawParticles(false)       // Necesita adaptación para movimiento horizontal
}
```

**Nota clave:** La función `drawParticles` actual mueve partículas solo verticalmente (`p.y += p.speed`). Para dust, necesita mover horizontalmente (`p.x += p.speed`) con drift vertical mínimo. Considerar refactorizar `drawParticles` para aceptar el tipo de weather y ajustar el comportamiento de movimiento. Una opción limpia:
- Crear una función separada `drawDust` que mueva horizontalmente
- O parametrizar `drawParticles` con un `weatherType`

---

**TODO 5: Registrar audios globales adicionales en `src/components/Layout/AppShell.tsx`**

**Qué:** Añadir `<audio>` para `ambient_wind.mp3` (usado por weather `dust`). Replicar el patrón existente de `ambient_rain`.

**Cambios exactos:**

1. **Nuevo ref** (junto a línea 22):

```typescript
const windAudioRef = useRef<HTMLAudioElement | null>(null)
```

2. **Registrar en useEffect** (ampliar el useEffect de línea 27-38):

```typescript
const windEl = windAudioRef.current
if (windEl) {
  windEl.volume = AMBIENT_VOLUME
  windEl.loop = true
  audioManager.registerGlobalAudio('ambient_wind', windEl)
}

return () => {
  audioManager.unregisterGlobalAudio('ambient_rain')
  audioManager.unregisterGlobalAudio('ambient_wind')
}
```

3. **Controlar reproducción** (ampliar el useEffect de línea 41-47):

```typescript
useEffect(() => {
  if (globalWeather === 'rain') {
    audioManager.playGlobalAudio('ambient_rain')
  } else {
    audioManager.stopGlobalAudio('ambient_rain', 1.5)
  }

  if (globalWeather === 'dust') {
    audioManager.playGlobalAudio('ambient_wind')
  } else {
    audioManager.stopGlobalAudio('ambient_wind', 1.5)
  }
}, [globalWeather])
```

4. **Nuevo elemento `<audio>`** (junto al existente de línea 67-72):

```tsx
<audio
  ref={windAudioRef}
  src="/src/assets/shared/ambient_wind.mp3"
  preload="auto"
  style={{ display: 'none' }}
/>
```

---

### FASE 2 — MEJORAS DE UX MENORES (2 tareas)

---

**TODO 6: Añadir `data-cliffhanger` al div de Page en `src/components/Page/Page.tsx`**

**Qué:** El CSS en `Page.module.css` línea 49 ya tiene el estilo `.page[data-cliffhanger='true']::after` listo (gradiente que sugiere SWIPE UP), pero `Page.tsx` nunca establece ese atributo.

**Dónde:** Línea 106-112 del JSX del return, en el div raíz.

**Cambio exacto:** Añadir el data attribute al div:

```tsx
<div
  ref={registerRefs}
  className={styles.page}
  data-cliffhanger={config.pacingProfile.hasCliffhanger ? 'true' : 'false'}
  style={{
    backgroundColor,
    aspectRatio: config.aspectRatio ?? ASPECT_RATIO_CSS,
  }}
>
```

---

**TODO 7: Activar primer panel automáticamente al cargar página**

**Qué:** Actualmente `currentPanelIndex` empieza en -1 (ningún panel visible). El primer TAP lo pone a 0, mostrando el primer panel. Para que la experiencia sea fluida, el panel 0 debería aparecer automáticamente al cargar la página (con su animación de entrada), sin requerir un TAP previo.

**Dónde:** En `src/context/NarrativeContext.tsx`, después de que la página se carga exitosamente (línea 99-105), o en `src/components/Page/Page.tsx` con un useEffect que haga `advancePanel()` al montar.

**Opción recomendada (en Page.tsx):** Añadir un useEffect que al montar el Page con una nueva config, haga `advancePanel()` una vez para revelar el primer panel (panel 0):

```typescript
useEffect(() => {
  if (currentPanelIndex === -1 && config.panels.length > 0) {
    advancePanel()
  }
}, [config.id])
```

**Alternativa:** Cambiar `resetPanels()` en `useAppStore.ts` para que establezca `currentPanelIndex: 0` en vez de `-1`. Pero esto cambiaría el comportamiento global, así que el useEffect en Page es más seguro.

---

### FASE 3 — JSON DE CONFIGURACIÓN (6 tareas)

Estas son las tareas de **escritura de datos**. Cada JSON debe cumplir estrictamente la interfaz `IPageConfig` definida en `src/types/config.d.ts`.

**Contexto para el agente:** Toda la información de diseño de cada página (panels, coordenadas, shots, ángulos, keyframes) está detallada en `_WORKING/COMIC_MASTER_DEMO-OMEGA.md`, sección 3 "DISEÑO DEL COMIC". El agente debe construir el JSON completo siguiendo la estructura exacta de los JSON existentes (`page-01.json` y `page-02.json` actuales) como referencia de formato.

---

**TODO 8: Escribir `src/config/pages/page-01.json` — GENESIS**

**Qué:** Sobrescribir el JSON existente con la configuración de "GENESIS — La Calma Antes de la Tormenta".

**Datos del OMEGA.md sección PÁGINA 1:**
- 4 panels: todos TYPE_A_LOOP
- backgroundColor: `#0a0a12`, initialWeather: `rain`
- pacingProfile: `{ totalTaps: 4, mood: "calm", hasCliffhanger: false }`
- Panel 1: LONG/BIRD_EYE/FADE, keyframe T=1.0→weather rain
- Panel 2: MEDIUM/NORMAL/LEFT, keyframe T=1.5→onomatopoeia "..." (pop)
- Panel 3: CLOSE_UP/HIGH/RIGHT, keyframe T=0.5→flash blanco
- Panel 4: MEDIUM/NORMAL/BOTTOM, keyframes T=1.0→weather none, T=1.5→onomatopoeia "HMM..." (pop)

**IDs:** `p01_panel_01`, `p01_panel_02`, `p01_panel_03`, `p01_panel_04`

**Videos (rutas):**
- Panel 1: loop → `/src/assets/pages/page-01/p01_v01_long_loop.mp4`
- Panel 2: loop → `/src/assets/pages/page-01/p01_v02_med_loop.mp4`
- Panel 3: loop → `/src/assets/pages/page-01/p01_v03_close_loop.mp4`
- Panel 4: loop → `/src/assets/pages/page-01/p01_v04_med_loop.mp4`

**Rule180:** Establecer coherencia espacial:
- Panel 1: neutral/neutral (panorámico)
- Panel 2: right/neutral (personaje mira derecha)
- Panel 3: right/neutral (consistente)
- Panel 4: right/neutral (consistente)

---

**TODO 9: Escribir `src/config/pages/page-02.json` — IMPACTO**

**Qué:** Sobrescribir con configuración de "IMPACTO — El Despertar de la Fuerza".

**Datos del OMEGA.md sección PÁGINA 2:**
- 5 panels: 3 TYPE_B_ACTION + 2 TYPE_A_LOOP
- backgroundColor: `#080810`, initialWeather: `none`
- pacingProfile: `{ totalTaps: 5, mood: "action", hasCliffhanger: true }`
- Panel 1: TYPE_B_ACTION, MED/PROFILE/FADE, keyframes T=1.0→shake(8,0.5,both), T=1.1→onomatopoeia "KRA-KOOM!"(bounce,red,48px), T=1.2→sfx "sfx_metal_impact", T=1.5→flash dorado
- Panel 2: TYPE_A_LOOP, CLOSE_UP/NORMAL/LEFT, T=0.8→onomatopoeia "!!"(elastic,white)
- Panel 3: TYPE_B_ACTION, XCU/LOW/RIGHT, T=0.2→flash dorado, T=0.3→shake(4,0.3,x), T=0.5→onomatopoeia "ZZRK!"(slam,yellow)
- Panel 4: TYPE_A_LOOP, MED/LOW/SCALE, T=1.0→onomatopoeia "..."(pop,subtle)
- Panel 5: TYPE_B_ACTION, MED/LOW/BOTTOM, T=0.3→shake(10,0.8,y), T=0.4→flash blanco, T=0.6→sfx "sfx_explosion", T=0.8→onomatopoeia "BOOOOM!"(slam,orange-red)

**Videos:**
- P1: action→`p02_v01_med_action.mp4`, loop→`p02_v01_med_loop.mp4`
- P2: loop→`p02_v02_close_loop.mp4`
- P3: action→`p02_v03_xclose_action.mp4`, loop→`p02_v03_xclose_loop.mp4`
- P4: loop→`p02_v04_med_loop.mp4`
- P5: action→`p02_v05_med_action.mp4`, loop→`p02_v05_med_loop.mp4`

**Rule180:** left/neutral para todo (personaje a la izquierda, robot a la derecha)

---

**TODO 10: Crear `src/config/pages/page-03.json` — CONTROL REMOTO**

**Qué:** Nuevo archivo. Configuración de "CONTROL REMOTO — El Poder de la Causalidad".

**Datos del OMEGA.md sección PÁGINA 3:**
- 4 panels: 3 TYPE_A_LOOP + 1 TYPE_B_ACTION
- backgroundColor: `#0a1020`, initialWeather: `none`
- pacingProfile: `{ totalTaps: 4, mood: "tension", hasCliffhanger: false }`
- Panel 1 (p03_panel_01): MED/NORMAL/LEFT, T=0.5→shake(2,3.0,both)
- Panel 2 (p03_panel_02): CLOSE_UP/HIGH/RIGHT, T=1.0→weather snow
- Panel 3 (p03_panel_03): MED/PROFILE/SCALE, T=1.0→onomatopoeia "TAP TAP"(pop)
- Panel 4 (p03_panel_04): TYPE_B_ACTION, CLOSE_UP/NORMAL/RIGHT, con **6 keyframes de Control Remoto**:
  - T=0.1→visualControl→p03_panel_01 (dimmed, brightness(0.3))
  - T=0.2→ambientVolume→p03_panel_01 (vol:0, fade:1.0)
  - T=0.5→visualControl→p03_panel_02 (stopped)
  - T=0.8→weather none
  - T=1.0→flash azul (`rgba(100,150,255,0.8)`)
  - T=1.2→onomatopoeia "CLANK!"(slam, metallic `#88aacc`)

**Videos:**
- P1: loop→`p03_v01_med_loop.mp4`
- P2: loop→`p03_v02_close_loop.mp4`
- P3: loop→`p03_v03_med_loop.mp4`
- P4: action→`p03_v04_close_action.mp4`, loop→`p03_v04_close_loop.mp4`

---

**TODO 11: Crear `src/config/pages/page-04.json` — CASCADA**

**Qué:** Nuevo archivo. "CASCADA — Densidad Máxima".

**Datos del OMEGA.md sección PÁGINA 4:**
- 6 panels: 5 TYPE_A_LOOP + 1 TYPE_B_ACTION
- backgroundColor: `#050510`, initialWeather: `none`
- pacingProfile: `{ totalTaps: 6, mood: "breath", hasCliffhanger: true }`
- Panel 1 (background): 0,0,100,100, LONG/BIRD_EYE/FADE, **zIndex: 5**, T=2.0→weather fog
- Panel 2 (strip izq): 0,10,33,50, XCU/PROFILE/LEFT, zIndex:15, sin keyframes
- Panel 3 (strip centro): 34,10,33,50, XCU/NORMAL/TOP, zIndex:16, T=0.5→onomatopoeia "!"(elastic)
- Panel 4 (strip der): 67,10,33,50, XCU/PROFILE/RIGHT, zIndex:17, T=0.5→flash blanco suave
- Panel 5 (overlay): 20,35,60,35, CLOSE_UP/NORMAL/SCALE, **zIndex:50**, T=1.0→onomatopoeia "..."(pop)
- Panel 6 (bottom): 0,72,100,28, TYPE_B_ACTION, LONG/LOW/BOTTOM, zIndex:20, T=0.5→shake(6,0.5,both), T=0.8→flash dorado, T=1.0→sfx "sfx_rumble", T=1.5→weather none, T=2.0→onomatopoeia "KRRRMMM..."(elastic)

**Videos:**
- P1: loop→`p04_v01_long_loop.mp4`
- P2: loop→`p04_v02_xclose_loop.mp4`
- P3: loop→`p04_v03_xclose_loop.mp4`
- P4: loop→`p04_v04_xclose_loop.mp4`
- P5: loop→`p04_v05_close_loop.mp4`
- P6: action→`p04_v06_long_action.mp4`, loop→`p04_v06_long_loop.mp4`

---

**TODO 12: Crear `src/config/pages/page-05.json` — CLÍMAX**

**Qué:** Nuevo archivo. "CLÍMAX — La Prueba Final".

**Datos del OMEGA.md sección PÁGINA 5:**
- 5 panels: 3 TYPE_B_ACTION + 2 TYPE_A_LOOP
- backgroundColor: `#0a0a0a`, initialWeather: `none`
- pacingProfile: `{ totalTaps: 5, mood: "tension", hasCliffhanger: true }`
- Panel 1 (p05_panel_01): 0,0,100,30, LONG/NORMAL/FADE, T=1.0→weather dust
- Panel 2 (p05_panel_02): TYPE_B_ACTION, 0,32,50,30, MED/LOW/LEFT, T=0.5→sfx "sfx_charge", T=0.8→shake(5,0.4,both), T=1.0→onomatopoeia "HAAAA!"(slam,red)
- Panel 3 (p05_panel_03): TYPE_B_ACTION, 52,32,48,30, CLOSE_UP/PROFILE/RIGHT, T=0.3→flash rojo(`rgba(255,50,50,0.7)`), T=0.5→ambientVolume→p05_panel_01(vol:0.2,fade:0.5), T=0.8→onomatopoeia "TSK!"(pop,small)
- Panel 4 (p05_panel_04): TYPE_B_ACTION, 10,64,80,20, MED/NORMAL/SCALE — **timeline encadenado masivo**:
  - T=0.1→shake(10,1.0,both)
  - T=0.2→flash blanco(`rgba(255,255,255,0.95)`)
  - T=0.3→onomatopoeia "KRAKATHOOM!!"(slam,`#ff6600`,56px)
  - T=0.5→sfx "sfx_ultimate_impact"
  - T=0.8→visualControl→p05_panel_01 (hidden)
  - T=1.0→weather none
  - T=1.5→ambientVolume→p05_panel_02(vol:0,fade:1.0)
- Panel 5 (p05_panel_05): XCU/LOW/BOTTOM, 0,86,100,14, T=1.0→onomatopoeia "..."(pop,white,20px), T=2.0→flash dorado

**Videos:**
- P1: loop→`p05_v01_long_loop.mp4`
- P2: action→`p05_v02_med_action.mp4`, loop→`p05_v02_med_loop.mp4`
- P3: action→`p05_v03_close_action.mp4`, loop→`p05_v03_close_loop.mp4`
- P4: action→`p05_v04_med_action.mp4`, loop→`p05_v04_med_loop.mp4`
- P5: loop→`p05_v05_xclose_loop.mp4`

---

**TODO 13: Actualizar `src/config/manifest/story-manifest.json`**

**Qué:** Sobrescribir con las 5 páginas del Proyecto OMEGA.

**Contenido exacto:**

```json
{
  "title": "PROYECTO OMEGA — La Batería Definitiva",
  "version": "1.0.0",
  "author": "LCKPIG",
  "pages": [
    {
      "id": "page-01",
      "index": 0,
      "configPath": "/src/config/pages/page-01.json",
      "thumbnail": "/src/assets/pages/page-01/thumbnail.jpg",
      "title": "GENESIS — La Calma Antes de la Tormenta"
    },
    {
      "id": "page-02",
      "index": 1,
      "configPath": "/src/config/pages/page-02.json",
      "thumbnail": "/src/assets/pages/page-02/thumbnail.jpg",
      "title": "IMPACTO — El Despertar de la Fuerza"
    },
    {
      "id": "page-03",
      "index": 2,
      "configPath": "/src/config/pages/page-03.json",
      "thumbnail": "/src/assets/pages/page-03/thumbnail.jpg",
      "title": "CONTROL REMOTO — El Poder de la Causalidad"
    },
    {
      "id": "page-04",
      "index": 3,
      "configPath": "/src/config/pages/page-04.json",
      "thumbnail": "/src/assets/pages/page-04/thumbnail.jpg",
      "title": "CASCADA — Densidad Máxima"
    },
    {
      "id": "page-05",
      "index": 4,
      "configPath": "/src/config/pages/page-05.json",
      "thumbnail": "/src/assets/pages/page-05/thumbnail.jpg",
      "title": "CLÍMAX — La Prueba Final"
    }
  ]
}
```

---

### FASE 4 — ESTRUCTURA DE ASSETS (3 tareas)

---

**TODO 14: Crear directorios de assets para páginas 3, 4 y 5**

**Qué:** Las carpetas `page-01` y `page-02` ya existen (con `.gitkeep`). Crear las faltantes:

- `src/assets/pages/page-03/.gitkeep`
- `src/assets/pages/page-04/.gitkeep`
- `src/assets/pages/page-05/.gitkeep`

---

**TODO 15: Actualizar `src/assets/pages/NAMING_CONVENTION.md`**

**Qué:** Ampliar el documento existente para incluir los SFX compartidos, los thumbnails, y los requisitos técnicos de los videos.

**Añadir:**
- Sección de SFX compartidos: `sfx_{nombre}.mp3` en `/src/assets/shared/`
- Sección de thumbnails: `thumbnail.jpg` en cada carpeta de página
- Sección de ambient loops: `ambient_{nombre}.mp3` en `/src/assets/shared/`
- Los requisitos técnicos de video (resolución, codec, duración) del OMEGA.md sección 4

---

**TODO 16: Verificar que la app compila y carga sin errores**

**Qué:** Después de todos los cambios, ejecutar `npm run dev` y verificar:
1. La app compila sin errores de TypeScript
2. El manifiesto carga correctamente (no error 404)
3. Las 5 páginas JSON cargan sin error de parseo
4. Los keyframes tienen tipos válidos (no errores en consola)
5. Los gestos TAP y SWIPE UP funcionan para navegar

**Nota:** Los videos darán 404 porque no existen aún — esto es esperado y no debe considerarse un error. Lo importante es que toda la lógica de código, JSONs y managers funcione correctamente.

---

### RESUMEN DE ORDEN DE EJECUCIÓN

```
FASE 1 (código):
  TODO 1  → SfxManager.ts (nuevo archivo)
  TODO 2  → Panel.tsx (añadir case 'sfx')
  TODO 3  → GlobalFX.tsx (fog)
  TODO 4  → GlobalFX.tsx (dust)
  TODO 5  → AppShell.tsx (ambient_wind)

FASE 2 (UX):
  TODO 6  → Page.tsx (data-cliffhanger)
  TODO 7  → Page.tsx (auto-reveal panel 0)

FASE 3 (JSON):
  TODO 8  → page-01.json (sobrescribir)
  TODO 9  → page-02.json (sobrescribir)
  TODO 10 → page-03.json (nuevo)
  TODO 11 → page-04.json (nuevo)
  TODO 12 → page-05.json (nuevo)
  TODO 13 → story-manifest.json (sobrescribir)

FASE 4 (assets):
  TODO 14 → Crear directorios page-03/04/05
  TODO 15 → NAMING_CONVENTION.md (ampliar)
  TODO 16 → Verificación final
```

**Dependencias:** TODO 2 depende de TODO 1. Todos los demás son independientes entre sí dentro de cada fase. Las fases deben ejecutarse en orden (1→2→3→4).

---

Esta lista cubre **absolutamente todo** lo necesario. Al cambiar a modo Agent, el agente solo tiene que seguir estos 16 TODOs en orden, usando `_WORKING/COMIC_MASTER_DEMO-OMEGA.md` como fuente de datos para los detalles de cada página.
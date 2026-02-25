Este es el diseño del **Cómic Maestro Default de Testing** para la plataforma **LICE REACT**. Este proyecto no es solo una historia; es una batería de pruebas de estrés técnico y narrativo diseñada para validar cada una de las funcionalidades del motor (vistas, audios, timelines, efectos globales y lógica cinematográfica).

Llamaremos a este cómic de prueba: **"PROYECTO ALPHA: EL DESPERTAR DEL ORBE"**.

---

### **PÁGINA 1: "ATMÓSFERA Y CLIMA" (Template A - El Panorama)**
**Objetivo técnico:** Probar el sistema de partículas globales, cambios de estado atmosférico y posicionamiento en los bordes.

*   **Vignette 1 (TOP FULL - 100%W x 30%H) - TIPO LOOP:**
    *   **Shot:** Long Shot / **Ángulo:** Perfil.
    *   **Contenido:** Un bosque denso y oscuro. La niña entra desde la izquierda.
    *   **Audio:** Ambiente de bosque nocturno incrustado.
    *   **Timeline (T=1.0s):** Dispara `globalEffect: "particleSystem"` (Lluvia ligera sobre toda la página).
*   **Vignette 2 (LEFT TALL - 40%W x 50%H) - TIPO LOOP:**
    *   **Shot:** Plano Medio / **Ángulo:** Picado (vulnerabilidad).
    *   **Animación Entrada:** `translateRight` (desde la izquierda).
    *   **Contenido:** La niña tiritando por el frío bajo la lluvia.
    *   **Audio:** Sonido de lluvia intensificado.
*   **Vignette 3 (RIGHT SQUARE - 50%W x 50%H) - TIPO ACTION → LOOP:**
    *   **Shot:** XCU / **Ángulo:** Contrapicado.
    *   **Acción:** La niña encuentra un interruptor antiguo en un árbol y lo pulsa.
    *   **Timeline (T=0.5s):** Dispara `audioControl: "stopGlobalAudio"` (para el sonido de lluvia) y `backgroundChange` (Fondo negro → Azul eléctrico).
    *   **Efecto Global:** `globalEffect: "flash"` (blanco) al pulsar el botón.
*   **Vignette 4 (BOTTOM FULL) - CLIFFHANGER:**
    *   **Shot:** Long Shot / **Ángulo:** Contrapicado.
    *   **Contenido:** Un orbe gigante al fondo se ilumina.
    *   **Audio:** Zumbido de energía que sube de tono (sin resolver).
    *   **Guía Visual:** Luz hacia arriba para inducir el **SWIPE UP**.

---

### **PÁGINA 2: "ACCIÓN Y SINCRONÍA" (Template B - La Cascada)**
**Objetivo técnico:** Probar viñetas de acción (Tipo B), onomatopeyas con timeline, Camera Shake y audio sincronizado.

*   **Vignette 1 (CENTER SQUARE - 60%W) - TIPO ACTION:**
    *   **Shot:** Plano Medio / **Ángulo:** Perfil.
    *   **Acción:** Un robot guardián despierta y golpea el suelo.
    *   **Timeline (T=1.2s - impacto):**
        *   `globalEffect: "shake"` (intensidad 15, duración 0.5s).
        *   `onomatopoeia: "KRA-KOOM!"` (entrada `bounce`, loop `pulse`).
        *   `audioControl: "sfx"` (Sonido de metal contra piedra).
*   **Vignette 2 (LEFT SMALL) - TIPO LOOP:**
    *   **Shot:** Close-up / **Ángulo:** Picado.
    *   **Contenido:** Reacción de miedo de la niña (parpadeo rápido).
*   **Vignette 3 (RIGHT SMALL) - TIPO ACTION:**
    *   **Shot:** Close-up / **Ángulo:** Contrapicado.
    *   **Acción:** El orbe dispara un rayo de energía.
    *   **Timeline (T=0.2s):** Dispara `globalEffect: "flash"` (dorado) sincronizado con el brillo del video.

---

### **PÁGINA 3: "CAUSALIDAD Y CONTROL REMOTO" (Template C - El Latido)**
**Objetivo técnico:** Probar el sistema de "Control Remoto" (una viñeta afecta a otra ya visible) y cambios de estado global.

*   **Vignette 1 (TOP LEFT - 40%W) - TIPO LOOP:**
    *   **Contenido:** El Robot Guardián de la página anterior está encendido y vibrando.
    *   **Estado:** `globalEffect: "shake"` constante pero suave (vibración de maquinaria).
    *   **Audio:** Zumbido de motor constante (Audio Global 2).
*   **Vignette 2 (CENTER TALL) - TIPO LOOP:**
    *   **Shot:** Plano Medio / **Ángulo:** Perfil.
    *   **Contenido:** La niña frente a una consola de mando.
*   **Vignette 3 (BOTTOM RIGHT) - TIPO ACTION:**
    *   **Acción:** La niña arranca un cable de la consola.
    *   **Timeline (T=0.1s - CONTROL REMOTO):**
        *   Ordena a **Vignette 1** cambiar video a `robot_off.mp4` (crossfade suave).
        *   Ordena a **Audio Manager** `stopGlobalAudio: "motor_zumbido"`.
        *   Ordena a **Effects Manager** `stopShake`.
    *   **Resultado:** El usuario ve cómo su acción en V3 detiene la vida en V1.

---

### **PÁGINA 4: "CLÍMAX Y MULTI-ASPECT RATIO" (Template E - El Trueno)**
**Objetivo técnico:** Probar la máxima densidad de información, múltiples relaciones de aspecto y el cliffhanger más complejo.

*   **Vignette 1 (BACKGROUND VIDEO - 100%W x 100%H):**
    *   **Contenido:** El orbe explotando en miles de partículas.
    *   **Z-Index:** El más bajo (0). Todas las demás viñetas nacen "encima" de esta explosión.
*   **Vignette 2, 3, 4 (STRIP VERTICAL - 33%W cada una):**
    *   **Shots:** XCU de diferentes personajes reaccionando.
    *   **Animación Entrada:** `zoomIn` con diferentes `delays` (0s, 0.2s, 0.4s) para crear efecto cascada.
*   **Vignette 5 (CENTER SMALL - OVERLAY):**
    *   **Contenido:** El orbe volviendo a su estado original.
    *   **Timeline Final (T=2.0s):**
        *   `globalEffect: "slowMotion"` (factor 0.3, duración 2s).
        *   `backgroundChange` (Azul → Blanco puro).
        *   `audioControl: "cliffhanger_note"` (Un tono agudo que sube infinitamente).
    *   **SWIPE UP:** Al hacerlo, la app debe limpiar todos los estados de partículas y resets de audio para la "Página de Créditos".

---

### **MATRIZ DE VERIFICACIÓN PARA CURSOR AI (Testing Checklist)**

Para que el agente de IA sepa si ha montado el sistema correctamente, el cómic debe cumplir estas pruebas:

1.  **Prueba de Posicionamiento:** ¿Entran las viñetas desde la dirección correcta según su cuadrícula? (Top -> Down, Left -> Right).
2.  **Prueba de Tipo B:** ¿Es imperceptible la transición del video de Acción al de Loop en la Pág. 2, V1?
3.  **Prueba de Audio:** ¿Se hace el crossfade de 0.5s entre la V1 y la V2 al hacer TAP?
4.  **Prueba de Keyframes:** ¿Aparece la onomatopeya "KRA-KOOM!" exactamente cuando el robot toca el suelo?
5.  **Prueba de 180°:** ¿Mantienen los personajes su posición izquierda/derecha en la secuencia de la Página 2?
6.  **Prueba de Causalidad:** ¿Se apaga realmente el video y el sonido de la V1 cuando interactuamos con la V3 en la Página 3?
7.  **Prueba de Pacing:** ¿Siente el usuario que la Página 3 (Tensión) es más lenta que la Página 2 (Acción) debido al número de TAPs?
8.  **Prueba de Cliffhanger:** ¿El audio de la Página 4 persiste durante el SWIPE y se resuelve en la siguiente?

Este cómic maestro default garantiza que **absolutamente todos** los subsistemas del **LICE REACT** (cinemática, técnica y narrativa) sean validados antes de iniciar la producción masiva de contenido.
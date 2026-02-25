Esta es la especificación técnica definitiva y exhaustiva del **LICE REACT** (Living Illustrated Comic Engine). Este documento ha sido diseñado para servir como el **contexto maestro** para un agente de IA (como Cursor), proporcionando no solo la estructura, sino la lógica profunda, las responsabilidades de cada pieza y las sinergias que permiten que el sistema funcione como un organismo vivo.

---

### **1. VISIÓN GENERAL Y FILOSOFÍA: "LIVING ILLUSTRATION"**

El **LICE REACT** es un motor de narrativa secuencial interactiva diseñado para transformar ilustraciones estáticas en experiencias cinematográficas vivas. Su filosofía se basa en la **"Animación Nivel 5"**: un equilibrio perfecto donde el entorno (clima, luces, partículas) está completamente vivo, mientras que los personajes mantienen una naturaleza contemplativa con micro-movimientos como respiración o parpadeo.

El objetivo es que el usuario no consuma un video pasivo, sino que **construya la página** mediante la interacción:
*   **TAP:** Revela la siguiente viñeta y avanza el tiempo narrativo.
*   **SWIPE UP:** Cambia de página con una transición fluida y continuidad sonora.

---

### **2. LA "FUENTE DE VERDAD": EL SISTEMA JSON-DRIVEN**

La inteligencia del LICE no reside en el código duro, sino en su **capa de datos**. Cada página es una interpretación de un archivo **JSON** que actúa como el "mapa de ruta" para el motor de React.

**Responsabilidades del JSON:**
*   **Geometría Espacial:** Define posiciones y tamaños en un **grid relativo de 100x100**, lo que garantiza que el cómic sea responsive por diseño.
*   **Configuración Cinemática:** Especifica para cada viñeta su **Tipo de Plano** (Long, Medium, Close-up) y su **Ángulo** (Picado, Contrapicado), lo cual determina cómo se anima.
*   **Metasistema de Timelines:** Contiene los **Keyframes** (segundos exactos) donde se dispararán eventos como onomatopeyas, sonidos o cambios de estado.

---

### **3. ARQUITECTURA DE COMPONENTES (EL "CUERPO")**

El proyecto se organiza en componentes de React altamente especializados y desacoplados:

#### **A. Page.tsx (El Orquestador)**
Es el contenedor de alto nivel de una página completa.
*   **Responsabilidad:** Gestiona el ciclo de vida de la página (carga, entrada, salida), controla el color de fondo y detecta el gesto de **SWIPE UP** para la navegación entre páginas.
*   **Sinergia:** Se comunica con el `StateManager` para saber qué viñetas debe renderizar y en qué orden según los TAPs del usuario.

#### **B. Panel.tsx (La Unidad de Acción)**
Es el componente más complejo del sistema, encargado de una viñeta individual.
*   **Responsabilidad:** Ejecuta la **Lógica de Transición ACTION → LOOP**. En viñetas de acción (Tipo B), reproduce el primer video (acción única) y, al finalizar, transiciona de forma imperceptible al segundo video (loop infinito con ambiente vivo).
*   **Subpieza: VideoPlayer.tsx:** Un wrapper del elemento `<video>` de HTML5 que gestiona la reproducción, el muteo y el reporte de tiempos para sincronizar los keyframes.

#### **C. Overlays (Capa de Impacto)**
Capas superiores que renderizan elementos visuales por encima de las viñetas.
*   **Onomatopoeia.tsx:** Renderiza textos dinámicos (BOOM!, SPLASH!) con animaciones de tipo *bounce* o *elastic* gatilladas por el timeline.
*   **GlobalFX.tsx:** Gestiona efectos que cubren toda la página, como el **Camera Shake**, destellos de luz (**Flash**) o sistemas de partículas como lluvia o nieve.

---

### **4. LOS MANAGERS (EL "SISTEMA NERVIOSO")**

Son clases de lógica pura (Singletons conceptuales) encargadas de la orquestación global. Están diseñados en TypeScript para que su lógica sea fácilmente migrada a C# de Unity en el futuro.

#### **A. AudioManager (Jerarquía de Atención)**
Gestiona todo el audio de la página bajo el principio de **"una sola viñeta con prioridad"**.
*   **Responsabilidad:** Realiza **crossfades suaves (0.5s)** entre el audio de la viñeta anterior y la nueva para evitar el caos sonoro. Dado que el audio está **incrustado en los videos**, el manager solo manipula los volúmenes de los elementos de video activos.
*   **Sinergia:** Recibe comandos del `TimelineManager` para lanzar SFX globales o ajustar el volumen de un sonido ambiental (ej. un motor).

#### **B. TimelineManager (Sincronización Temporal)**
Es el motor de ejecución de los keyframes definidos en el JSON.
*   **Responsabilidad:** Monitorea el tiempo de reproducción del panel activo y, al alcanzar un segundo específico, dispara eventos.
*   **Sinergia:** Es el puente entre el video y los efectos. Si un video llega al segundo 1.2, el `TimelineManager` le dice al `EffectsManager` que haga vibrar la pantalla.

#### **C. StateManager (Causalidad Espacial)**
Mantiene el estado único de la verdad de la narrativa.
*   **Responsabilidad:** Almacena variables como la viñeta activa, estados de objetos (ej. "puerta abierta") o climáticos.
*   **Sinergia: Control Remoto.** Permite que una acción en la viñeta 5 afecte visualmente a la viñeta 1 (ej. apagar una luz al fondo), creando una conexión espacial coherente en toda la página.

---

### **5. DINÁMICAS Y SINERGIAS CRÍTICAS**

#### **El Ciclo del TAP (Interacción)**
1.  El usuario hace **TAP**. El `InteractionManager` envía la señal al `StateManager`.
2.  El `StateManager` actualiza el índice de la viñeta activa.
3.  La nueva viñeta aparece con una **Animación de Entrada (0.8s)** calculada según su posición (ej. si está a la izquierda, entra desde la izquierda).
4.  Al completarse la entrada, el `TimelineManager` inicia la ejecución de su partitura de eventos.
5.  El `AudioManager` realiza un fundido para que el audio del nuevo video sea el protagonista.

#### **La Regla de los 180° y Coherencia de Video**
Para asegurar que los videos generados con IA funcionen juntos, el sistema asume que se ha respetado la **regla cinematográfica de los 180°**. Esto garantiza que, si un personaje mira a la derecha en la viñeta 1, mantenga esa dirección en la viñeta 2, evitando confusiones espaciales durante los TAPs.

#### **Pacing: El TAP como Latido**
El diseño de la página utiliza el número de viñetas para controlar el **ritmo emocional**. Muchas viñetas pequeñas con TAPs rápidos crean tensión; pocas viñetas grandes dilatan el tiempo y permiten que la escena "respire".

---

### **6. RESUMEN DE RESPONSABILIDADES PARA EL AGENTE AI**

1.  **Tipado Estricto:** Usa los archivos en `/types` para definir interfaces de C# compatibles (Interfaces en TS = Clases en C#).
2.  **Lógica Desacoplada:** Mantén los `Managers` fuera de los componentes de React para facilitar la migración de lógica pura a Unity.
3.  **Animaciones con GSAP:** Implementa todos los movimientos de entrada y timelines de keyframes usando GSAP, ya que su sintaxis es casi idéntica a la de **DOTween** en Unity.
4.  **Carga de Assets:** Prioriza la carga desde la carpeta local `/assets/pages/`, imitando cómo Unity leería archivos desde el disco local para eliminar el lag de red.

Este sistema está diseñado para que cada pieza sepa exactamente qué hacer, permitiendo que el LICE sea un **organismo narrativo coherente, inmersivo y tecnológicamente robusto**.

---
---
---

Para completar la visión técnica de **LICE REACT** y asegurar que el agente de **Cursor AI** tenga toda la "letra pequeña" necesaria para programar el motor sin errores de sincronización o arquitectura, aquí detallo los aspectos técnicos avanzados que suelen quedar fuera por espacio, pero que son el "pegamento" del código:

### **I. El "Master Clock": Sincronización Video-GSAP**
Aunque GSAP maneja el tiempo, en el LICE el video es el corazón. Para evitar el *desync*, el código debe seguir esta lógica:
*   **Time-driven Execution:** No uses `setTimeout`. Utiliza el evento `onTimeUpdate` del elemento `<video>` o un `requestAnimationFrame` que compare el `video.currentTime` con los keyframes del JSON.
*   **GSAP Seek:** El timeline de GSAP de cada viñeta debe estar en pausa por defecto. Al activarse la viñeta, el video hace `play()` y el timeline de GSAP debe sincronizarse: `gsapTimeline.seek(video.currentTime)`. Esto garantiza que si el video se laguea, la onomatopeya o el efecto no se adelanten.

### **II. Arquitectura del State Manager (Zustand Store)**
Para que el agente de IA cree un store robusto, debe incluir estos estados específicos:
*   **`pageState`:** `{ currentPanelIndex: number, isSwipeLocked: boolean, activeAudioId: string }`.
*   **`globalEffects`:** `{ isShakeActive: boolean, flashColor: string | null, globalWeather: 'rain' | 'none' }`.
*   **`panelRegistry`:** Un mapa de referencias a los nodos de video y audio para que el `AudioManager` pueda hacer crossfades directamente sobre los elementos del DOM.

### **III. El Ciclo de Vida Técnico del Panel (Component Logic)**
El componente `Panel.tsx` debe gestionar una máquina de estados interna para evitar parpadeos en las viñetas **TIPO B (ACCIÓN)**:
1.  **Pre-mount:** Cargar `action.mp4` y `loop.mp4` con `preload="auto"`.
2.  **Mount:** Renderizar ambos videos uno encima del otro. El de loop con `opacity: 0` o `visibility: hidden`.
3.  **Active:** Disparar el video de acción.
4.  **The Switch:** Escuchar el evento `onEnded` del video de acción. En ese preciso milisegundo:
    *   Hacer `loopVideo.play()`.
    *   Intercambiar opacidades (Crossfade visual de 0.1s para suavizar la transición).
    *   Notificar al `AudioManager` para que cambie la pista de audio de acción a la de ambiente.

### **IV. Sistema de Coordenadas y Grid 100x100**
Para que la IA no sufra con el CSS responsive:
*   **Container de Página:** Debe tener una relación de aspecto fija (ej. 9:16 para vertical). Usa `aspect-ratio` en CSS.
*   **Cálculo de Posición:** Todas las viñetas deben usar `top`, `left`, `width` y `height` en `%` basándose estrictamente en el JSON.
*   **Z-Index Dinámico:** El `zIndex` de la viñeta debe ser `index + 10`. Esto permite que las onomatopeyas y efectos de la viñeta actual siempre tapen a las anteriores.

### **V. Implementación del "Control Remoto" (Causalidad)**
Este es el punto más complejo de programar. La IA debe implementar un **Bus de Eventos**:
1.  El `TimelineManager` de una viñeta detecta un keyframe con `type: "visualControl"` y `target: "Panel_1"`.
2.  En lugar de buscar el componente, debe disparar una acción al `StateManager`: `updatePanelState("Panel_1", { videoState: "stopped" })`.
3.  El componente `Panel_1`, que está "escuchando" ese estado mediante un hook de Zustand, reacciona cambiando su video o aplicando un filtro CSS de "apagado".

### **VI. AudioManager: Gestión de Nodos Reales**
Dile a Cursor AI que el `AudioManager` no debe crear nuevos objetos `Audio`. Debe manipular los **elementos de audio incrustados** en los tags de `<video>`:
*   **Mute Progresivo:** Al cambiar de panel, no silencies de golpe. Usa GSAP para hacer un tween del volumen del nodo de video: `gsap.to(videoElement, { volume: 0, duration: 0.5 })`.
*   **Audio Global:** Los sonidos de lluvia o motores deben ser elementos `<audio>` independientes en el `Layout` principal, controlados globalmente para que no se reinicien al cambiar de viñeta.

### **VII. Optimización de Memoria (The Unity Bridge)**
Para facilitar la migración, el código de React debe ser "limpio":
*   **Cleanup:** Cada vez que cambie una página, el `ResourceManager` debe invocar `.load()` con un src vacío en los videos que salen para liberar la memoria de video de la GPU (especialmente crítico en dispositivos móviles).
*   **Strict Types:** Define cada interfaz del JSON (`IPageConfig`, `IPanelConfig`, `IKeyframe`) en archivos `.d.ts` separados. Esto es lo que Cursor usará para crear los `ScriptableObjects` en Unity después.

Con estas especificaciones, el agente de IA tiene suficiente contexto para entender que **LICE REACT** no es solo una galería de videos, sino un sistema de **eventos sincronizados en tiempo real** impulsado por datos.
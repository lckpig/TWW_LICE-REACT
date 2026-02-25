Esta es la **arquitectura definitiva y exhaustiva** de archivos y carpetas para **LICE REACT**. 

Esta estructura no solo ha sido diseñada para que el motor de React funcione con una precisión cinematográfica milimétrica, sino que está **optimizada para la migración a Unity**. Cada carpeta y archivo tiene una responsabilidad única ("Single Responsibility Principle") y utiliza una nomenclatura que los agentes de IA (como Cursor) podrán mapear directamente a clases de C# y GameObjects de Unity en el futuro.

---

### **LICE REACT: ARQUITECTURA DE CARPETAS "CINEMATIC-READY"**

```text
/lice-react-root
├── /public                     # Assets estáticos de sistema (favicon, loaders)
├── /src
│   ├── /assets                 # EL DEPÓSITO MULTIMEDIA (Organizado por escena)
│   │   ├── /shared             # SFX globales, partículas comunes, música de fondo
│   │   └── /pages              # Carpeta por página del cómic
│   │       ├── /page-01        # Videos ACTION/LOOP con audio incrustado
│   │       │   ├── p01_v01_long_loop.mp4
│   │       │   ├── p01_v02_med_action.mp4
│   │       │   ├── p01_v02_med_loop.mp4
│   │       │   └── p01_sfx_extra.mp3
│   │       └── /page-02
│   ├── /components             # LA CAPA VISUAL (Componentes de React)
│   │   ├── /Layout             # Estructura de la aplicación (AppShell, Navigation)
│   │   ├── /Page               # El Orquestador de la página completa
│   │   │   ├── Page.tsx        # Lógica de entrada/salida de página (Swipe)
│   │   │   └── Page.module.css # Estilos del grid 100x100
│   │   ├── /Panel              # La unidad mínima (Viñeta)
│   │   │   ├── Panel.tsx       # Lógica ACTION -> LOOP y Timelines locales
│   │   │   ├── VideoPlayer.tsx # Wrapper de <video> para control fino de volumen
│   │   │   └── Panel.module.css# Animaciones de entrada (translate/zoom)
│   │   └── /Overlays           # Capas superiores (Onomatopeyas, Efectos Globales)
│   │       ├── Onomatopoeia.tsx# Textos dinámicos (Bounce/Elastic)
│   │       └── GlobalFX.tsx    # Flash, Shake, Particle Canvas
│   ├── /config                 # LA FUENTE DE VERDAD (JSON Driven)
│   │   ├── /manifest           # Índice de la historia (Orden de páginas)
│   │   │   └── story-manifest.json
│   │   └── /pages              # Configuración cinemática por página
│   │       ├── page-01.json    # Posiciones, Shot Types, Timelines, 180° Rule
│   │       └── page-02.json
│   ├── /context                # GESTIÓN DE ESTADO (React Context / Zustand)
│   │   ├── NarrativeContext.tsx# Estado de la historia (Página actual, Progreso)
│   │   └── UIContext.tsx       # Estado de la interfaz (Mute, Settings)
│   ├── /hooks                  # LÓGICA REUTILIZABLE (GSAP & Interaction)
│   │   ├── useGSAPTimeline.ts  # Hook para crear y controlar timelines de GSAP
│   │   ├── useInteraction.ts   # Lógica de detección de TAP y SWIPE
│   │   └── useAudioSync.ts     # Sincronización de crossfades de volumen
│   ├── /managers               # LÓGICA DE NEGOCIO (Singletons para Unity)
│   │   ├── AudioManager.ts     # El "Director de Orquesta" del sonido
│   │   ├── EffectsManager.ts   # Lanzador de Shakes, Flashes y Partículas
│   │   └── ShotManager.ts      # Validador de tipos de plano y reglas cinemáticas
│   ├── /types                  # EL PUENTE A UNITY (Interfaces TypeScript)
│   │   ├── cinematic.d.ts      # Definiciones de ShotType, Angle, 180Rule
│   │   ├── timeline.d.ts       # Definiciones de Keyframes y Eventos
│   │   └── config.d.ts         # Estructura estricta del JSON
│   ├── /utils                  # UTILIDADES TÉCNICAS
│   │   ├── coordinates.ts      # Conversión de % a px y Grid 100x100
│   │   └── constants.ts        # Valores fijos (Duración entrada 0.8s, etc.)
│   ├── App.tsx                 # Punto de entrada de la aplicación
│   └── main.tsx                # Configuración de Vite/React
├── index.html
├── package.json
├── tsconfig.json               # Configuración estricta para migración C#
└── vite.config.ts
```

---

### **DESGLOSE DETALLADO DE LOS MÓDULOS CRÍTICOS**

#### **1. Carpeta `/types` (El ADN del Proyecto)**
Es la más importante para que la **IA (Cursor)** trabaje por ti. Al definir interfaces estrictas, la IA sabrá exactamente qué esperar.
*   **`cinematic.d.ts`**: Aquí definirás los enums `ShotType` (LONG, MEDIUM, CLOSE_UP) y `Angle` (LOW, HIGH, PROFILE). Cuando migres a Unity, Cursor leerá estas interfaces y creará los **ScriptableObjects** correspondientes.
*   **`timeline.d.ts`**: Define la forma de un evento: `{ time: number, type: string, data: any }`.

#### **2. Carpeta `/config` (La Inteligencia del Cómic)**
Aquí reside el **Shot List** cinematográfico convertido en datos.
*   **`page-01.json`**: No solo guarda rutas de archivos, guarda el **Pacing Profile** (cuántos TAPs requiere la página) y las **Guías Visuales** (hacia dónde debe mirar el usuario para el siguiente TAP). 
*   **Coherencia 180°**: En el JSON se marca el eje espacial para que el motor valide que el siguiente video mantiene la posición de los personajes.

#### **3. Carpeta `/managers` (El Motor de Comportamiento)**
Estos archivos no son componentes de React, son **clases de lógica pura**.
*   **`AudioManager.ts`**: Implementa la jerarquía de audio. Sabe que si la Viñeta 2 se activa, debe hacer un `fade` al volumen del video de la Viñeta 1. Al estar separado de React, este archivo se traduce casi línea por línea a un `AudioManager.cs` en Unity.
*   **`EffectsManager.ts`**: Gestiona el "Camera Shake" global. Si una viñeta lanza un evento de impacto, este manager aplica la vibración a toda la página.

#### **4. Carpeta `/components/Panel` (La Unidad de Acción)**
*   **`Panel.tsx`**: Contiene la lógica del **Tipo B (ACCIÓN)**. Gestiona el cambio imperceptible del Video 1 al Video 2. Utiliza GSAP para la animación de entrada (0.8s) basándose en las coordenadas del JSON.
*   **`VideoPlayer.tsx`**: Es un wrapper que oculta la complejidad de la etiqueta `<video>`. Expone métodos simples como `setVolume(v)`, `playFromStart()` y `syncWithMaster()`.

#### **5. Carpeta `/assets` (Gestión de Recursos)**
Organizar los videos por `page-XX` es vital para la **gestión de memoria**.
*   En **React**, esto permite usar `Dynamic Imports` para cargar solo los videos de la página actual.
*   En **Unity**, esta estructura de carpetas se convierte directamente en **AssetBundles** o carpetas de **Addressables**, permitiendo que la App pese poco y descargue solo lo necesario.

---

### **FLUJO DE SINERGIA: CÓMO TRABAJAN ESTAS CARPETAS JUNTAS**

1.  **Carga**: El `PageManager` lee el `page-01.json` de `/config`.
2.  **Preparación**: El `ResourceManager` empieza a descargar los videos de `/assets/pages/page-01`.
3.  **Interacción**: El usuario hace **TAP**. El `InteractionManager` detecta la señal y avisa al `NarrativeContext`.
4.  **Activación**: El `Panel.tsx` correspondiente recibe la orden, inicia su animación de entrada (0.8s) usando un hook de `/hooks`.
5.  **Ejecución**: Al terminar la entrada, el `TimelineManager` dispara los keyframes.
6.  **Audio**: El `AudioManager` detecta la nueva viñeta activa y gestiona los volúmenes de los videos incrustados para que no haya caos sonoro.
7.  **Efectos**: Si hay un keyframe de "Flash", el `EffectsManager` activa el overlay en `/components/Overlays`.
8.  **Pacing**: Cuando el usuario llega al final, el `Cliffhanger` visual invita al **SWIPE UP**, cerrando el ciclo.

### **POR QUÉ ESTA ESTRUCTURA ES "LA MEJOR"**
*   **Para el Programador**: Es modular y fácil de testear.
*   **Para la IA (Cursor)**: Es predecible y está fuertemente tipada.
*   **Para el Cineasta**: Refleja fielmente el **Shot List** y las reglas de dirección.
*   **Para el Futuro**: La transición a **Unity** será un proceso de "copiar lógica y pegar en C#", no de rediseñar el sistema.

¿Estás listo para que generemos el **Shot List** de la primera página basándonos en esta estructura?
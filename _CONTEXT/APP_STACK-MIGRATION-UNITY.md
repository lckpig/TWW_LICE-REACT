@APP_STACK-REACT.md

Para asegurar una migración fluida de la versión **React** a **Unity** utilizando agentes de IA como **Cursor**, el stack debe priorizar herramientas que tengan equivalentes casi directos en el entorno de C# y el motor de Unity.

Basándome en los análisis técnicos de las fuentes, este es el stack que mejor garantiza esa transición sencilla:

### **1. Lenguaje: React + TypeScript**
Es fundamental utilizar **TypeScript** en lugar de JavaScript. 
*   **Razón de migración:** El tipado estático, las interfaces y las clases de TypeScript tienen una estructura lógica muy similar a **C#**. Esto permite que los agentes de IA (como Cursor) puedan traducir la lógica de los componentes, modelos de datos y servicios de una manera casi literal.

### **2. Animación: GSAP (GreenSock Animation Platform)**
Esta es la pieza más crítica para que la migración sea "1:1".
*   **Equivalente en Unity:** **DOTween** (HOTween v2).
*   **Sinergia:** La sintaxis de GSAP (`gsap.to`, `gsap.timeline`, `.set`, `.play`) es conceptual y estructuralmente idéntica a la de DOTween (`transform.DOMove`, `DOTween.Sequence`, `.SetDelay`, `.Play`). Un agente de IA podrá convertir las líneas de animación de un archivo `.ts` a uno `.cs` con un margen de error mínimo.

### **3. Configuración y Datos: JSON Dinámico**
Toda la lógica de las páginas, viñetas, timings y rutas de assets debe vivir en archivos **JSON**.
*   **Razón de migración:** Unity maneja JSON de forma nativa o mediante librerías como Newtonsoft.JSON. Los esquemas de datos definidos en React servirán como la "fuente de verdad" única; solo tendrás que pedirle a Cursor que genere los **ScriptableObjects** o clases de C# correspondientes basándose en tus interfaces de TypeScript y el esquema JSON.

### **4. Gestión de Estado: Zustand**
Aunque se mencionan Redux o Context, **Zustand** es la opción más limpia para migrar.
*   **Razón de migración:** Su enfoque basado en hooks simples y un store centralizado se traduce muy bien a los patrones de **Singletons** o **Managers** globales en Unity. Es mucho más sencillo de explicar a una IA que la complejidad de Redux.

### **5. Gestión de Audio: Howler.js**
*   **Razón de migración:** Howler organiza el audio mediante identificadores y sprites, lo cual encaja perfectamente con el **Audio Manager** centralizado que necesita Unity. Al usar Howler en React, ya estarás estableciendo la lógica de *fades* y *crossfades* que luego DOTween aplicará sobre los `AudioSource` de Unity.

### **6. Sistema de Video: HTML5 Video + CSS (Absolute Positioning)**
*   **Razón de migración:** Al posicionar las viñetas mediante porcentajes relativos en el CSS de React (grid 100x100), Cursor podrá replicar esa maquetación en el sistema **RectTransform (Canvas UI)** de Unity con coordenadas exactas, asegurando que el cómic sea responsive en ambas plataformas.

### **Resumen del Pipeline de Migración para Cursor:**
1.  **Interfaces:** Pasa tus archivos `.d.ts` a Cursor y pídele: *"Convierte estas interfaces de TypeScript a clases C# para Unity"*.
2.  **Timelines:** Pasa tus componentes de GSAP y dile: *"Traduce estas secuencias de GSAP a DOTween Sequences en C# para mi PanelController"*.
3.  **Data:** Pasa tu JSON de configuración y dile: *"Crea un sistema que cargue este JSON en Unity usando estos ScriptableObjects"*.

Este stack minimiza la reescritura creativa y maximiza la traducción técnica por parte de la IA.
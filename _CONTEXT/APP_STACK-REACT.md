Para desarrollar la versión de **LICE React** optimizada para una futura migración a **Unity** mediante agentes de IA (como Cursor), el stack debe ser técnico, tipado y basado en equivalencias directas.

Este es el stack completo y definitivo para **LICE REACT**:

### **1. Lenguaje y Core**
*   **React:** Framework principal para la gestión de componentes y la UI.
*   **TypeScript:** **Obligatorio.** Es la pieza clave para que la IA pueda traducir luego las interfaces y modelos de datos a C# de Unity de forma casi literal.
*   **Vite:** Herramienta de construcción (build tool) por su rapidez y soporte nativo de módulos ESM.

### **2. Animación y Sistema de Timeline**
*   **GSAP (GreenSock Animation Platform):** Es el motor de todo el sistema. 
    *   **Razón:** Su estructura de `Timeline` y `Tweens` tiene una equivalencia del 100% con **DOTween** en Unity. La IA podrá convertir el código de animación simplemente cambiando la sintaxis pero manteniendo la lógica temporal.

### **3. Gestión de Audio**
*   **Howler.js:** Biblioteca para el manejo de audio.
    *   **Razón:** Permite gestionar el **Audio Manager** centralizado, los *crossfades* de volumen y los sonidos integrados en los vídeos o independientes (SFX) de forma mucho más robusta que la API nativa.

### **4. Estado y Datos**
*   **Zustand:** Para la gestión del estado global (página actual, viñetas visibles, estados narrativos como "motor encendido").
    *   **Razón:** Su patrón de "store" es mucho más sencillo de migrar a los *Singletons* o *Managers* de C# que Redux o Context.
*   **JSON:** El formato universal para el **Shot List** y la configuración de las páginas.
    *   **Razón:** Es la "fuente de verdad". El mismo JSON que lea React será el que lea Unity para posicionar viñetas en el grid 100x100.

### **5. Estilos y Layout**
*   **CSS Modules + PostCSS:** Para el estilo de los contenedores.
*   **Posicionamiento Absoluto (%):** Las viñetas deben posicionarse usando porcentajes en un **grid relativo de 100x100**.
    *   **Razón:** Esto facilita que la IA traduzca las coordenadas directamente al sistema **RectTransform (Anchors)** del Canvas de Unity.

### **6. Manejo de Video**
*   **HTML5 Video Element:** Uso de la etiqueta nativa de video, integrada en un componente de React controlado por el `Timeline` de GSAP.
    *   **Configuración:** Los videos (LOOP y ACTION) llevarán el **audio incrustado** para simplificar la sincronización al máximo.

### **Resumen de Sinergias para la IA (Cursor)**
Al usar este stack, cuando pidas la migración, el flujo será:
1.  **Interfaces TS** → Clases C#.
2.  **GSAP Timelines** → DOTween Sequences.
3.  **JSON Config** → ScriptableObjects de Unity.
4.  **Zustand Stores** → Managers de C#.

¿Deseas que genere una **guía técnica detallada** o prefieres que cree un **Tailored Report** con la estructura completa de este stack para usarlo como contexto en Cursor?
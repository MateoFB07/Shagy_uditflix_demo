# Arquitectura de la demo

## Responsabilidades

React monta una sola pantalla (`HomePage`) dentro de `IonApp`. Los componentes presentan HTML semántico, SVG y controles personalizados. `CatalogCard` recibe datos tipados. Los motores de `animations/` se inicializan tras el montaje y manipulan sólo la geometría, la visibilidad y los estados transitorios de sus elementos, sin re-renderizar React a cada fotograma. `HomePage` libera los recursos al desmontar. Se trata de una migración híbrida de preservación visual; los controladores aún utilizan selectores y estado local imperativo. No se ha reescrito toda la lógica en hooks o TypeScript.

## Flujo actual

- Cinta: `ribbon.js` actualiza la fase, nombre, índice y velocidad. El atlas se carga desde `public/assets/ribbon-atlas.jpg`. `ribbonGPU.js` crea una malla estática al redimensionar y realiza el dibujo indexado con shaders. El controlador conserva Canvas 2D optimizado como fallback.
- Atmósfera: `atmosphere.js` observa el índice destacado y lee la velocidad de la cinta; mantiene su propia simulación y cambia de color gradualmente. `atmosphereGPU.js` evalúa las veladuras en el fragment shader; el fallback reduce resolución y frecuencia. `gpu.js` administra superficies, programas, texturas y buffers. Ambos motores suspenden sus bucles fuera de pantalla o en pestañas ocultas. `performance.js` es un diagnóstico opcional.
- Catálogo: `catalog.js` filtra tarjetas React ya montadas; el scroll vertical controla el ancho de cada tarjeta; las fichas se abren con `dialog.showModal()`.
- Menú y navegación: sincronizan los filtros mediante los controles existentes, conservando la animación de desplazamiento del prototipo.
- El CSS mantiene el orden original de las cuatro hojas. El puente de Ionic conserva el scroll del documento; no envolver la pantalla en `IonContent` sin adaptar el motor de scroll.

## Siguiente fase (no implementada)

1. Pasar el estado compartido de selección, filtros y detalle a React (hooks/contexto) y tipar gradualmente los motores.
2. Añadir navegación por rutas y pantallas de cómic, teaser y videojuego cuando se definan sus requisitos.
3. Crear capa de servicios y repositorios cuando se acuerde el contrato de la API.
4. Validar accesibilidad, rendimiento y ciclo de vida en Android físico; generar proyecto nativo y pruebas automatizadas.

No añadir carpetas vacías ni servicios ficticios solo para simular arquitectura. Los nuevos módulos se crean cuando existan funcionalidades concretas.

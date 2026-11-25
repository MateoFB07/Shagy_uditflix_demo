# Verificación de la migración

## Comprobado en este entorno

- Los 19 recursos JPEG se extrajeron del prototipo 20 sin recomprimir.
- Comprobación de sintaxis de los módulos JavaScript con Node.js y transpilación sintáctica TS/TSX con TypeScript.
- Prueba funcional de los componentes React y los motores migrados en Chromium (1440×900, 390×844 y 320×700). El entorno de prueba utilizó React 16 disponible localmente y un elemento `ion-app` simulado; los recursos se cargaron como data URI para evitar las restricciones del navegador de pruebas. No equivale a una compilación del stack definitivo.
- En las tres resoluciones: catálogo con nueve títulos, siguiente/pausa de la cinta, ficha modal, cambios de fotograma de la atmósfera, apertura y cierre del menú mediante Escape, filtro de teasers, búsqueda sin resultados y restauración del catálogo. Sin errores JavaScript ni desbordamiento horizontal en esas pruebas. Desmontaje sin errores observados.

## Pendiente de validar en local

El registro npm no estuvo accesible (error DNS EAI_AGAIN), de modo que no se pudieron instalar Ionic React 8, React 18, Vite y Capacitor ni ejecutar `npm run build`, la comprobación completa de tipos o el empaquetado Android. Tampoco se generó `package-lock.json`. Ejecutar los comandos del README con conexión a npm y revisar el renderizado real de Ionic y en Android antes de presentar la demo como compilada.

## Actualización 0.2.0

Se han validado los dos pares de shaders mediante compilación y enlace de GLSL ES con Mesa (llvmpipe). La prueba de navegador usa el fallback Canvas 2D: WebGL no está disponible en el Chromium del entorno. Se han repetido las pruebas funcionales del catálogo, cinta, atmósfera, menú y ficha en 1440, 390 y 320 px, utilizando React local y contenedor Ionic simulado. El benchmark comparativo y sus límites están documentados en [rendimiento.md](rendimiento.md). La instalación completa con npm, `npm run build` y la ejecución WebGL/Android real siguen pendientes para esta nueva versión.

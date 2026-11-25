# Performance Update · 0.2.0

## Perfil de partida (captura del usuario)

- INP: 736 ms y 964 ms; LCP: 0,63 s; CLS: 0,02 en primera captura.
- `setTransform`: 51,6 % de self time en la tabla Bottom-up; `ribbon.js:draw`: 64,7 % de total time; `atmosphere.js:draw`: 24,7 % de total time. Los porcentajes de total time incluyen llamadas descendientes y no se deben sumar con self time.

## Implementación

- Cinta: WebGL 1 directo; una malla indexada de 180 × 12 celdas. Geometría base precalculada al redimensionar. Fase de textura, deformación, profundidad y efectos ópticos mediante GLSL. Una llamada drawElements por fotograma en WebGL. Se conservan los puntos originales de las curvas, la fase y los controles. Desenfoque y aberración aproximados por muestreo de textura, no idénticos píxel a píxel al Canvas anterior.
- Atmósfera: un cuadrilátero en WebGL; ruido determinista de textura y las ecuaciones originales de veladuras en GLSL. Conserva sincronización, intensidad y colores.
- Alternativa CPU: cinta con subdivisiones adaptadas a los tramos curvos y rectos, sin cálculo repetido de normales ni malla tan densa; dibujo limitado a intervalos de 32 ms. Atmósfera a 200 px de ancho en escritorio / 120 en móvil, con cadencia objetivo de hasta 15 Hz. Puede verse menos detallada y menos fluida que WebGL. Resolución de la cinta limitada por densidad de píxel y presupuesto de 1,1 millones de píxeles.
- Visibilidad: suspensión de los bucles gráficos cuando quedan fuera de pantalla o la pestaña está oculta. Fallback si no se obtiene WebGL o se pierde el contexto. Liberación de recursos al desmontar.
- Catálogo: caché de anchura y posición de la sección, reducción de escrituras CSS en paneles sin cambios. No se ha eliminado completamente el cálculo de layout inherente a la animación de anchuras.
- Sin nuevos paquetes de npm. No se ha utilizado Three.js: WebGL directo es suficiente para estas dos escenas y evita aumentar el bundle.

## Comparación local (no es una prueba de GPU ni un benchmark de producción)

Chromium con WebGL desactivado en ambos casos; React local y contenedor Ionic simulado; 1440 × 900, DPR 1, intensidad Media, cinta automática, tras 1,5 s de calentamiento. Instrumentación de Canvas y callbacks rAF durante aproximadamente 3,5 s por versión. Una muestra por versión, resultados orientativos sujetos a variación.

| Indicador | 0.1.0 | 0.2.0 |
|---|---:|---:|
| Frecuencia rAF (aproximación FPS) | 24,8 | 40,5 |
| Intervalo rAF p95 (ms) | 50,1 | 33,4 |
| Transformaciones de cinta por dibujo | 2201 | 969 |
| Píxeles de humo calculados por actualización | 121920 | 21200 |
| Dibujos de cinta fuera de pantalla (800 ms) | 27 | 0 |

Se midieron 87 y 83 dibujos de cinta, respectivamente; 61 y 44 actualizaciones de humo. La cinta CPU limita su frecuencia intencionadamente, así que la frecuencia rAF de toda la página no representa los FPS efectivos de la cinta. No se ha medido INP en el ordenador del usuario ni se garantiza alcanzar 60 FPS. Los programas GLSL compilaron y enlazaron con Mesa OpenGL ES (llvmpipe). Chromium de este entorno no habilitó contextos WebGL: queda por probar la integración en navegador real, la equivalencia visual del shader y el rendimiento de GPU.

## Repetir en el ordenador del usuario

1. Conservar la versión 0.1.0 y descomprimir esta versión en otra carpeta.
2. `npm install`, `npm run build`, `npm run preview`.
3. Abrir `http://localhost:4173/?perf=1` (ajustar puerto si Vite indica otro). Verificar los motores indicados. Repetir con `?perf=1&renderer=cpu` para comparar el fallback.
4. Medir en Performance: 10 s de cinta automática, avanzar, retroceder, abrir ficha, scroll a Explorar, volver arriba. Mantener resolución y atmósfera constantes entre versiones.
5. Comparar INP, tareas largas, frame intervals y Bottom-up. Desactivar el HUD en uso normal.

Objetivo: INP ≤200 ms, 60 FPS de escritorio si el hardware lo permite, 30–60 FPS en móvil. Validar en Android físico. No hay APK ni dependencias instaladas en el ZIP.

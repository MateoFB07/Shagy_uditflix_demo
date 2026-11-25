# Uditflix Demo · 0.2.0

Proyecto integrador de 2.º DAM — Desarrollo de Interfaces. Migración del prototipo 20 (Veladuras) a Ionic React + TypeScript + Vite + Capacitor. Aplicación web de una sola pantalla, preparada para empaquetado Android. No es todavía un producto completo.

## Requisitos y ejecución

Node.js 22 LTS recomendado (mínimo 20.19), npm y un navegador actualizado.

```bash
npm install
npm run dev
```

Abre la URL indicada por Vite (normalmente http://localhost:5173). No abras `index.html` directamente. Para acceder desde un móvil en la misma red, usa la URL de red indicada por Vite, si el firewall lo permite.

```bash
npm run typecheck
npm run build
npm run preview
```

El resultado de compilación se guarda en `dist/`. La primera instalación crea `package-lock.json`; conviene añadirlo al repositorio y utilizar `npm ci` después. No se incluyen dependencias descargadas ni binarios.

## Diagnóstico de rendimiento (0.2.0)

Después de `npm run build` y `npm run preview`, abre la URL de Vite con `?perf=1`, por ejemplo `http://localhost:4173/?perf=1`. Verás la frecuencia de callbacks de animación del navegador (aproximación a FPS, no medición de presentación GPU), los renderizadores activos y las tareas largas observadas. Normalmente el diagnóstico no aparece ni ejecuta su bucle.

- `?perf=1`: diagnóstico con selección automática de WebGL / Canvas 2D.
- `?perf=1&renderer=cpu`: fuerza la alternativa Canvas 2D optimizada para comparar.
- Sin parámetros: interfaz normal.

Si aparece `canvas2d`, comprueba la aceleración de gráficos en Chrome (`chrome://gpu`) y que WebGL esté disponible. No desactives protecciones del navegador. Compara en producción con la misma resolución e intensidad de atmósfera, sin limitación artificial de CPU, y exporta una traza Performance. Consulta [docs/rendimiento.md](docs/rendimiento.md).

## Android (opcional)

Instala Android Studio y los requisitos de Capacitor 7 (JDK 21 y SDK Android correspondiente). Ejecuta una vez `npm run build` y `npm run android:add`. Después, cada vez que cambies la web:

```bash
npm run android:sync
npm run android:open
```

Android Studio permite ejecutar la app en emulador o dispositivo. El proyecto nativo se genera localmente; no se incluye un APK ni el directorio `android/` aún. El identificador provisional es `com.uditflix.demo`. iOS no está configurado en esta demo.

## Estructura

- `src/components/`: componentes React del encabezado, cinta, controles, atmósfera, catálogo, ficha y menú.
- `src/pages/home/`: composición de la pantalla y ciclo de vida de los motores.
- `src/animations/`: motores gráficos y controladores migrados del HTML original; JavaScript aislado. `runtime.js` libera listeners, observadores, temporizadores y frames al desmontar.
- `src/data/catalog.ts`, `src/models/catalog.ts`: datos de ejemplo y modelo tipado.
- `src/theme/`: CSS original separado por responsabilidad, más puente con Ionic.
- `public/assets/`: atlas de la cinta, nueve portadas y nueve imágenes de arte extraídos sin recomprimir.
- `docs/`: notas de arquitectura y verificación.

## Diseño y alcance

Se conservan la cabecera Trazo, la geometría de la cinta, sus portadas, las veladuras procedurales con tres intensidades, los controles editoriales, el acordeón por scroll, el menú de mosaico y las fichas de ejemplo. El catálogo se genera con componentes React y un modelo TypeScript. El resto de motores conservan su lógica imperativa para evitar diferencias de render y se montan/desmontan mediante el ciclo de vida React. La versión 0.2.0 activa dos renderizadores WebGL directos con GLSL y conserva Canvas 2D como alternativa. La cinta usa una malla con las curvas originales; las veladuras reutilizan las ecuaciones originales. No se añade Three.js ni ninguna dependencia nueva: para esta escena de una sola malla y un efecto de fondo se utiliza WebGL directamente. La calidad del desenfoque y la aberración puede variar ligeramente entre renderizadores.

Ionic aporta `IonApp` y su inicialización. Se mantiene el scroll del documento en vez de `IonContent`, porque el acordeón depende de `window.scrollY` y de `position: sticky`. No hay enrutamiento multipágina, API, autenticación, lector, reproductor ni lógica de videojuegos todavía. No se incluyen datos reales de usuarios. Consulta `docs/arquitectura.md` antes de ampliar las pantallas.

## Estado de validación

Consulta [docs/verificacion.md](docs/verificacion.md) para conocer las pruebas realizadas y las pendientes. La compilación completa con Ionic y la ejecución WebGL en navegador/Android físico quedan pendientes para esta actualización. Los shaders se han compilado y enlazado en Mesa OpenGL ES, y se ha probado el fallback en Chromium con React local y un contenedor Ionic simulado.

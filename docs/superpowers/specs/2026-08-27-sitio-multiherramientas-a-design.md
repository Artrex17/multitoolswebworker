# Sitio multiherramientas — Sub-proyecto A: base del sitio + herramientas de cliente

## Contexto

Se está construyendo una web de utilidades variadas (conversión de archivos y
generadores) monetizada con anuncios en los laterales. El alcance completo
incluye varios subsistemas independientes:

- **A (este spec):** carcasa del sitio + herramientas 100% cliente (sin backend).
- **B (futuro):** conversión de documentos (PDF↔Word/Excel, unir/dividir) — requiere servidor.
- **C (futuro):** conversión de audio/vídeo — requiere servidor.
- **D (descartado, 2026-08-27):** descargador de contenido de redes sociales
  (TikTok/Instagram/YouTube). Se decidió no construirlo: viola los ToS de las
  plataformas (riesgo de DMCA), requeriría infraestructura de servidor nueva
  que Cloudflare Workers no puede correr (típicamente `yt-dlp` en un VPS o
  servidor propio), y el riesgo más importante es que Google AdSense revoca
  cuentas con bastante agresividad en sitios que ofrecen este tipo de
  descarga — pondría en riesgo la monetización de **todo** el sitio, no solo
  de esta herramienta. No retomar sin volver a evaluar este trade-off.

Este documento cubre únicamente **A**. B/C/D se planificarán como
sub-proyectos independientes cuando llegue su turno.

## Objetivo

Lanzar rápido un sitio estático, rápido y SEO-friendly con herramientas de
conversión/generación que corren enteramente en el navegador, con anuncios
(Google AdSense) en los laterales, en español e inglés.

## Alcance de herramientas (v1)

- **Imagen:** PNG/JPEG ↔ WebP, redimensionar, comprimir.
- **Imagen:** PNG/JPEG → SVG (vectorizado) y SVG → PNG/JPEG.
- **Datos/texto:** JSON ↔ CSV, formateador de JSON, contador de palabras/caracteres.
- **Generadores:** QR, hash (SHA-256/512), UUID, contraseñas.

Fuera de alcance para v1: MD5 (no nativo, sin librería extra por ahora),
cualquier conversión que no pueda resolverse en el navegador.

## Arquitectura

- **Framework:** Astro, salida 100% estática (SSG), sin backend.
- **Interactividad:** cada herramienta es una "isla" de TypeScript vanilla
  (`client:load` solo en el widget de la herramienta). Sin framework de UI
  (React/Vue/Svelte) — no aporta nada frente a formularios + Canvas API y
  añade peso muerto a cada página.
- **Hosting:** Cloudflare Pages (CDN global gratuito, HTTPS automático,
  despliegue desde git). Elegido en vez de auto-alojamiento por latencia,
  ancho de banda residencial limitado y riesgo de ToS del ISP.

## Estructura del sitio / i18n

- Rutas `/es/...` y `/en/...` vía el i18n routing nativo de Astro (sin
  librería de i18n externa).
- Cada herramienta vive en su propia URL (ej. `/es/imagen/comprimir`,
  `/en/image/compress`) con su propio `<title>` y meta description — mejor
  SEO que una SPA de herramientas en una única URL.
- `/es/` y `/en/` como páginas índice/hub que enlazan a todas las herramientas.

## Anuncios

- Componente Astro reutilizable `<AdSlot />` para los dos slots laterales
  (izquierda/derecha, `position: sticky`), con el script de AdSense cargado
  una vez desde el layout base.
- En móvil los laterales se ocultan (no hay sitio) y se muestra un slot
  horizontal entre el contenido descriptivo y el widget de la herramienta.
- En desarrollo (`import.meta.env.DEV`) los slots muestran un placeholder
  gris en vez de intentar cargar anuncios reales.

## Librerías (criterio: nativo → librería pequeña solo si la conversión es compleja)

| Función | Solución |
|---|---|
| Redimensionar / comprimir / PNG↔JPEG↔WebP | Canvas API nativo |
| SVG → PNG/JPEG | Canvas API nativo (dibujar el SVG en un `<canvas>`) |
| PNG/JPEG → SVG (vectorizado) | `imagetracer.js` (sin dependencias) |
| Hash SHA-256/512 | Web Crypto (`SubtleCrypto`) nativo |
| QR | Generador de Nayuki (sin dependencias, ~10KB) |
| UUID / contraseñas | `crypto.randomUUID`, `crypto.getRandomValues` nativos |
| JSON ↔ CSV | PapaParse (parseo/generación de CSV con comillas/comas/saltos de línea es fácil de hacer mal a mano) |
| Formateador JSON / contador de palabras | Nativo, sin librería |

## Patrón de cada herramienta

Input (drag&drop + file picker) → procesar en el navegador → mostrar
resultado + botón de descarga. Nada se sube a ningún servidor. Errores
(archivo corrupto, formato no soportado, API no disponible en el navegador)
se muestran inline en la propia tarjeta de la herramienta, no con `alert()`.

Cada herramienta separa su lógica de conversión pura (función testeable sin
DOM) de su capa de UI/DOM, para poder testear la conversión de forma aislada.

## Testing

- Vitest para la lógica de conversión pura de cada herramienta (input
  conocido → output esperado).
- Sin tests de UI/e2e en v1 (sería sobre-ingeniería para widgets simples de
  formulario + canvas).

## Fuera de alcance (v1)

- Backend / subida de archivos a servidor.
- B (documentos), C (audio/vídeo), D (descargador de RRSS) — sub-proyectos futuros.
- MD5 y otros hashes no nativos.
- Cuenta de usuario, historial, guardado en la nube.

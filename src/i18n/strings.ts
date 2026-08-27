export type Lang = 'es' | 'en';

export const common = {
  es: {
    languageSwitch: 'EN',
    menuLabel: 'Herramientas',
  },
  en: {
    languageSwitch: 'ES',
    menuLabel: 'Tools',
  },
} as const;

export const tools = {
  es: [
    { href: '/es/imagen/convertir', label: 'Convertir / redimensionar / comprimir imagen' },
    { href: '/es/imagen/a-svg', label: 'PNG/JPEG a SVG (vectorizar)' },
    { href: '/es/imagen/svg-a-imagen', label: 'SVG a PNG/JPEG' },
    { href: '/es/datos/json-csv', label: 'JSON ↔ CSV' },
    { href: '/es/datos/formatear-json', label: 'Formatear JSON' },
    { href: '/es/datos/contador-palabras', label: 'Contador de palabras y caracteres' },
    { href: '/es/generadores/qr', label: 'Generador de código QR' },
    { href: '/es/generadores/hash', label: 'Hash SHA-256 / SHA-512' },
    { href: '/es/generadores/uuid', label: 'Generador de UUID' },
    { href: '/es/generadores/contrasenas', label: 'Generador de contraseñas' },
  ],
  en: [
    { href: '/en/image/convert', label: 'Convert / resize / compress image' },
    { href: '/en/image/to-svg', label: 'PNG/JPEG to SVG (vectorize)' },
    { href: '/en/image/svg-to-image', label: 'SVG to PNG/JPEG' },
    { href: '/en/data/json-csv', label: 'JSON ↔ CSV' },
    { href: '/en/data/json-formatter', label: 'Format JSON' },
    { href: '/en/data/word-counter', label: 'Word & character counter' },
    { href: '/en/generators/qr', label: 'QR code generator' },
    { href: '/en/generators/hash', label: 'SHA-256 / SHA-512 hash' },
    { href: '/en/generators/uuid', label: 'UUID generator' },
    { href: '/en/generators/password', label: 'Password generator' },
  ],
} as const;

/** Non-tool content pages (not shown in the tool nav), kept here so Layout.astro
 * can still resolve the correct hreflang alternate URL for them. */
export const staticPages = {
  es: [{ href: '/es/privacidad', label: 'Política de privacidad' }],
  en: [{ href: '/en/privacy', label: 'Privacy policy' }],
} as const;

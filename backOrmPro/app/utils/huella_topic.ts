export function normalizeHuellaDataUrl(input: string, fallbackMime = 'image/jpeg') {
  if (!input) return null;
  const s = input.trim();

  // Caso correcto: data:image/...;base64,<data>
  if (s.startsWith('data:') && s.includes(';base64,')) return s;

  // Caso roto típico: dataimage/jpegbase64/<data>
  const fixed = s.replace(
    /^dataimage\/([a-z0-9.+-]+)base64\//i,
    (_m, mime) => `data:${mime};base64,`
  );

  // Si no encaja, fuerza encabezado con el fallback:
  if (!fixed.startsWith('data:')) {
    return `data:${fallbackMime};base64,${fixed}`;
  }
  return fixed;
}

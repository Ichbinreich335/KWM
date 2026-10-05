/** Link zum Anfrageformular, optional mit vorbelegtem Feld „Stück“ (`/besuch?stueck=…#anfrage`). */
export function anfrageLink(stueck?: string): string {
  if (!stueck) return '/besuch#anfrage';
  // encodeURIComponent lässt ! ' ( ) * stehen, hier werden sie ebenfalls kodiert
  const kodiert = encodeURIComponent(stueck).replace(
    /[!'()*]/g,
    (zeichen) => `%${zeichen.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `/besuch?stueck=${kodiert}#anfrage`;
}

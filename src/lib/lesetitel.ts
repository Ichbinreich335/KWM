/** Titel für Screenreader: geschützter Bindestrich wird zum normalen, „&“ wird ausgeschrieben. */
export function lesetitel(titel: string): string {
  return titel.replaceAll('\u2011', '-').replaceAll(' & ', ' und ');
}

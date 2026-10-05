import { SCHMALES_LEERZEICHEN } from '../lib/zeichen';

/** Brenntemperaturen in °C: einzige Quelle für Daten, Seiten und Skripte */
export const BRENNTEMPERATUR = {
  /** Schrühbrand im Elektroofen */
  schruehbrand: 950,
  /** Glasurbrand der Manufaktur im Gasofen */
  glasurbrandGas: 1300,
  /** Meisterstücke im Holzofen */
  holzofen: 1260,
  /** Meisterstücke im Gasofen */
  gasofen: 1280,
  /** Höchsttemperatur im Holzbrand (neun bis zehn Stunden Feuer) */
  holzbrandMax: 1300,
} as const;

/** Temperatur mit Einheit, `grad(1300)` ergibt `1300 °C` mit schmalem geschütztem Leerzeichen */
export function grad(temperatur: number): string {
  return `${temperatur}${SCHMALES_LEERZEICHEN}°C`;
}

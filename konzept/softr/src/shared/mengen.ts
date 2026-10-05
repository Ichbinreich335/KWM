// Mengenlager für Geschirr und Edition: Der Bestand ist eine Zahl je Posten.
// Ein Posten ist eindeutig durch Modell, Zustand, Glasur, Brand, Reservierung, Status mit Partner und Rückgabe und wer gedreht und glasiert hat.
// Gleiche Posten werden zusammengezählt.
import { GLASIERT, GESCHRUEHT, ROH, ZUSTAENDE, serieVon } from "../shared/konstanten";
import { type Attachment, type Opt, type RawItem, asAttachments, asOpts, compareNr, formatDate, lookupValue, modellLabel, num, str } from "../shared/daten";

export type Posten = {
  id: string;
  modellId: string;
  nr: string;
  modell: string;
  serie: string;
  typ: string;
  zustand: string;
  glasurId: string;
  glasur: string;
  brand: string;
  reserviert: string;
  status: string;
  partnerId: string;
  partner: string;
  rueckgabe: string;
  gedrehtId: string;
  gedreht: string;
  glasiertId: string;
  glasiert: string;
  masse: string;
  anzahl: number;
  vk: number | null;
  lagerort: Opt | undefined;
  fotos: Attachment[];
  notiz: string;
};

export type PostenKey = Pick<Posten, "modellId" | "zustand" | "glasurId" | "brand" | "reserviert" | "status" | "partnerId" | "rueckgabe" | "gedrehtId" | "glasiertId">;

// Liest einen Datensatz des Editionsbestands. Jeder Block wählt seine Felder selbst aus, fehlende bleiben leer.
export function toPosten(item: RawItem): Posten {
  const f = item.fields;
  const modell = asOpts(f.modell)[0];
  const nr = str(lookupValue(f.artikelnr));
  const glasur = asOpts(f.glasur)[0];
  const partner = asOpts(f.partner)[0];
  const gedreht = asOpts(f.gedreht)[0];
  const glasiert = asOpts(f.glasiert)[0];
  return {
    id: item.id,
    modellId: modell?.id ?? "",
    nr,
    modell: modellLabel(nr, modell?.label ?? ""),
    serie: serieVon(asOpts(f.programm)[0]?.label ?? ""),
    typ: asOpts(f.typ)[0]?.label ?? "",
    zustand: asOpts(f.zustand)[0]?.label ?? "",
    glasurId: glasur?.id ?? "",
    glasur: glasur?.label ?? "",
    brand: str(f.brand).slice(0, 10),
    reserviert: str(f.reserviert).trim(),
    status: asOpts(f.status)[0]?.label ?? "",
    partnerId: partner?.id ?? "",
    partner: partner?.label ?? "",
    rueckgabe: str(f.rueckgabe).slice(0, 10),
    gedrehtId: gedreht?.id ?? "",
    gedreht: gedreht?.label ?? "",
    glasiertId: glasiert?.id ?? "",
    glasiert: glasiert?.label ?? "",
    masse: str(f.masse).trim(),
    anzahl: num(f.anzahl) ?? 0,
    vk: num(lookupValue(f.vk)),
    lagerort: asOpts(f.lagerort)[0],
    fotos: asAttachments(f.foto),
    notiz: str(f.notiz),
  };
}

export function gleicherPosten(a: PostenKey, b: PostenKey): boolean {
  return (
    a.modellId === b.modellId &&
    a.zustand === b.zustand &&
    a.glasurId === b.glasurId &&
    a.brand === b.brand &&
    a.reserviert.toLowerCase() === b.reserviert.toLowerCase() &&
    a.status === b.status &&
    a.partnerId === b.partnerId &&
    a.rueckgabe === b.rueckgabe &&
    a.gedrehtId === b.gedrehtId &&
    a.glasiertId === b.glasiertId
  );
}

export const keyVon = (p: Posten): PostenKey => ({
  modellId: p.modellId,
  zustand: p.zustand,
  glasurId: p.glasurId,
  brand: p.brand,
  reserviert: p.reserviert,
  status: p.status,
  partnerId: p.partnerId,
  rueckgabe: p.rueckgabe,
  gedrehtId: p.gedrehtId,
  glasiertId: p.glasiertId,
});

// Ausgestellt oder in Kommission: Die Stücke sind nicht in der Werkstatt.
export const ausserHaus = (p: Pick<Posten, "status">) => p.status !== "";

// Frei verkaufbar: glasiert, nicht reserviert und in der Werkstatt.
export const verkaufbar = (p: Posten) => p.zustand === GLASIERT && !p.reserviert && !ausserHaus(p);

// Status für die Anzeige, z. B. „ausgestellt bei Galerie Mitte bis 30.11.2026“.
export function statusText(p: Pick<Posten, "status" | "partner"> & { rueckgabe?: string }): string {
  return p.status ? [p.status, p.partner && `bei ${p.partner}`, p.rueckgabe && `bis ${formatDate(p.rueckgabe)}`].filter(Boolean).join(" ") : "";
}

// Nächster Arbeitsschritt: roh → Schrühbrand → geschrüht → Glasurbrand → glasiert. Glasiert ist fertig.
export function naechsterZustand(zustand: string): string {
  return zustand === ROH ? GESCHRUEHT : zustand === GESCHRUEHT ? GLASIERT : "";
}

export function schrittName(zustand: string): string {
  return zustand === ROH ? "Schrühen" : zustand === GESCHRUEHT ? "Glasieren" : "";
}

// Kurzbeschreibung eines Postens ohne Modell, z. B. „Rostbraun · Brand 24.09.2026“.
export function postenText(p: Pick<Posten, "zustand" | "glasur" | "brand">): string {
  return [p.glasur || p.zustand, p.brand && `Brand ${formatDate(p.brand)}`].filter(Boolean).join(" · ");
}

// Bezeichnung des Datensatzes (Hauptfeld in der Datenbank), damit die Tabelle in Softr lesbar bleibt.
export function bezeichnung(modell: string, p: Pick<Posten, "zustand" | "glasur" | "brand" | "reserviert" | "status" | "partner"> & { rueckgabe?: string }): string {
  return [modell, postenText(p), p.reserviert && `für ${p.reserviert}`, statusText(p)].filter(Boolean).join(" · ");
}

export type ModellStand = {
  modellId: string;
  nr: string;
  modell: string;
  serie: string;
  typ: string;
  fotos: Attachment[];
  je: Record<string, number>;
  reserviert: number;
  ausserHaus: number;
  // Größte Menge einer Glasur aus einem Brand, frei und in der Werkstatt: so viele passen zusammen.
  zusammen: number;
  posten: Posten[];
};

const ZUSTAND_RANG = (z: string) => (ZUSTAENDE.includes(z) ? ZUSTAENDE.indexOf(z) : ZUSTAENDE.length);

// Fasst die Posten je Modell zusammen, wie auf der Lagerliste der Werkstatt: eine Zeile je Artikel, Stück je Zustand.
// Posten mit 0 Stück zählen nicht und erscheinen nicht.
export function nachModell(posten: Posten[]): ModellStand[] {
  const map = new Map<string, ModellStand>();
  for (const p of posten) {
    if (p.anzahl <= 0) continue;
    const key = p.modellId || p.modell;
    const s = map.get(key) ?? { modellId: p.modellId, nr: p.nr, modell: p.modell, serie: p.serie, typ: p.typ, fotos: [], je: {}, reserviert: 0, ausserHaus: 0, zusammen: 0, posten: [] };
    s.je[p.zustand] = (s.je[p.zustand] ?? 0) + p.anzahl;
    if (p.reserviert) s.reserviert += p.anzahl;
    if (ausserHaus(p)) s.ausserHaus += p.anzahl;
    if (!s.fotos.length && p.fotos.length) s.fotos = p.fotos;
    s.posten.push(p);
    map.set(key, s);
  }
  const stande = [...map.values()];
  for (const s of stande) {
    s.zusammen = Math.max(0, ...brandGruppen(s.posten).map((g) => g.zusammen));
    s.posten.sort((a, b) => ZUSTAND_RANG(a.zustand) - ZUSTAND_RANG(b.zustand) || a.glasur.localeCompare(b.glasur, "de") || b.brand.localeCompare(a.brand) || a.reserviert.localeCompare(b.reserviert, "de"));
  }
  return stande.sort((a, b) => compareNr(a.nr, b.nr) || a.modell.localeCompare(b.modell, "de"));
}

export type BrandGruppe = { glasurId: string; glasur: string; gesamt: number; zusammen: number; braende: { brand: string; anzahl: number }[] };

// Glasierte Ware je Glasur, aufgeteilt nach Brand. Stücke aus verschiedenen Bränden sehen verschieden aus
// und werden nicht zusammen verkauft. Gezählt wird nur, was frei und in der Werkstatt ist. Ohne Datum gilt „Brand unbekannt“.
export function brandGruppen(posten: Posten[]): BrandGruppe[] {
  const map = new Map<string, BrandGruppe>();
  for (const p of posten) {
    if (!verkaufbar(p) || p.anzahl <= 0) continue;
    const g = map.get(p.glasurId) ?? { glasurId: p.glasurId, glasur: p.glasur, gesamt: 0, zusammen: 0, braende: [] };
    g.gesamt += p.anzahl;
    const b = g.braende.find((x) => x.brand === p.brand);
    if (b) b.anzahl += p.anzahl;
    else g.braende.push({ brand: p.brand, anzahl: p.anzahl });
    map.set(p.glasurId, g);
  }
  const gruppen = [...map.values()];
  for (const g of gruppen) {
    g.braende.sort((a, b) => b.anzahl - a.anzahl || b.brand.localeCompare(a.brand));
    g.zusammen = g.braende[0]?.anzahl ?? 0;
  }
  return gruppen.sort((a, b) => b.gesamt - a.gesamt || a.glasur.localeCompare(b.glasur, "de"));
}

export const brandName = (brand: string) => (brand ? `Brand ${formatDate(brand)}` : "Brand unbekannt");

// Eine Zeile für Listen: je Glasur die freie Ware, bei mehreren Bränden mit der Zahl, die zusammen passt.
// z. B. „Rostbraun 16 (9 aus einem Brand) · Weiß 6“
export function glasurZeile(posten: Posten[]): string {
  return brandGruppen(posten)
    .map((g) => `${g.glasur || "ohne Glasur"} ${g.gesamt}${g.braende.length > 1 ? ` (${g.zusammen} aus einem Brand)` : ""}`)
    .join(" · ");
}

// „geschrüht 25 · glasiert 12“: nur Zustände mit Bestand, in der Reihenfolge des Ablaufs.
export function standText(je: Record<string, number>): string {
  return ZUSTAENDE.filter((z) => (je[z] ?? 0) > 0)
    .map((z) => `${z} ${je[z]}`)
    .join(" · ");
}

export type Umbuchung = {
  quelle: { id: string; anzahl: number } | { id: string; loeschen: true };
  ziel?: { id: string; anzahl: number } | { neu: PostenKey & { anzahl: number; lagerortId: string; masse: string } };
};

// Plant das Umbuchen eines Teils eines Postens auf einen anderen, auf dem frisch geladenen Stand.
// entnommen: Stück, die vom Posten genommen werden. ausschuss: davon unbrauchbar (gehen verloren).
// Ohne Ziel wird nur ausgebucht (verkauft, abgegeben, Bruch). Ein Text ist eine Fehlermeldung für die Nutzer.
export function planeUmbuchung(fresh: Posten[], quelleId: string, entnommen: number, ausschuss: number, ziel: PostenKey | null, lagerortId: string): Umbuchung | string {
  const quelle = fresh.find((p) => p.id === quelleId);
  if (!quelle) return "Diesen Posten gibt es nicht mehr. Die Liste wurde neu geladen.";
  if (!(entnommen > 0)) return "Bitte mindestens 1 Stück angeben.";
  if (entnommen > quelle.anzahl) return `Hier sind nur noch ${quelle.anzahl} Stück. Die Liste wurde neu geladen.`;
  if (ausschuss < 0 || ausschuss > entnommen) return "Der Ausschuss kann nicht größer sein als die Zahl der entnommenen Stücke.";
  if (ziel && gleicherPosten(quelle, ziel)) return "Es hat sich nichts geändert.";
  const rest = quelle.anzahl - entnommen;
  const plan: Umbuchung = { quelle: rest > 0 ? { id: quelle.id, anzahl: rest } : { id: quelle.id, loeschen: true } };
  const gut = entnommen - ausschuss;
  if (ziel && gut > 0) {
    const vorhanden = fresh.find((p) => p.id !== quelle.id && gleicherPosten(p, ziel));
    plan.ziel = vorhanden ? { id: vorhanden.id, anzahl: vorhanden.anzahl + gut } : { neu: { ...ziel, anzahl: gut, lagerortId, masse: quelle.masse } };
  }
  return plan;
}

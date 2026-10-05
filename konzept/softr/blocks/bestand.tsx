// Generiert von konzept/softr/build.mjs aus src/blocks/bestand.tsx und src/shared/. Nicht von Hand ändern.
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { datasource, q, useFieldOptions, useRecordCreate, useRecordDelete, useRecords, useRecordUpdate, useUpload } from "@/lib/datasource";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Camera, Check, ChevronRight, ClipboardList, ImageOff, Images, LayoutGrid, List, Loader2, Minus, Pencil, Plus, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const PAGE_SIZE = 100;
const VERFUEGBAR = "verfügbar";
const RESERVIERT = "reserviert";
const VERKAUFT = "verkauft";
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";

// Zustände im Mengenlager, in der Reihenfolge des Werkstattablaufs: roh → Schrühbrand → geschrüht → Glasurbrand → glasiert.
const ROH = "roh";

const GESCHRUEHT = "geschrüht";
const GLASIERT = "glasiert";
const ZUSTAENDE = [ROH, GESCHRUEHT, GLASIERT];

// Programme der Werkstatt laut Anfrageformular: Editionen (Nr. 2001 ff.) und Geschirr (Nr. 1 ff.).
// In der Datenbank heißt das Geschirr „Manufakturprogramm“, in der App „Geschirr“ (Begriff der Werkstatt).
const EDITION_PROGRAMM = "Edition";

const MANUFAKTUR_PROGRAMM = "Manufakturprogramm";
const GESCHIRR = "Geschirr";

function serieVon(programm: string): string {
  return programm === MANUFAKTUR_PROGRAMM ? GESCHIRR : programm;
}

const AUSSER_HAUS_ORT = "Außer Haus";
const isAusserHaus = (status: string) => status === KOMMISSION || status === AUSGESTELLT;
type Opt = { id: string; label: string };
type Attachment = { id?: string; url: string; filename?: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };
type ThumbSize = "small" | "medium" | "large";
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const zahl = new Intl.NumberFormat("de-DE");

function asOpts(v: unknown): Opt[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(asOpts);
  if (typeof v === "object" && "id" in (v as object)) {
    const o = v as { id: string; label?: string; title?: string };
    return [{ id: o.id, label: o.label ?? o.title ?? "" }];
  }
  return [];
}

function asAttachments(v: unknown): Attachment[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).filter((a): a is Attachment => !!a && typeof a === "object" && "url" in a);
}

function thumb(a: Attachment, size: ThumbSize): string {
  return a.thumbnails?.find((t) => t.size === size)?.url ?? a.url;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// Auswahlliste aus einer Stammdaten-Tabelle (Felder name, archiviert). Archivierte fallen weg,
// außer sie sind am Datensatz schon gewählt, damit bestehende Angaben sichtbar bleiben.
function activeOptions(data: { pages: { items: unknown[] }[] } | undefined, keep: string[] = []): Opt[] {
  return ((data?.pages.flatMap((p) => p.items) ?? []) as RawItem[])
    .filter((i) => i.fields.archiviert !== true || keep.includes(i.id))
    .map((i) => ({ id: i.id, label: str(i.fields.name) }))
    .sort((a, b) => a.label.localeCompare(b.label, "de"));
}

// Nachschlagefelder liefern je nach Feld einen Wert oder eine Liste mit einem Wert.
function lookupValue(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}

// Artikelnummern wie 2, 6a, 10, 2018a in natürlicher Reihenfolge.
function compareNr(a: string, b: string): number {
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  return a.localeCompare(b, "de", { numeric: true });
}

function modellLabel(nr: string, name: string): string {
  return nr ? `${nr} · ${name}` : name;
}

// Lädt eine Liste frisch vom Server, z. B. direkt vor dem Speichern. So rechnet die App nie mit veralteten Zahlen,
// auch wenn auf einem zweiten Gerät gleichzeitig gearbeitet wird. null heißt: Laden fehlgeschlagen.
async function freshItems(query: { refetch: () => Promise<unknown> }): Promise<RawItem[] | null> {
  const result = (await query.refetch()) as { data?: { pages: { items: unknown[] }[] }; status?: string } | undefined;
  if (!result?.data || result.status === "error") return null;
  return result.data.pages.flatMap((p) => p.items) as RawItem[];
}

function link(id: string | undefined): string[] {
  return id ? [id] : [];
}

// Heutiges Datum in Ortszeit als JJJJ-MM-TT (nicht UTC, sonst springt das Datum nachts).
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
}

// Deutsche Zahleneingabe: „1.200“ = 1200, „12,50“ = 12.5.
function parseNumber(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

type Posten = {
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

type PostenKey = Pick<Posten, "modellId" | "zustand" | "glasurId" | "brand" | "reserviert" | "status" | "partnerId" | "rueckgabe" | "gedrehtId" | "glasiertId">;

// Liest einen Datensatz des Editionsbestands. Jeder Block wählt seine Felder selbst aus, fehlende bleiben leer.
function toPosten(item: RawItem): Posten {
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

function gleicherPosten(a: PostenKey, b: PostenKey): boolean {
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

const keyVon = (p: Posten): PostenKey => ({
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
const ausserHaus = (p: Pick<Posten, "status">) => p.status !== "";

// Frei verkaufbar: glasiert, nicht reserviert und in der Werkstatt.
const verkaufbar = (p: Posten) => p.zustand === GLASIERT && !p.reserviert && !ausserHaus(p);

// Status für die Anzeige, z. B. „ausgestellt bei Galerie Mitte bis 30.11.2026“.
function statusText(p: Pick<Posten, "status" | "partner"> & { rueckgabe?: string }): string {
  return p.status ? [p.status, p.partner && `bei ${p.partner}`, p.rueckgabe && `bis ${formatDate(p.rueckgabe)}`].filter(Boolean).join(" ") : "";
}

// Nächster Arbeitsschritt: roh → Schrühbrand → geschrüht → Glasurbrand → glasiert. Glasiert ist fertig.
function naechsterZustand(zustand: string): string {
  return zustand === ROH ? GESCHRUEHT : zustand === GESCHRUEHT ? GLASIERT : "";
}

function schrittName(zustand: string): string {
  return zustand === ROH ? "Schrühen" : zustand === GESCHRUEHT ? "Glasieren" : "";
}

// Kurzbeschreibung eines Postens ohne Modell, z. B. „Rostbraun · Brand 24.09.2026“.
function postenText(p: Pick<Posten, "zustand" | "glasur" | "brand">): string {
  return [p.glasur || p.zustand, p.brand && `Brand ${formatDate(p.brand)}`].filter(Boolean).join(" · ");
}

// Bezeichnung des Datensatzes (Hauptfeld in der Datenbank), damit die Tabelle in Softr lesbar bleibt.
function bezeichnung(modell: string, p: Pick<Posten, "zustand" | "glasur" | "brand" | "reserviert" | "status" | "partner"> & { rueckgabe?: string }): string {
  return [modell, postenText(p), p.reserviert && `für ${p.reserviert}`, statusText(p)].filter(Boolean).join(" · ");
}

type ModellStand = {
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
function nachModell(posten: Posten[]): ModellStand[] {
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

type BrandGruppe = { glasurId: string; glasur: string; gesamt: number; zusammen: number; braende: { brand: string; anzahl: number }[] };

// Glasierte Ware je Glasur, aufgeteilt nach Brand. Stücke aus verschiedenen Bränden sehen verschieden aus
// und werden nicht zusammen verkauft. Gezählt wird nur, was frei und in der Werkstatt ist. Ohne Datum gilt „Brand unbekannt“.
function brandGruppen(posten: Posten[]): BrandGruppe[] {
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

const brandName = (brand: string) => (brand ? `Brand ${formatDate(brand)}` : "Brand unbekannt");

// Eine Zeile für Listen: je Glasur die freie Ware, bei mehreren Bränden mit der Zahl, die zusammen passt.
// z. B. „Rostbraun 16 (9 aus einem Brand) · Weiß 6“
function glasurZeile(posten: Posten[]): string {
  return brandGruppen(posten)
    .map((g) => `${g.glasur || "ohne Glasur"} ${g.gesamt}${g.braende.length > 1 ? ` (${g.zusammen} aus einem Brand)` : ""}`)
    .join(" · ");
}

// „geschrüht 25 · glasiert 12“: nur Zustände mit Bestand, in der Reihenfolge des Ablaufs.
function standText(je: Record<string, number>): string {
  return ZUSTAENDE.filter((z) => (je[z] ?? 0) > 0)
    .map((z) => `${z} ${je[z]}`)
    .join(" · ");
}

type Umbuchung = {
  quelle: { id: string; anzahl: number } | { id: string; loeschen: true };
  ziel?: { id: string; anzahl: number } | { neu: PostenKey & { anzahl: number; lagerortId: string; masse: string } };
};

// Plant das Umbuchen eines Teils eines Postens auf einen anderen, auf dem frisch geladenen Stand.
// entnommen: Stück, die vom Posten genommen werden. ausschuss: davon unbrauchbar (gehen verloren).
// Ohne Ziel wird nur ausgebucht (verkauft, abgegeben, Bruch). Ein Text ist eine Fehlermeldung für die Nutzer.
function planeUmbuchung(fresh: Posten[], quelleId: string, entnommen: number, ausschuss: number, ziel: PostenKey | null, lagerortId: string): Umbuchung | string {
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

// Die eine Rahmenfarbe der App: Flächen, Kacheln, Felder, Auswahlen, Knöpfe. Nur Trennlinien innerhalb einer Fläche bleiben heller.
const LINE = "border-neutral-300";

// Jedes Fenster (Dialog). Rahmen in der App-Rahmenfarbe.
const DIALOG_CLASS = `w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-lg border ${LINE} p-4 sm:p-6 [&>button:last-child]:hidden`;

// md:text-base hebt das md:text-sm der shadcn-Felder auf, damit Eingabe und Auswahlliste gleich groß schreiben.
const FIELD_CLASS = `h-12 min-w-0 rounded-md text-base md:text-base ${LINE}`;

// iOS gibt Datumsfeldern eine eigene Mindestbreite; ohne appearance-none ragen sie aus der Spalte und die Seite lässt sich seitlich schieben.
const DATUM_CLASS = "appearance-none [&::-webkit-date-and-time-value]:text-left";

// Die Box: jede umrandete Fläche (Bereich, Liste, Kachel, Tabelle). Innerhalb einer Box keine zweite Box.
const PANEL_CLASS = `rounded-lg border ${LINE} bg-card`;

// Nur waagerecht wischbar. overflow-x-auto allein macht in CSS auch die senkrechte Achse scrollbar, dann lässt sich der Inhalt nach oben und unten ziehen.
// Einzige Stelle mit overflow-x-auto (geprüft von pruefung/einheitlich.mjs).
const WISCHEN = "overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// Wurzel jeder Seite. overflow-x-clip: Nichts kann die Seite verbreitern, am Handy lässt sie sich nie seitlich verschieben.
const SEITE_CLASS = "container pt-6 pb-28 sm:pb-8 overflow-x-clip";

// Am Handy eine Zeile zum seitlich Wischen statt mehrerer umbrochener Reihen, ab Tablet umbrechen.
const SCROLL_ROW = `flex gap-2 py-0.5 ${WISCHEN} sm:flex-wrap sm:overflow-visible`;

// Klebende Leisten am unteren Rand: am Handy knapp über Softrs Navigationsleiste (ca. 56 px), ab Tablet am Rand.
const STICKY_BOTTOM = "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:bottom-4";

// Farbe trägt nur den Status eines Unikats (farbiger Rand im Ton des Status). Neutrale Werte (verkauft und die Zustände der Mengenware) haben den App-Rahmen.
const STATUS_BADGE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-50 text-emerald-800 border-emerald-200",
  [RESERVIERT]: "bg-amber-50 text-amber-900 border-amber-200",
  [VERKAUFT]: `bg-zinc-100 text-zinc-700 ${LINE}`,
  [KOMMISSION]: "bg-sky-50 text-sky-800 border-sky-200",
  [AUSGESTELLT]: "bg-violet-50 text-violet-800 border-violet-200",
  [ROH]: `bg-background text-muted-foreground ${LINE}`,
  [GESCHRUEHT]: `bg-background text-muted-foreground ${LINE}`,
  [GLASIERT]: `bg-muted text-foreground ${LINE}`,
};

// Kräftige Variante für den gewählten Status-Knopf. Weiße Schrift nur auf ausreichend dunklen Tönen.
const STATUS_ACTIVE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-600 text-white border-emerald-600",
  [RESERVIERT]: "bg-amber-400 text-amber-950 border-amber-400",
  [VERKAUFT]: "bg-zinc-600 text-white border-zinc-600",
  [KOMMISSION]: "bg-sky-600 text-white border-sky-600",
  [AUSGESTELLT]: "bg-violet-700 text-white border-violet-700",
};

// Grundbausteine. Seiten nutzen nur diese, nie Button, Input, Textarea, Badge oder <select> direkt
// (geprüft von pruefung/einheitlich.sh). Rahmen, Schrift und Höhe stehen nur hier; Seiten geben höchstens Größe und Breite mit.

type KnopfProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

// Jeder Knopf. Umrandet (outline) und gefüllt-grau (secondary) tragen dieselbe Rahmenfarbe, damit ein aktiver Filter nicht die Größe ändert.
const Knopf = forwardRef<HTMLButtonElement, KnopfProps>(function Knopf({ variant = "default", className = "", ...props }, ref) {
  const rahmen = variant === "outline" || variant === "secondary" ? `border ${LINE}` : "";
  return <Button ref={ref} variant={variant} className={`${rahmen} ${className}`} {...props} />;
});

// Jedes einzeilige Eingabefeld.
const Feld = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Feld({ className = "", ...props }, ref) {
  return <Input ref={ref} className={`${FIELD_CLASS} ${props.type === "date" ? DATUM_CLASS : ""} ${className}`} {...props} />;
});

// Jedes mehrzeilige Textfeld.
const Textfeld = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textfeld({ className = "", ...props }, ref) {
  return <Textarea ref={ref} className={`rounded-md text-base md:text-base ${LINE} ${className}`} {...props} />;
});

// Jede Auswahlliste (öffnet am Handy die Auswahl des Telefons). kompakt: für dichte Filterzeilen. breite ersetzt die volle Breite.
const Auswahl = forwardRef<HTMLSelectElement, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & { kompakt?: boolean; breite?: string }>(function Auswahl(
  { kompakt, breite = "w-full", ...props },
  ref,
) {
  return <select ref={ref} className={`${breite} ${kompakt ? "h-11 px-2" : "h-12 px-3"} rounded-md border ${LINE} bg-background text-base`} {...props} />;
});

// Ein-/Aus-Schalter als umrandete Zeile in Feldhöhe. lage: nur Ausrichtung im Raster (z. B. self-end).
function SchalterFeld({ id, label, hint, checked, onChange, lage = "" }: { id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; lage?: string }) {
  return (
    <label htmlFor={id} className={`flex items-center justify-between gap-4 min-h-12 rounded-md border ${LINE} px-4 py-2 cursor-pointer ${lage}`}>
      <span>
        <span className="block text-base font-medium">{label}</span>
        {hint && <span className="block text-sm text-muted-foreground">{hint}</span>}
      </span>
      <Switch id={id} className="scale-125 data-[state=unchecked]:bg-zinc-300" checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

const MOBILE_QUERY = "(max-width: 639px)";

// Gewählt = gefüllt. Kein zusätzliches Symbol, damit der Knopf beim Antippen nicht breiter wird und nichts springt.
// Mindestbreite, damit kurze Wörter (Sieb, Topf) nicht winzig wirken und die Reihen ruhiger aussehen.
// shrink-0: In einer Wischzeile wird der Knopf nie gestaucht, der Text bleibt in der Box.
const CHIP_BASE = "inline-flex shrink-0 items-center justify-center gap-2 min-h-11 min-w-[5rem] px-3.5 rounded-md border text-base whitespace-nowrap transition-colors disabled:opacity-60";

const CHIP_IDLE = `bg-background hover:bg-muted ${LINE}`;
const CHIP_ACTIVE = "bg-primary text-primary-foreground border-primary";

// Ein einzelner Auswahl-Knopf. Gewählt: Hauptfarbe, beim Status die Statusfarbe.
function Chip({ active, onClick, children, disabled, role, activeClass }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; role?: "radio"; activeClass?: string }) {
  const state = role === "radio" ? { "aria-checked": active } : { "aria-pressed": active };
  return (
    <button type="button" role={role} {...state} disabled={disabled} onClick={onClick} className={`${CHIP_BASE} ${active ? `${activeClass ?? CHIP_ACTIVE} font-medium` : CHIP_IDLE}`}>
      {children}
    </button>
  );
}

// Einfachauswahl als Knopfreihe, z. B. Status, Typ, Zustand. Wert ist das Label. statusColors färbt den gewählten Status.
function ChoiceChips({ label, options, value, onChange, statusColors, disabled }: { label: string; options: Opt[]; value: string; onChange: (label: string) => void; statusColors?: boolean; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.id} role="radio" active={value === o.label} activeClass={statusColors ? STATUS_ACTIVE[o.label] : undefined} disabled={disabled} onClick={() => onChange(o.label)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

// Filter als Knopfreihe mit Anzahl, z. B. Im Haus 5 · Außer Haus 6. Ein Tipp, Zahlen sofort sichtbar.
function FilterChips<K extends string>({ label, options, value, onChange }: { label: string; options: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className={SCROLL_ROW}>
      {options.map((o) => (
        <Chip key={o.key} role="radio" active={value === o.key} onClick={() => onChange(o.key)}>
          {o.label}
          {o.count !== undefined && <span className="tabular-nums opacity-70">{o.count}</span>}
        </Chip>
      ))}
    </div>
  );
}

// Reiter: der einzige Umschalter der App (Erfassen, Bestand, Stammdaten). Unterstrichen, am Handy seitlich wischbar.
function Tabs<K extends string>({ label, tabs, value, onChange }: { label: string; tabs: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void }) {
  return (
    // Die Grundlinie liegt hinter der Reiterzeile, damit der Unterstrich des aktiven Reiters sie überdeckt, ohne über den Wischbereich hinauszuragen.
    <div className="relative">
      <div className="absolute inset-x-0 bottom-0 border-b" aria-hidden />
      <div role="tablist" aria-label={label} className={`relative flex gap-1 ${WISCHEN}`}>
        {tabs.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 min-h-11 px-3 border-b-2 text-base whitespace-nowrap transition-colors ${
                active ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count !== undefined && <span className="tabular-nums text-muted-foreground">{t.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-medium whitespace-nowrap ${STATUS_BADGE[text] ?? `bg-muted text-foreground ${LINE}`}`}>
      {text}
    </span>
  );
}

// required: Pflichtfeld (*). empfohlen: darf leer bleiben, beim Speichern kommt eine Rückfrage.
function FieldLabel({ htmlFor, children, required, empfohlen }: { htmlFor?: string; children: string; required?: boolean; empfohlen?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
      {required && <span className="text-destructive"> *</span>}
      {empfohlen && <span className="font-normal text-muted-foreground"> · empfohlen</span>}
    </label>
  );
}

function Hint({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground mt-1.5">{children}</p>;
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" data-error="true" className="text-sm text-destructive mt-1.5">
      {children}
    </p>
  );
}

// Stückzahl mit Minus und Plus, dazwischen frei eintippbar. max: höchstens so viele (z. B. vorhandene Stück).
function Stueckzahl({ id, value, onChange, min = 0, max, disabled }: { id: string; value: number; onChange: (n: number) => void; min?: number; max?: number; disabled?: boolean }) {
  const begrenzt = (n: number) => Math.max(min, max === undefined ? n : Math.min(max, n));
  return (
    <div className="flex items-center gap-3">
      <Knopf type="button" variant="outline" className="h-12 w-12" aria-label="Eins weniger" disabled={disabled || value <= min} onClick={() => onChange(begrenzt(value - 1))}>
        <Minus className="w-5 h-5" aria-hidden />
      </Knopf>
      <Feld
        id={id}
        inputMode="numeric"
        disabled={disabled}
        value={String(value)}
        onChange={(e) => onChange(begrenzt(Number(e.target.value.replace(/\D/g, "").slice(0, 5)) || 0))}
        className="h-12 w-24 text-center text-lg md:text-lg"
      />
      <Knopf type="button" variant="outline" className="h-12 w-12" aria-label="Eins mehr" disabled={disabled || (max !== undefined && value >= max)} onClick={() => onChange(begrenzt(value + 1))}>
        <Plus className="w-5 h-5" aria-hidden />
      </Knopf>
    </div>
  );
}

// Freitext mit Vorschlägen aus früheren Einträgen (z. B. Kunden). Hält Schreibweisen einheitlich, ohne eigene Kundenliste.
function TextMitVorschlag({ id, value, onChange, vorschlaege, placeholder }: { id: string; value: string; onChange: (v: string) => void; vorschlaege: string[]; placeholder?: string }) {
  return (
    <>
      <Feld id={id} list={`${id}-vorschlaege`} autoComplete="off" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      <datalist id={`${id}-vorschlaege`}>
        {vorschlaege.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
    </>
  );
}

// Großer Auswahlknopf mit Erklärung, z. B. „Glasieren – Stücke aus dem Lager nehmen …“. Für Entscheidungen in Fenstern.
function AktionKnopf({ titel, text, onClick, haupt }: { titel: string; text: string; onClick: () => void; haupt?: boolean }) {
  return (
    <Knopf variant={haupt ? "default" : "outline"} className="w-full h-auto min-h-14 py-3 px-4 justify-start text-left whitespace-normal" onClick={onClick}>
      <span>
        <span className="block text-base font-semibold">{titel}</span>
        <span className={`block text-sm font-normal ${haupt ? "opacity-90" : "text-muted-foreground"}`}>{text}</span>
      </span>
    </Knopf>
  );
}

// Auswahlliste für verknüpfte Datensätze. Wert ist die Datensatz-ID.
function OptionSelect({ id, value, onChange, options, placeholder, disabled }: { id: string; value: string; onChange: (id: string) => void; options: Opt[]; placeholder: string; disabled?: boolean }) {
  return (
    <Auswahl id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </Auswahl>
  );
}

function SearchField({ id, value, onChange, placeholder, label }: { id?: string; value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Feld id={id} type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
    </div>
  );
}

const SEARCH_FROM_OPTIONS = 6;

// Durchsuchbare Auswahl aus einer wachsenden Liste (Glasuren). Die Reihenfolge bleibt beim Antippen gleich,
// die Suche blendet nur aus (Gewähltes bleibt sichtbar). Fehlendes lässt sich aus dem Suchfeld anlegen.
function SearchPick({
  label,
  options,
  value,
  onChange,
  multiple,
  onCreate,
  createNoun,
}: {
  label: string;
  options: Opt[];
  value: string[];
  onChange: (ids: string[]) => void;
  multiple: boolean;
  onCreate?: (name: string) => Promise<string | null>;
  createNoun: string;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const term = query.trim().toLowerCase();
  const matches = options.filter((o) => !term || o.label.toLowerCase().includes(term));
  const shown = options.filter((o) => value.includes(o.id) || matches.includes(o));
  const exact = options.some((o) => o.label.toLowerCase() === term);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : multiple ? [...value, id] : [id]);

  return (
    <div className="space-y-2">
      {options.length > SEARCH_FROM_OPTIONS && <SearchField label={`${label} suchen`} placeholder={`${label} suchen`} value={query} onChange={setQuery} />}
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {shown.map((o) => (
          <Chip key={o.id} active={value.includes(o.id)} onClick={() => toggle(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>
      {term && matches.length === 0 && !exact && <p className="text-sm text-muted-foreground">Keine {label} mit „{query.trim()}“.</p>}
      {onCreate && term && !exact && (
        <Knopf
          type="button"
          variant="ghost"
          className="h-11 px-2 text-base text-primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const id = await onCreate(query.trim());
            setBusy(false);
            if (id) {
              onChange(multiple ? [...value, id] : [id]);
              setQuery("");
            }
          }}
        >
          {busy ? <Loader2 className="w-5 h-5 mr-1 animate-spin" aria-hidden /> : <Plus className="w-5 h-5 mr-1" aria-hidden />}„{query.trim()}“ als {createNoun} anlegen
        </Knopf>
      )}
    </div>
  );
}

// Glasur für Geschirr und Edition: die Glasuren des Modells als Knöpfe, darunter „Andere oder neue Glasur“.
// Editionen bekommen oft Glasuren, die nicht im Katalog stehen (z. B. „Grün dunkel“). Die lassen sich hier direkt anlegen.
function GlasurWahl({ modell, alle, value, onChange, onCreate }: { modell: Opt[]; alle: Opt[]; value: string; onChange: (id: string) => void; onCreate: (name: string) => Promise<string | null> }) {
  const fremd = !!value && !modell.some((g) => g.id === value);
  const [offen, setOffen] = useState(false);
  const weitere = alle.filter((g) => !modell.some((m) => m.id === g.id));
  return (
    <div className="space-y-3">
      {modell.length > 0 && (
        <div role="radiogroup" aria-label="Glasur des Modells" className="flex flex-wrap gap-2">
          {modell.map((g) => (
            <Chip key={g.id} role="radio" active={value === g.id} onClick={() => onChange(g.id)}>
              {g.label}
            </Chip>
          ))}
        </div>
      )}
      {offen || fremd || modell.length === 0 ? (
        <>
          {modell.length > 0 && <p className="text-sm text-muted-foreground">Weitere Glasuren</p>}
          <SearchPick label="Glasuren" createNoun="neue Glasur" options={weitere} value={value ? [value] : []} onChange={(ids) => onChange(ids.at(-1) ?? "")} multiple={false} />
          <AddNew
            label="Neue Glasur anlegen"
            placeholder="z. B. Grün dunkel"
            existing={alle}
            onAdd={async (name) => {
              const id = await onCreate(name);
              if (id) onChange(id);
              return !!id;
            }}
          />
        </>
      ) : (
        <ZusatzKnopf label="Andere oder neue Glasur" onClick={() => setOffen(true)} />
      )}
    </div>
  );
}

function Thumb({ fotos, size = "small", className = "w-12 h-12 rounded-md" }: { fotos: Attachment[]; size?: ThumbSize; className?: string }) {
  const first = fotos[0];
  if (!first) {
    return (
      <span className={`${className} shrink-0 bg-muted flex items-center justify-center text-muted-foreground/60`} aria-label="Kein Foto">
        <ImageOff className="w-4 h-4" aria-hidden />
      </span>
    );
  }
  return <img src={thumb(first, size)} alt="" loading="lazy" className={`${className} shrink-0 object-cover`} />;
}

// aside: kleines Bedienelement rechts neben dem Titel, auch am Handy (z. B. Ansicht Liste/Kacheln). actions: am Handy volle Breite unter dem Titel.
function PageHeader({ title, description, aside, actions }: { title: string; description?: string; aside?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className={`flex items-end justify-between gap-4 min-w-0 flex-1 ${actions ? "sm:flex-none" : ""}`}>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-base text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {aside}
      </div>
      {actions && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div>}
    </div>
  );
}

// Eine anklickbare Zeile mit Bild, Titel, Unterzeile und rechter Spalte. Für alle Listen.
function ListRow({ fotos, title, sub, meta, onClick, href }: { fotos?: Attachment[]; title: string; sub?: React.ReactNode; meta?: React.ReactNode; onClick?: () => void; href?: string }) {
  const inner = (
    <>
      {fotos && <Thumb fotos={fotos} />}
      <span className="flex-1 min-w-0">
        <span className="block font-medium hyphens-auto">{title}</span>
        {sub && <span className="block text-sm text-muted-foreground">{sub}</span>}
      </span>
      {meta && <span className="text-right shrink-0">{meta}</span>}
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
    </>
  );
  const cls = "w-full text-left flex items-center gap-3 min-h-14 py-2 px-1 rounded-md hover:bg-muted/40";
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-base text-muted-foreground py-10 justify-center">
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> {text}
    </div>
  );
}

function ErrorState({ text }: { text: string }) {
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-base">
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0" aria-hidden /> {text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg bg-muted/50 px-4 py-6 text-center text-base text-muted-foreground">{text}</p>;
}

// Kopf jedes Fensters: Titel, Unterzeile, großer Schließen-Knopf.
function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <DialogHeader className="flex-row items-start justify-between gap-3 space-y-0 text-left">
      <div className="min-w-0">
        <DialogTitle className="text-xl break-words hyphens-auto">{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>
      <DialogClose asChild>
        <Knopf variant="ghost" className="h-11 w-11 p-0 shrink-0" aria-label="Schließen">
          <X className="w-6 h-6" aria-hidden />
        </Knopf>
      </DialogClose>
    </DialogHeader>
  );
}

function DoneButton() {
  return (
    <DialogClose asChild>
      <Knopf variant="outline" className={`w-full h-12 text-base`}>
        Fertig
      </Knopf>
    </DialogClose>
  );
}

// Unauffälliger Textknopf mit Plus, der etwas Zusätzliches öffnet („+ Neue Person“, „+ Daten einzeln angeben“).
function ZusatzKnopf({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Knopf type="button" variant="ghost" className="h-11 px-2 text-base text-primary" onClick={onClick}>
      <Plus className="w-5 h-5 mr-1" aria-hidden />
      {label}
    </Knopf>
  );
}

// „+ Neu anlegen“ mit Dublettenprüfung ohne Groß-/Kleinschreibung.
function AddNew({ label, placeholder, existing, onAdd }: { label: string; placeholder: string; existing: Opt[]; onAdd: (name: string) => Promise<boolean> | boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const name = value.trim();
  const duplicate = existing.find((o) => o.label.toLowerCase() === name.toLowerCase());
  if (!open) return <ZusatzKnopf label={label} onClick={() => setOpen(true)} />;
  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      <Feld autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} aria-label={label} className="flex-1 min-w-48" />
      <Knopf
        type="button"
        className="h-12 text-base"
        disabled={!name || !!duplicate || busy}
        onClick={async () => {
          setBusy(true);
          const ok = await onAdd(name);
          setBusy(false);
          if (ok) {
            setValue("");
            setOpen(false);
          }
        }}
      >
        Übernehmen
      </Knopf>
      <Knopf
        type="button"
        variant="ghost"
        className="h-12 text-base"
        onClick={() => {
          setValue("");
          setOpen(false);
        }}
      >
        Abbrechen
      </Knopf>
      {duplicate && <p className="w-full text-sm text-muted-foreground">„{duplicate.label}“ gibt es schon. Bitte oben auswählen.</p>}
    </div>
  );
}

// Foto aufnehmen oder auswählen, mit Vorschau und Entfernen.
function PhotoPicker({ files, onChange, multiple, error }: { files: File[]; onChange: (f: File[]) => void; multiple: boolean; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  return (
    <div>
      <input
        ref={inputRef}
        id="foto-input"
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));
          e.target.value = "";
        }}
      />
      {files.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-base hover:bg-muted ${error ? "border-destructive" : LINE}`}
        >
          <Camera className="w-8 h-8 text-muted-foreground" aria-hidden />
          <span className="font-medium">Foto aufnehmen oder auswählen</span>
          <span className="text-sm text-muted-foreground">Am Handy öffnet sich Kamera oder Galerie</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={src} className={`relative aspect-square rounded-md overflow-hidden border ${LINE}`}>
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label={`Foto ${i + 1} entfernen`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-11 h-11 rounded-md bg-background/90 flex items-center justify-center"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>
          ))}
          {multiple && (
            <button type="button" onClick={() => inputRef.current?.click()} className={`aspect-square rounded-md border-2 border-dashed ${LINE} flex flex-col items-center justify-center gap-1 text-sm hover:bg-muted`}>
              <Plus className="w-6 h-6" aria-hidden />
              Weiteres Foto
            </button>
          )}
        </div>
      )}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

type Ansicht = "liste" | "kacheln";
const ANSICHT_KEY = "kwm-ansicht";

// Liste oder Kacheln. Am Handy sind Kacheln Standard, am Rechner die Liste. Die Wahl merkt sich das Gerät.
function useAnsicht(): [Ansicht, (a: Ansicht) => void] {
  const [ansicht, setAnsicht] = useState<Ansicht>(() => {
    try {
      const saved = window.localStorage.getItem(ANSICHT_KEY);
      if (saved === "liste" || saved === "kacheln") return saved;
    } catch {
      // Speicher gesperrt (privates Fenster): Standard nach Bildschirmbreite.
    }
    return window.matchMedia?.(MOBILE_QUERY).matches ? "kacheln" : "liste";
  });
  const choose = (a: Ansicht) => {
    setAnsicht(a);
    try {
      window.localStorage.setItem(ANSICHT_KEY, a);
    } catch {
      // Wahl gilt dann nur bis zum Neuladen.
    }
  };
  return [ansicht, choose];
}

function AnsichtToggle({ value, onChange }: { value: Ansicht; onChange: (a: Ansicht) => void }) {
  const item = (key: Ansicht, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      aria-pressed={value === key}
      aria-label={label}
      title={label}
      onClick={() => onChange(key)}
      className={`inline-flex items-center justify-center h-11 w-11 transition-colors ${value === key ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
    </button>
  );
  return (
    <div role="group" aria-label="Ansicht" className={`inline-flex rounded-md border ${LINE} overflow-hidden divide-x divide-neutral-300 shrink-0`}>
      {item("liste", "Als Liste", <List className="w-5 h-5" aria-hidden />)}
      {item("kacheln", "Als Kacheln", <LayoutGrid className="w-5 h-5" aria-hidden />)}
    </div>
  );
}

// Filter-Knopf am Handy. Die Zahl zeigt, wie viele Filter gerade greifen.
function FilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Knopf variant={count ? "secondary" : "outline"} className="relative h-12 w-12 px-0 shrink-0" aria-label={count ? `Filter, ${count} aktiv` : "Filter"} onClick={onClick}>
      <SlidersHorizontal className="w-5 h-5" aria-hidden />
      {count > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium leading-5 tabular-nums">{count}</span>}
    </Knopf>
  );
}

// Filter am Handy als Blatt von unten (wischbar). Auswahllisten darin öffnen die Auswahl des Telefons.
function FilterSheet({
  open,
  onOpenChange,
  resultText,
  canReset,
  onReset,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultText: string;
  canReset: boolean;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* Hoher z-index: Das Blatt muss über Softrs eigener Navigationsleiste liegen. Am Rechner mittig und schmal statt bildschirmbreit. */}
      <DrawerContent lang="de" className={`z-[99999] sm:mx-auto sm:max-w-lg ${LINE}`}>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl">Filter</DrawerTitle>
          <DrawerDescription className="text-base">Gilt sofort für die Liste.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 space-y-5">{children}</div>
        <DrawerFooter className="pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Knopf className="h-12 text-base">{resultText}</Knopf>
          </DrawerClose>
          <Knopf variant="ghost" className="h-12 text-base" disabled={!canReset} onClick={onReset}>
            Filter zurücksetzen
          </Knopf>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const ds = datasource.define({ unikate: "unikate", edition: "edition", kuenstler: "kuenstler", glasuren: "glasuren", lagerorte: "lagerorte", partner: "partner", modelle: "modelle" });
const kuenstlerSelect = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const glasurSelect = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const lagerortSelect = q.select({ name: "AoOjs", archiviert: "kMBsy" });
const partnerSelect = q.select({ name: "a4yfc", archiviert: "24Tn9" });
const modellSelect = q.select({ glasuren: "EazCZ" });
const glasurNeu = q.select({ name: "OuhBi" });

const unikatSelect = q.select({
  nummer: "T63YN",
  inv: "glG6V",
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  gedreht: "90TmC",
  glasiert: "2PXtk",
  datum: "UfM5S",
  gedrehtAm: "bbA3e",
  glasiertAm: "m4gc9",
  jahr: "ZIHrT",
  glasur: "ByeH3",
  masse: "KDUVZ",
  fotos: "rqreT",
  bildnachweis: "QqQo6",
  lagerort: "EkVC3",
  galerie: "NfsXv",
  preis: "N9yfT",
  website: "e5hSY",
  notiz: "Ku4py",
  erfasstVon: "zjHi8",
  erfasstAm: "p4ha0",
  verkauftAm: "48BXo",
  verkauftAn: "4qhRx",
  seit: "Evxm2",
  rueckgabe: "ENQkk",
  ort: "6YbfO",
  brennart: "8D0WI",
  glasurrezept: "XhsmV",
});
const unikatUpdateFields = q.select({
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  gedreht: "90TmC",
  glasiert: "2PXtk",
  datum: "UfM5S",
  gedrehtAm: "bbA3e",
  glasiertAm: "m4gc9",
  jahr: "ZIHrT",
  glasur: "ByeH3",
  masse: "KDUVZ",
  bildnachweis: "QqQo6",
  lagerort: "EkVC3",
  galerie: "NfsXv",
  preis: "N9yfT",
  website: "e5hSY",
  notiz: "Ku4py",
  verkauftAm: "48BXo",
  verkauftAn: "4qhRx",
  seit: "Evxm2",
  rueckgabe: "ENQkk",
  ort: "6YbfO",
  brennart: "8D0WI",
  glasurrezept: "XhsmV",
  fotos: "rqreT",
});
const editionSelect = q.select({
  modell: "jxN6x",
  typ: "8Vs2H",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  lagerort: "T5iQe",
  foto: "nibt5",
  notiz: "lyJky",
  artikelnr: "Zzp1S",
  programm: "IIAdh",
  brand: "jqmqn",
  reserviert: "L1bO5",
  status: "v9V6W",
  partner: "hs3iV",
  rueckgabe: "nBkRl",
  gedreht: "7FQQm",
  glasiert: "dkREk",
  masse: "eVHco",
});
const editionUpdateFields = q.select({ anzahl: "Ciiwp", lagerort: "T5iQe", notiz: "lyJky", masse: "eVHco" });
const editionCreateFields = q.select({
  bezeichnung: "LFUIR",
  modell: "jxN6x",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  lagerort: "T5iQe",
  brand: "jqmqn",
  reserviert: "L1bO5",
  status: "v9V6W",
  partner: "hs3iV",
  rueckgabe: "nBkRl",
  gedreht: "7FQQm",
  glasiert: "dkREk",
  masse: "eVHco",
});
const AUSSER_STATUS: Opt[] = [AUSGESTELLT, KOMMISSION].map((s) => ({ id: s, label: s }));

const LIST_STEP = 50;
const LETZTE_BRAENDE = 3;
const UNDO_MS = 10000;

type Unikat = {
  id: string;
  nummer: number;
  inv: string;
  name: string;
  typ: string;
  status: string;
  gedreht: Opt | undefined;
  glasiert: Opt | undefined;
  datum: string;
  gedrehtAm: string;
  glasiertAm: string;
  jahr: number | null;
  glasur: Opt[];
  masse: string;
  fotos: Attachment[];
  bildnachweis: string;
  lagerort: Opt | undefined;
  galerie: Opt | undefined;
  preis: number | null;
  website: boolean;
  notiz: string;
  erfasstVon: string;
  erfasstAm: string;
  verkauftAm: string;
  verkauftAn: string;
  seit: string;
  rueckgabe: string;
  ort: string;
  brennart: string;
  glasurrezept: string;
};

// Drei Serien der Werkstatt. Geschirr und Edition sind Mengenware (Stück je Zustand), Unikate Einzelstücke.
type Art = "geschirr" | "edition" | "unikat";
type TabKey = "imhaus" | "kommission" | "verkauft" | "alle";
type StammData = { pages: { items: unknown[] }[] } | undefined;
type Stamm = { lagerorte: StammData; partner: StammData; kuenstler: StammData; glasuren: StammData };
type SortKey = "neu" | "name" | "nummer" | "preis" | "lagerort";

// „kommission“ bleibt als Schlüssel, weil Links aus der Übersicht ihn verwenden.
const TABS: { key: TabKey; label: string; match?: (u: Unikat) => boolean }[] = [
  { key: "imhaus", label: "Im Haus", match: (u) => u.status === VERFUEGBAR || u.status === RESERVIERT },
  { key: "kommission", label: "Außer Haus", match: (u) => isAusserHaus(u.status) },
  { key: "verkauft", label: "Verkauft", match: (u) => u.status === VERKAUFT },
  { key: "alle", label: "Alle" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "neu", label: "Neueste zuerst" },
  { key: "name", label: "Name A–Z" },
  { key: "nummer", label: "Inventarnummer" },
  { key: "preis", label: "Preis absteigend" },
  { key: "lagerort", label: "Lagerort" },
];

type MengenFilter = "alle" | "reserviert" | "ausser" | (typeof ZUSTAENDE)[number];
const MENGEN_FILTER: { key: MengenFilter; label: string; match: (s: ModellStand) => boolean }[] = [
  { key: "alle", label: "Alle", match: () => true },
  { key: GESCHRUEHT, label: "Geschrüht", match: (s) => (s.je[GESCHRUEHT] ?? 0) > 0 },
  { key: GLASIERT, label: "Glasiert", match: (s) => (s.je[GLASIERT] ?? 0) > 0 },
  { key: ROH, label: "Roh", match: (s) => (s.je[ROH] ?? 0) > 0 },
  { key: "reserviert", label: "Reserviert", match: (s) => s.reserviert > 0 },
  { key: "ausser", label: "Außer Haus", match: (s) => s.ausserHaus > 0 },
];
// Diese Filter erscheinen nur, wenn es solche Ware gibt.
const NUR_WENN_VORHANDEN: MengenFilter[] = [ROH, "ausser"];

function initialParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

// ?tab=geschirr | edition, sonst die Unikate (auch die alten Links mit Status, z. B. ?tab=kommission).
function initialArt(): Art {
  const t = initialParam("tab");
  return t === "edition" ? "edition" : t === "geschirr" || !t ? "geschirr" : "unikat";
}

function toUnikat(item: RawItem): Unikat {
  const f = item.fields;
  return {
    id: item.id,
    nummer: num(f.nummer) ?? 0,
    inv: str(f.inv),
    name: str(f.name),
    typ: asOpts(f.typ)[0]?.label ?? "",
    status: asOpts(f.status)[0]?.label ?? "",
    gedreht: asOpts(f.gedreht)[0],
    glasiert: asOpts(f.glasiert)[0],
    datum: str(f.datum),
    gedrehtAm: str(f.gedrehtAm),
    glasiertAm: str(f.glasiertAm),
    jahr: num(f.jahr),
    glasur: asOpts(f.glasur),
    masse: str(f.masse),
    fotos: asAttachments(f.fotos),
    bildnachweis: str(f.bildnachweis),
    lagerort: asOpts(f.lagerort)[0],
    galerie: asOpts(f.galerie)[0],
    preis: num(f.preis),
    website: f.website === true,
    notiz: str(f.notiz),
    erfasstVon: str(f.erfasstVon),
    erfasstAm: str(f.erfasstAm),
    verkauftAm: str(f.verkauftAm),
    verkauftAn: str(f.verkauftAn),
    seit: str(f.seit),
    rueckgabe: str(f.rueckgabe),
    ort: str(f.ort),
    brennart: str(f.brennart),
    glasurrezept: str(f.glasurrezept),
  };
}

// Ältere Stücke haben nur ein Jahr, neue ein Datum.
function datumText(u: Unikat): string {
  return u.datum ? formatDate(u.datum) : u.jahr !== null ? String(u.jahr) : "";
}

function ortVon(u: Unikat): string {
  return (isAusserHaus(u.status) && u.galerie ? u.galerie.label : u.lagerort?.label) ?? "";
}

function matchesSearch(u: Unikat, term: string): boolean {
  if (!term) return true;
  const hay = [u.name, u.inv, u.typ, u.status, u.gedreht?.label, u.glasiert?.label, u.lagerort?.label, u.galerie?.label, u.notiz, u.masse, ...u.glasur.map((g) => g.label)].join(" ").toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .every((t) => hay.includes(t));
}

function compare(a: Unikat, b: Unikat, key: SortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name, "de");
    case "nummer":
      return a.nummer - b.nummer;
    case "preis":
      return (b.preis ?? -1) - (a.preis ?? -1);
    case "lagerort":
      return (ortVon(a) || "~").localeCompare(ortVon(b) || "~", "de");
    default:
      return b.erfasstAm.localeCompare(a.erfasstAm);
  }
}

type EditForm = {
  name: string;
  typ: string;
  gedrehtId: string;
  glasiertId: string;
  datum: string;
  gedrehtAm: string;
  glasiertAm: string;
  glasurIds: string[];
  masse: string;
  bildnachweis: string;
  preis: string;
  website: boolean;
  verkauftAm: string;
  verkauftAn: string;
  notiz: string;
  ort: string;
  brennart: string;
  glasurrezept: string;
};

function UnikatDetail({
  u,
  onClose,
  onSaved,
  stamm,
  typen,
  statusListe,
  kunden,
}: {
  u: Unikat;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  stamm: Stamm;
  typen: Opt[];
  statusListe: Opt[];
  kunden: string[];
}) {
  const lagerorte = activeOptions(stamm.lagerorte, link(u.lagerort?.id));
  const galerien = activeOptions(stamm.partner, link(u.galerie?.id));
  const personen = activeOptions(stamm.kuenstler, [u.gedreht?.id, u.glasiert?.id].filter((id): id is string => !!id));
  const glasuren = activeOptions(
    stamm.glasuren,
    u.glasur.map((g) => g.id),
  );
  const initial: EditForm = {
    name: u.name,
    typ: u.typ,
    gedrehtId: u.gedreht?.id ?? "",
    glasiertId: u.glasiert?.id ?? "",
    datum: u.datum.slice(0, 10),
    gedrehtAm: u.gedrehtAm.slice(0, 10),
    glasiertAm: u.glasiertAm.slice(0, 10),
    glasurIds: u.glasur.map((g) => g.id),
    masse: u.masse,
    bildnachweis: u.bildnachweis,
    preis: u.preis !== null ? String(u.preis) : "",
    website: u.website,
    verkauftAm: u.verkauftAm.slice(0, 10),
    verkauftAn: u.verkauftAn,
    notiz: u.notiz,
    ort: u.ort,
    brennart: u.brennart,
    glasurrezept: u.glasurrezept,
  };
  const [editing, setEditing] = useState(false);
  const [einzelDaten, setEinzelDaten] = useState(false);
  const [werkOffen, setWerkOffen] = useState(false);
  const [form, setForm] = useState<EditForm>(initial);
  const [formError, setFormError] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [photoIndex, setPhotoIndex] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState<{ text: string; fields: Record<string, unknown> } | null>(null);
  const { uploadAsync } = useUpload();
  const update = useRecordUpdate({ from: ds.unikate, fields: unikatUpdateFields });
  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [undo]);
  const set = <K extends keyof EditForm>(k: K, v: EditForm[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
    setFormError((e) => ({ ...e, [k]: undefined }));
  };
  const photo = u.fotos[Math.min(photoIndex, u.fotos.length - 1)];

  async function quickSave(fields: Record<string, unknown>, message: string, undoFields?: Record<string, unknown>) {
    setBusy(true);
    try {
      await update.mutateAsync({ recordId: u.id, fields } as never);
      await onSaved();
      toast.success(message);
      setUndo(undoFields ? { text: message, fields: undoFields } : null);
    } catch {
      toast.error("Speichern hat nicht geklappt. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  // Das erste Foto ist das Hauptbild. Umsortieren ändert nur die Reihenfolge, kein Foto geht verloren.
  function makeMainPhoto(index: number) {
    const fotos = [u.fotos[index], ...u.fotos.filter((_, i) => i !== index)].map((a) => ({ id: a.id, url: a.url, filename: a.filename }));
    setPhotoIndex(0);
    quickSave({ fotos }, "Hauptbild geändert");
  }

  // Dieselben Regeln laufen zusätzlich als Softr-Workflow auf der Datenbank. Hier sorgen sie für sofortige Anzeige und „Rückgängig“.
  function changeStatus(status: string) {
    if (status === u.status || busy) return;
    const fields: Record<string, unknown> = { status, verkauftAm: status === VERKAUFT ? today() : null };
    const ausserHausOrt = lagerorte.find((l) => l.label === AUSSER_HAUS_ORT)?.id;
    if (!isAusserHaus(status)) {
      Object.assign(fields, { galerie: [], seit: null, rueckgabe: null });
      if (isAusserHaus(u.status)) fields.lagerort = [];
    } else if (!isAusserHaus(u.status)) {
      fields.seit = today();
      if (ausserHausOrt) fields.lagerort = [ausserHausOrt];
    }
    const before = {
      status: u.status,
      lagerort: link(u.lagerort?.id),
      verkauftAm: u.verkauftAm ? u.verkauftAm.slice(0, 10) : null,
      galerie: link(u.galerie?.id),
      seit: u.seit ? u.seit.slice(0, 10) : null,
      rueckgabe: u.rueckgabe ? u.rueckgabe.slice(0, 10) : null,
    };
    quickSave(fields, `Status: ${status}`, before);
  }

  async function saveAll() {
    const preis = parseNumber(form.preis);
    const errors: Partial<Record<keyof EditForm, string>> = {};
    if (!form.name.trim()) errors.name = "Bitte einen Namen eingeben.";
    if (form.preis.trim() && (preis === null || preis < 0)) errors.preis = "Bitte einen Betrag in Euro eingeben, z. B. 1.200.";
    setFormError(errors);
    if (Object.keys(errors).length) return;
    // Leer gelassenes Datum gilt als Tag der Erfassung. Ältere Stücke ohne Datum behalten ihr Jahr.
    const datum = form.datum || (u.datum ? u.erfasstAm.slice(0, 10) : "");
    setBusy(true);
    try {
      let fotos: { id?: string; url: string; filename?: string }[] | undefined;
      if (newFiles.length) {
        const results = await uploadAsync(newFiles);
        if (results.some((r) => r.status !== "completed")) throw new Error("Foto konnte nicht hochgeladen werden.");
        // Neue Fotos hinten anhängen: Das erste Foto ist das Hauptbild und bleibt es.
        fotos = [...u.fotos.map((a) => ({ id: a.id, url: a.url, filename: a.filename })), ...results.map((r) => ({ url: r.url as string, filename: r.file.name }))];
      }
      await update.mutateAsync({
        recordId: u.id,
        fields: {
          name: form.name.trim(),
          typ: form.typ,
          gedreht: link(form.gedrehtId),
          glasiert: link(form.glasiertId),
          datum: datum || null,
          jahr: datum ? Number(datum.slice(0, 4)) : u.jahr,
          gedrehtAm: form.gedrehtAm || null,
          glasiertAm: form.glasiertAm || null,
          glasur: form.glasurIds,
          masse: form.masse.trim(),
          bildnachweis: form.bildnachweis.trim(),
          preis,
          website: form.website,
          verkauftAm: form.verkauftAm || null,
          verkauftAn: form.verkauftAn.trim(),
          notiz: form.notiz.trim(),
          ort: form.ort.trim(),
          brennart: form.brennart.trim(),
          glasurrezept: form.glasurrezept.trim(),
          ...(fotos ? { fotos } : {}),
        },
      } as never);
      await onSaved();
      setNewFiles([]);
      setEditing(false);
      toast.success("Änderungen gespeichert.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  }

  const facts: [string, string][] = [
    ["Preis intern", u.preis !== null ? euro.format(u.preis) : ""],
    ["Datum", datumText(u)],
    ["Gedreht von", [u.gedreht?.label, u.gedrehtAm && `am ${formatDate(u.gedrehtAm)}`].filter(Boolean).join(" ")],
    ["Glasiert von", [u.glasiert?.label, u.glasiertAm && `am ${formatDate(u.glasiertAm)}`].filter(Boolean).join(" ")],
    ["Glasur", u.glasur.map((g) => g.label).join(", ")],
    ["Maße", u.masse],
    ["Außer Haus seit", formatDate(u.seit)],
    ["Auf Website zeigen", u.website ? "ja" : "nein"],
    ["Verkauft", [u.verkauftAn && `an ${u.verkauftAn}`, u.verkauftAm && `am ${formatDate(u.verkauftAm)}`].filter(Boolean).join(" ")],
    ["Bildnachweis", u.bildnachweis],
    ["Erfasst", [formatDate(u.erfasstAm), u.erfasstVon].filter(Boolean).join(", von ")],
    // Werkangaben bleiben im Hintergrund: nur sichtbar, wenn sie ausgefüllt sind.
    ...([
      ["Ort", u.ort],
      ["Brennart", u.brennart],
    ] as [string, string][]).filter(([, v]) => v),
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-3xl`}>
        <PanelHeader title={u.name || "Ohne Namen"} description={[u.inv, u.typ, u.preis !== null ? euro.format(u.preis) : ""].filter(Boolean).join(" · ")} />
        <div className="pb-2 space-y-6" lang="de">
          {!update.enabled && <StatusBadge text={u.status} />}
          {update.enabled && !editing && (
            <section className="space-y-4" aria-labelledby="schnell-titel">
              <h3 id="schnell-titel" className="text-base font-semibold">
                Schnell ändern <span className="font-normal text-muted-foreground">· wird sofort gespeichert</span>
              </h3>
              <div>
                <FieldLabel>Status</FieldLabel>
                <ChoiceChips label="Status" options={statusListe} value={u.status} onChange={changeStatus} statusColors disabled={busy} />
              </div>
              <div>
                <FieldLabel htmlFor="d-lagerort">Lagerort</FieldLabel>
                <OptionSelect
                  id="d-lagerort"
                  value={u.lagerort?.id ?? ""}
                  disabled={busy}
                  onChange={(v) => quickSave({ lagerort: link(v) }, `Lagerort: ${lagerorte.find((l) => l.id === v)?.label ?? "keiner"}`, { lagerort: link(u.lagerort?.id) })}
                  options={lagerorte}
                  placeholder="Kein Lagerort"
                />
                {!u.lagerort && !isAusserHaus(u.status) && u.status !== VERKAUFT && <p className="text-sm text-amber-800 mt-1.5">Bitte Lagerort wählen.</p>}
              </div>
              {isAusserHaus(u.status) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel htmlFor="d-galerie">Partner (Galerie, Museum …)</FieldLabel>
                    <OptionSelect
                      id="d-galerie"
                      value={u.galerie?.id ?? ""}
                      disabled={busy}
                      onChange={(v) => quickSave({ galerie: link(v) }, `Partner: ${galerien.find((g) => g.id === v)?.label ?? "keiner"}`, { galerie: link(u.galerie?.id) })}
                      options={galerien}
                      placeholder="Partner wählen"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="d-rueckgabe">Rückgabe bis</FieldLabel>
                    <Feld
                      id="d-rueckgabe"
                      type="date"
                      disabled={busy}
                      defaultValue={u.rueckgabe.slice(0, 10)}
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v === u.rueckgabe.slice(0, 10)) return;
                        quickSave({ rueckgabe: v || null }, `Rückgabe bis: ${v ? formatDate(v) : "offen"}`, { rueckgabe: u.rueckgabe ? u.rueckgabe.slice(0, 10) : null });
                      }}
                    />
                  </div>
                </div>
              )}
              {busy && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Wird gespeichert …
                </p>
              )}
              {undo && !busy && (
                <div role="status" className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2 pl-3">
                  <span className="text-sm">{undo.text} gespeichert</span>
                  <Knopf
                    variant="outline"
                    className="h-11 text-base"
                    onClick={() => {
                      const fields = undo.fields;
                      setUndo(null);
                      quickSave(fields, "Rückgängig gemacht");
                    }}
                  >
                    Rückgängig
                  </Knopf>
                </div>
              )}
            </section>
          )}

          {!editing && (
            <>
              {photo ? (
                <div className="space-y-2">
                  <img src={thumb(photo, "large")} alt={u.name} className="w-full max-h-64 object-contain rounded-lg bg-muted" />
                  {u.fotos.length > 1 &&
                    (photoIndex === 0 ? (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" aria-hidden /> Hauptbild, erscheint in Listen und Kacheln
                      </p>
                    ) : (
                      <Knopf variant="ghost" className="h-11 px-2 text-base" disabled={busy || !update.enabled} onClick={() => makeMainPhoto(photoIndex)}>
                        <Star className="w-5 h-5 mr-1.5" aria-hidden /> Als Hauptbild verwenden
                      </Knopf>
                    ))}
                  {u.fotos.length > 1 && (
                    <div className={`flex gap-2 ${WISCHEN}`}>
                      {u.fotos.map((a, i) => (
                        <button
                          key={a.id ?? a.url}
                          type="button"
                          aria-label={`Foto ${i + 1} zeigen`}
                          onClick={() => setPhotoIndex(i)}
                          className={`shrink-0 rounded-md overflow-hidden border-2 ${i === photoIndex ? "border-primary" : "border-transparent"}`}
                        >
                          <img src={thumb(a, "small")} alt="" className="w-16 h-16 object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-24 rounded-lg bg-muted flex items-center justify-center gap-2 text-muted-foreground">
                  <ImageOff className="w-5 h-5" aria-hidden /> Noch kein Foto
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="text-base break-words">{value || "–"}</dd>
                  </div>
                ))}
              </dl>
              {u.notiz && (
                <div>
                  <p className="text-sm text-muted-foreground">Notiz</p>
                  <p className="text-base whitespace-pre-line">{u.notiz}</p>
                </div>
              )}
              {u.glasurrezept && (
                <div>
                  <p className="text-sm text-muted-foreground">Glasurrezept</p>
                  <p className="text-base whitespace-pre-line">{u.glasurrezept}</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {update.enabled && (
                  <Knopf onClick={() => setEditing(true)}>
                    <Pencil className="w-5 h-5 mr-2" aria-hidden /> Alle Angaben bearbeiten
                  </Knopf>
                )}
                <p className="text-sm text-muted-foreground">Löschen ist nicht vorgesehen. Verkaufte Stücke bitte auf „verkauft“ setzen.</p>
                <DoneButton />
              </div>
            </>
          )}

          {editing && (
            <section className="space-y-5" aria-label="Alle Angaben bearbeiten">
              <div>
                <FieldLabel htmlFor="d-name" required>
                  Name
                </FieldLabel>
                <Feld id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!formError.name} />
                <ErrorText>{formError.name}</ErrorText>
              </div>
              <div>
                <FieldLabel>Typ</FieldLabel>
                <ChoiceChips label="Typ" options={typen} value={form.typ} onChange={(v) => set("typ", v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-gedreht">Gedreht von</FieldLabel>
                  <OptionSelect id="d-gedreht" value={form.gedrehtId} onChange={(v) => set("gedrehtId", v)} options={personen} placeholder="Bitte wählen" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-glasiert">Glasiert von</FieldLabel>
                  <OptionSelect id="d-glasiert" value={form.glasiertId} onChange={(v) => set("glasiertId", v)} options={personen} placeholder="Bitte wählen" />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="d-datum">Datum</FieldLabel>
                <Feld id="d-datum" type="date" value={form.datum} onChange={(e) => set("datum", e.target.value)} />
                {!u.datum && u.jahr !== null && <Hint>{`Bisher nur das Jahr ${u.jahr} bekannt.`}</Hint>}
                {einzelDaten || form.gedrehtAm || form.glasiertAm ? (
                  <div className="grid sm:grid-cols-2 gap-5 mt-4">
                    <div>
                      <FieldLabel htmlFor="d-gedreht-am">Gedreht am</FieldLabel>
                      <Feld id="d-gedreht-am" type="date" value={form.gedrehtAm} onChange={(e) => set("gedrehtAm", e.target.value)} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="d-glasiert-am">Glasiert am</FieldLabel>
                      <Feld id="d-glasiert-am" type="date" value={form.glasiertAm} onChange={(e) => set("glasiertAm", e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <ZusatzKnopf label="Gedreht am und glasiert am einzeln angeben" onClick={() => setEinzelDaten(true)} />
                  </div>
                )}
              </div>
              <div>
                <FieldLabel>Glasur</FieldLabel>
                <SearchPick label="Glasuren" createNoun="Glasur" options={glasuren} value={form.glasurIds} onChange={(ids) => set("glasurIds", ids)} multiple />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-masse">Maße</FieldLabel>
                  <Feld id="d-masse" value={form.masse} onChange={(e) => set("masse", e.target.value)} placeholder="z. B. Ø 24 × H 8 cm" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-bildnachweis">Bildnachweis</FieldLabel>
                  <Feld id="d-bildnachweis" value={form.bildnachweis} onChange={(e) => set("bildnachweis", e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-preis">Preis intern (€)</FieldLabel>
                  <Feld id="d-preis" inputMode="decimal" value={form.preis} onChange={(e) => set("preis", e.target.value)} placeholder="z. B. 480" aria-invalid={!!formError.preis} />
                  <ErrorText>{formError.preis}</ErrorText>
                </div>
                <SchalterFeld id="d-website" label="Auf Website zeigen" checked={form.website} onChange={(v) => set("website", v)} lage="self-end" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-verkauft-an">Verkauft an</FieldLabel>
                  <TextMitVorschlag id="d-verkauft-an" value={form.verkauftAn} onChange={(v) => set("verkauftAn", v)} vorschlaege={kunden} placeholder="Name der Käuferin oder des Käufers" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-verkauft">Verkauft am</FieldLabel>
                  <Feld id="d-verkauft" type="date" value={form.verkauftAm} onChange={(e) => set("verkauftAm", e.target.value)} />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="d-notiz">Notiz</FieldLabel>
                <Textfeld id="d-notiz" rows={3} value={form.notiz} onChange={(e) => set("notiz", e.target.value)} />
              </div>
              {werkOffen || form.ort || form.brennart || form.glasurrezept ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel htmlFor="d-ort">Ort</FieldLabel>
                      <Feld id="d-ort" value={form.ort} onChange={(e) => set("ort", e.target.value)} placeholder="z. B. Essen" />
                    </div>
                    <div>
                      <FieldLabel htmlFor="d-brennart">Brennart</FieldLabel>
                      <Feld id="d-brennart" value={form.brennart} onChange={(e) => set("brennart", e.target.value)} placeholder="z. B. Holzbrand, reduzierend" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel htmlFor="d-glasurrezept">Glasurrezept</FieldLabel>
                    <Textfeld id="d-glasurrezept" rows={2} value={form.glasurrezept} onChange={(e) => set("glasurrezept", e.target.value)} />
                  </div>
                </>
              ) : (
                <ZusatzKnopf label="Werkangaben: Ort, Brennart, Glasurrezept" onClick={() => setWerkOffen(true)} />
              )}
              <div>
                <FieldLabel htmlFor="foto-input">Fotos hinzufügen</FieldLabel>
                <PhotoPicker files={newFiles} onChange={setNewFiles} multiple />
              </div>
              <div className="flex gap-3">
                <Knopf
                  variant="outline"
                  className="h-12 flex-1 text-base"
                  disabled={busy}
                  onClick={() => {
                    setForm(initial);
                    setEinzelDaten(false);
                    setFormError({});
                    setNewFiles([]);
                    setEditing(false);
                  }}
                >
                  Abbrechen
                </Knopf>
                <Knopf className="h-12 flex-1 text-base" disabled={busy} onClick={saveAll}>
                  {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : <Check className="w-5 h-5 mr-2" aria-hidden />}
                  Speichern
                </Knopf>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Kachel: Hauptbild groß, darunter Name, Nummer, Ort und Preis. Mehrere Fotos zeigt eine kleine Zahl.
function UnikatTile({ u, onOpen }: { u: Unikat; onOpen: () => void }) {
  const main = u.fotos[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`text-left ${PANEL_CLASS} overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      <span className="relative block aspect-square bg-muted">
        {main ? (
          <img src={thumb(main, "medium")} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/60" aria-label="Kein Foto">
            <ImageOff className="w-6 h-6" aria-hidden />
          </span>
        )}
        <span className="absolute left-2 top-2">
          <StatusBadge text={u.status} />
        </span>
        {u.fotos.length > 1 && (
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium tabular-nums" aria-label={`${u.fotos.length} Fotos`}>
            <Images className="w-3.5 h-3.5" aria-hidden />
            {u.fotos.length}
          </span>
        )}
      </span>
      <span className="block p-3 space-y-0.5">
        <span className="block font-medium leading-snug line-clamp-2 hyphens-auto">{u.name || "Ohne Namen"}</span>
        <span className="block text-sm text-muted-foreground truncate">{[u.inv, ortVon(u)].filter(Boolean).join(" · ")}</span>
        {u.preis !== null && <span className="block text-sm tabular-nums">{euro.format(u.preis)}</span>}
      </span>
    </button>
  );
}

type InventurChange = { e: Posten; gezaehlt: number };
const INVENTUR_KEY = "kwm-inventur";

function loadCounts(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(INVENTUR_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// Inventur: gezählte Menge je Posten eintippen, Abweichungen sehen und gesammelt übernehmen.
// Die Zahlen bleiben auf dem Gerät gespeichert, bis sie übernommen sind (Neuladen oder Unterbrechung schadet nicht).
function InventurView({ rows, onApply, onClose }: { rows: Posten[]; onApply: (changes: InventurChange[]) => Promise<string[]>; onClose: () => void }) {
  const [counts, setCounts] = useState<Record<string, string>>(loadCounts);
  const [ort, setOrt] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      window.localStorage.setItem(INVENTUR_KEY, JSON.stringify(counts));
    } catch {
      // Ohne Speicher gelten die Zahlen bis zum Neuladen.
    }
  }, [counts]);

  const orte = [...new Set(rows.map((e) => e.lagerort?.label ?? "Ohne Lagerort"))].sort((a, b) => (a === "Ohne Lagerort" ? 1 : b === "Ohne Lagerort" ? -1 : a.localeCompare(b, "de")));
  const shown = rows.filter((e) => !ort || (e.lagerort?.label ?? "Ohne Lagerort") === ort);
  const groups = orte.filter((o) => !ort || o === ort).map((o) => ({ ort: o, rows: shown.filter((e) => (e.lagerort?.label ?? "Ohne Lagerort") === o) }));
  const gezaehlt = rows.filter((e) => counts[e.id] !== undefined && counts[e.id] !== "");
  const changes: InventurChange[] = gezaehlt.map((e) => ({ e, gezaehlt: Number(counts[e.id]) })).filter((c) => c.gezaehlt !== c.e.anzahl);

  async function apply() {
    setBusy(true);
    const offen = await onApply(changes);
    setCounts((c) => Object.fromEntries(Object.entries(c).filter(([id]) => offen.includes(id))));
    setBusy(false);
    setConfirm(false);
  }

  return (
    <div className="space-y-4">
      <div className={`${PANEL_CLASS} p-4 flex flex-wrap items-center gap-3`}>
        <div className="flex-1 min-w-48">
          <p className="font-medium">Inventur</p>
          <p className="text-sm text-muted-foreground">Gezählte Menge eintippen. Übernommen wird erst am Ende, gesammelt.</p>
        </div>
        <Auswahl aria-label="Lagerort" value={ort} onChange={(ev) => setOrt(ev.target.value)} breite="w-auto min-w-48">
          <option value="">Alle Lagerorte</option>
          {orte.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Auswahl>
        <Knopf variant="outline" className="h-12 text-base" onClick={onClose}>
          Inventur beenden
        </Knopf>
      </div>

      {groups.map((g) => (
        <section key={g.ort} className={`${PANEL_CLASS} px-4`}>
          <h2 className="py-3 font-semibold border-b">{g.ort}</h2>
          <ul className="divide-y">
            {g.rows.map((e) => {
              const value = counts[e.id] ?? "";
              const delta = value === "" ? null : Number(value) - e.anzahl;
              return (
                <li key={e.id} className="flex items-center gap-3 py-2">
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium truncate">{e.modell}</span>
                    <span className="block text-sm text-muted-foreground">{[e.zustand, postenText(e), e.reserviert && `für ${e.reserviert}`].filter((t, i, all) => t && all.indexOf(t) === i).join(" · ")}</span>
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">Soll {zahl.format(e.anzahl)}</span>
                  <Feld
                    inputMode="numeric"
                    aria-label={`${e.modell} ${postenText(e)}: gezählt`}
                    placeholder="–"
                    value={value}
                    onChange={(ev) => setCounts((c) => ({ ...c, [e.id]: ev.target.value.replace(/\D/g, "").slice(0, 5) }))}
                    className="h-11 w-20 text-center text-base md:text-base"
                  />
                  <span className={`w-12 text-right text-sm font-medium tabular-nums ${delta === null ? "" : delta === 0 ? "text-emerald-700" : "text-amber-800"}`}>
                    {delta === null ? "" : delta === 0 ? <Check className="inline w-4 h-4" aria-label="stimmt" /> : delta > 0 ? `+${delta}` : `−${-delta}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className={`sticky ${STICKY_BOTTOM} z-10`}>
        <div className={`${PANEL_CLASS} shadow-md p-3 flex flex-wrap items-center gap-3`}>
          <span className="flex-1 text-base">
            {zahl.format(gezaehlt.length)} gezählt · <strong>{zahl.format(changes.length)}</strong> {changes.length === 1 ? "Abweichung" : "Abweichungen"}
          </span>
          <Knopf className="h-12 text-base" disabled={changes.length === 0 || busy} onClick={() => setConfirm(true)}>
            Abweichungen übernehmen
          </Knopf>
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={(o) => !busy && setConfirm(o)}>
        <DialogContent className={`${DIALOG_CLASS} max-w-lg`}>
          <PanelHeader title={`${changes.length} ${changes.length === 1 ? "Änderung" : "Änderungen"} übernehmen`} description="Der Bestand wird auf die gezählten Mengen gesetzt." />
          <ul className="divide-y text-base">
            {changes.map((c) => (
              <li key={c.e.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 truncate">{[c.e.modell, postenText(c.e)].join(" · ")}</span>
                <span className="tabular-nums whitespace-nowrap">
                  {zahl.format(c.e.anzahl)} → <strong>{zahl.format(c.gezaehlt)}</strong>
                </span>
              </li>
            ))}
          </ul>
          <div className="pt-2 space-y-2">
            <Knopf className="w-full h-12 text-base" disabled={busy} onClick={apply}>
              {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
              Jetzt übernehmen
            </Knopf>
            <DoneButton />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type MengenArt = "reservieren" | "freigeben" | "ausstellen" | "zurueck" | "ausbuchen";
type Schritt = { art: "liste" } | { art: "brand"; glasurId: string; glasur: string; brand: string } | { art: "wahl" | "weiter" | "korrigieren" | MengenArt; p: Posten };
type UmbuchenFn = (p: Posten, auftrag: { entnommen: number; ausschuss: number; ziel: PostenKey | null; glasur: string; lagerortId: string; meldung: string }) => Promise<boolean>;
type KorrigierenFn = (p: Posten, fields: { anzahl: number; lagerort: string[]; notiz: string; masse: string }) => Promise<boolean>;
type Auswahlen = { modellGlasuren: Opt[]; glasuren: Opt[]; lagerorte: Opt[]; personen: Opt[]; partner: Opt[]; kunden: string[]; braende: string[]; onGlasurNeu: (name: string) => Promise<string | null> };

// Antwort auf „Wie viele kann ich zusammen verkaufen?“: je Glasur die freie Ware im Haus, aufgeteilt nach Brand.
// Nur Stücke aus einem Brand haben denselben Farbton. Einen Brand antippen reserviert direkt daraus.
// Darunter, wie viel geschrühte Ware zum Nachglasieren bereitliegt.
function ZusammenVerkaufbar({ posten, onReservieren, onNachglasieren }: { posten: Posten[]; onReservieren?: (g: BrandGruppe, brand: string) => void; onNachglasieren?: (p: Posten) => void }) {
  const gruppen = brandGruppen(posten);
  const geschrueht = posten.filter((p) => p.zustand === GESCHRUEHT && !p.reserviert && !ausserHaus(p) && p.anzahl > 0).sort((a, b) => b.anzahl - a.anzahl);
  const geschruehtSumme = geschrueht.reduce((n, p) => n + p.anzahl, 0);
  if (!gruppen.length && !geschruehtSumme) return null;
  return (
    <section className={`${PANEL_CLASS} p-3 space-y-3`}>
      <div>
        <h3 className="font-semibold">Zusammen verkaufbar</h3>
        <p className="text-sm text-muted-foreground">{`Frei, im Haus und aus einem Brand, also im selben Farbton.${onReservieren ? " Brand antippen zum Reservieren." : ""}`}</p>
      </div>
      {gruppen.map((g) => (
        <div key={g.glasurId || "ohne"}>
          <p className="font-medium">
            {g.glasur || "Ohne Glasur"} <span className="font-normal text-muted-foreground">{g.braende.length > 1 ? `· ${g.gesamt} frei, bis zu ${g.zusammen} zusammen` : `· ${g.gesamt} frei`}</span>
          </p>
          <ul className="divide-y">
            {g.braende.map((b) => (
              <li key={b.brand || "unbekannt"}>
                <ListRow title={brandName(b.brand)} meta={<span className="text-lg font-semibold tabular-nums">{zahl.format(b.anzahl)}</span>} onClick={onReservieren ? () => onReservieren(g, b.brand) : undefined} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {geschruehtSumme > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted p-3">
          <p className="text-base">
            Zum Nachglasieren: <strong>{zahl.format(geschruehtSumme)} geschrüht</strong>
          </p>
          {onNachglasieren && (
            <Knopf variant="outline" className="h-11 text-base" onClick={() => onNachglasieren(geschrueht[0])}>
              Glasieren
            </Knopf>
          )}
        </div>
      )}
    </section>
  );
}

// Reservieren direkt aus einem Brand: zieht die Stück aus den freien Posten dieser Glasur und dieses Brands.
function BrandReservieren({ posten, glasurId, glasur, brand, auswahl, onUmbuchen, onFertig, onZurueck }: { posten: Posten[]; glasurId: string; glasur: string; brand: string; auswahl: Auswahlen; onUmbuchen: UmbuchenFn; onFertig: () => void; onZurueck: () => void }) {
  const quelle = posten.filter((p) => verkaufbar(p) && p.glasurId === glasurId && p.brand === brand).sort((a, b) => b.anzahl - a.anzahl);
  const frei = quelle.reduce((n, p) => n + p.anzahl, 0);
  const [anzahl, setAnzahl] = useState(frei);
  const [fuer, setFuer] = useState("");
  const [fehler, setFehler] = useState("");
  const [busy, setBusy] = useState(false);

  async function speichern() {
    if (!fuer.trim()) {
      setFehler("Bitte angeben, für wen reserviert wird.");
      return;
    }
    setBusy(true);
    let rest = anzahl;
    for (const p of quelle) {
      if (rest <= 0) break;
      const n = Math.min(rest, p.anzahl);
      const ok = await onUmbuchen(p, { entnommen: n, ausschuss: 0, ziel: { ...keyVon(p), reserviert: fuer.trim() }, glasur: p.glasur, lagerortId: p.lagerort?.id ?? "", meldung: "" });
      if (!ok) {
        setBusy(false);
        return;
      }
      rest -= n;
    }
    toast.success(`${anzahl} Stück ${glasur} (${brandName(brand)}) für ${fuer.trim()} reserviert.`);
    setBusy(false);
    onFertig();
  }

  if (frei === 0) {
    return (
      <div className="pb-2 space-y-3">
        <EmptyState text="Aus diesem Brand ist nichts mehr frei." />
        <SchrittKnoepfe text="Zurück zur Liste" busy={false} onSpeichern={onFertig} onZurueck={onZurueck} />
      </div>
    );
  }
  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="b-anzahl">Anzahl</FieldLabel>
        <Stueckzahl id="b-anzahl" value={anzahl} min={1} max={frei} onChange={setAnzahl} />
        <Hint>{`Frei aus diesem Brand: ${frei} Stück.`}</Hint>
      </div>
      <div>
        <FieldLabel htmlFor="b-fuer" required>
          Reserviert für
        </FieldLabel>
        <TextMitVorschlag
          id="b-fuer"
          value={fuer}
          onChange={(v) => {
            setFuer(v);
            setFehler("");
          }}
          vorschlaege={auswahl.kunden}
          placeholder="z. B. Café Lindenhof oder Auftrag 2026-14"
        />
        <ErrorText>{fehler}</ErrorText>
      </div>
      <SchrittKnoepfe text={`${anzahl} Stück reservieren`} busy={busy} onSpeichern={speichern} onZurueck={onZurueck} />
    </div>
  );
}

// Ein Modell mit allen Posten (Zustand, Glasur, Brand, Reservierung). Ein Posten antippen, dann eine Sache wählen:
// weiterbrennen, reservieren, ausbuchen oder korrigieren. Jede Sache ist ein eigener, kurzer Schritt.
function ModellFenster({
  stand,
  canEdit,
  auswahl,
  onClose,
  onUmbuchen,
  onKorrigieren,
}: {
  stand: ModellStand;
  canEdit: boolean;
  auswahl: Auswahlen;
  onClose: () => void;
  onUmbuchen: UmbuchenFn;
  onKorrigieren: KorrigierenFn;
}) {
  const [schritt, setSchritt] = useState<Schritt>({ art: "liste" });
  // Nach dem Neuladen den Posten mit aktueller Anzahl zeigen. Gibt es ihn nicht mehr, zurück zur Liste.
  const aktuell = "p" in schritt ? stand.posten.find((p) => p.id === schritt.p.id) : undefined;
  const zurListe = () => setSchritt({ art: "liste" });
  const zustaende = ZUSTAENDE.filter((z) => stand.posten.some((p) => p.zustand === z));
  const andere = stand.posten.filter((p) => !ZUSTAENDE.includes(p.zustand));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-lg`}>
        <PanelHeader
          title={stand.modell}
          description={
            schritt.art === "brand"
              ? `${schritt.glasur || "Ohne Glasur"} · ${brandName(schritt.brand)}`
              : schritt.art === "liste" || !aktuell
              ? [stand.serie, stand.typ, standText(stand.je)].filter(Boolean).join(" · ")
              : [postenText(aktuell), `${aktuell.anzahl} Stück`, aktuell.reserviert && `für ${aktuell.reserviert}`, statusText(aktuell)].filter(Boolean).join(" · ")
          }
        />
        {schritt.art === "brand" ? (
          <BrandReservieren posten={stand.posten} glasurId={schritt.glasurId} glasur={schritt.glasur} brand={schritt.brand} auswahl={auswahl} onUmbuchen={onUmbuchen} onFertig={zurListe} onZurueck={zurListe} />
        ) : schritt.art === "liste" || !aktuell ? (
          <div className="pb-2 space-y-5">
            {stand.fotos[0] && <img src={thumb(stand.fotos[0], "large")} alt={stand.modell} className="w-full max-h-56 object-contain rounded-lg bg-muted" />}
            <ZusammenVerkaufbar
              posten={stand.posten}
              onReservieren={canEdit ? (g, brand) => setSchritt({ art: "brand", glasurId: g.glasurId, glasur: g.glasur, brand }) : undefined}
              onNachglasieren={canEdit ? (p) => setSchritt({ art: "weiter", p }) : undefined}
            />
            {[
              ...zustaende.map((z) => ({ titel: z, posten: stand.posten.filter((p) => p.zustand === z) })),
              ...(andere.length ? [{ titel: "Ohne Zustand", posten: andere }] : []),
            ].map((g) => (
              <section key={g.titel}>
                <h3 className="font-semibold capitalize">
                  {g.titel} · {zahl.format(g.posten.reduce((n, p) => n + p.anzahl, 0))} Stück
                </h3>
                <ul className="divide-y">
                  {g.posten.map((p) => (
                    <li key={p.id}>
                      <ListRow
                        title={p.glasur || p.lagerort?.label || "Ohne Lagerort"}
                        sub={[
                          p.zustand === GLASIERT && brandName(p.brand),
                          p.reserviert && `reserviert für ${p.reserviert}`,
                          statusText(p),
                          p.glasur && (p.lagerort?.label ?? "Kein Lagerort"),
                          p.masse,
                          p.gedreht && `gedreht von ${p.gedreht}`,
                          p.glasiert && `glasiert von ${p.glasiert}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        meta={<span className="text-lg font-semibold tabular-nums">{zahl.format(p.anzahl)}</span>}
                        onClick={canEdit ? () => setSchritt({ art: "wahl", p }) : undefined}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {canEdit && <Hint>Eine Zeile antippen, um zu glasieren, zu reservieren oder auszubuchen.</Hint>}
            <DoneButton />
          </div>
        ) : schritt.art === "wahl" ? (
          <div className="pb-2 space-y-3">
            {schrittName(aktuell.zustand) && (
              <AktionKnopf
                haupt
                titel={schrittName(aktuell.zustand)}
                text={aktuell.zustand === GESCHRUEHT ? "Stücke aus dem Lager nehmen und als glasiert eintragen, mit Glasur und Brand." : "Nach dem Schrühbrand als geschrüht eintragen."}
                onClick={() => setSchritt({ art: "weiter", p: aktuell })}
              />
            )}
            {aktuell.reserviert ? (
              <AktionKnopf titel="Reservierung aufheben" text={`Wieder frei verfügbar machen (jetzt für ${aktuell.reserviert}).`} onClick={() => setSchritt({ art: "freigeben", p: aktuell })} />
            ) : (
              <AktionKnopf titel="Reservieren" text="Für einen Kunden oder Auftrag zurücklegen." onClick={() => setSchritt({ art: "reservieren", p: aktuell })} />
            )}
            {ausserHaus(aktuell) ? (
              <AktionKnopf titel="Zurückholen" text={`Wieder in der Werkstatt (jetzt ${statusText(aktuell)}).`} onClick={() => setSchritt({ art: "zurueck", p: aktuell })} />
            ) : (
              aktuell.zustand === GLASIERT && <AktionKnopf titel="Ausstellen" text="In eine Ausstellung oder in Kommission geben." onClick={() => setSchritt({ art: "ausstellen", p: aktuell })} />
            )}
            <AktionKnopf titel="Ausbuchen" text="Verkauft, abgegeben oder zerbrochen: Stücke aus dem Bestand nehmen." onClick={() => setSchritt({ art: "ausbuchen", p: aktuell })} />
            <AktionKnopf titel="Korrigieren" text="Anzahl, Lagerort, Maße oder Notiz berichtigen, z. B. nach dem Zählen." onClick={() => setSchritt({ art: "korrigieren", p: aktuell })} />
            <Knopf variant="ghost" className="w-full h-12 text-base" onClick={zurListe}>
              Zurück
            </Knopf>
          </div>
        ) : schritt.art === "weiter" ? (
          <WeiterSchritt key={aktuell.id} p={aktuell} auswahl={auswahl} onUmbuchen={onUmbuchen} onFertig={zurListe} onZurueck={() => setSchritt({ art: "wahl", p: aktuell })} />
        ) : schritt.art === "korrigieren" ? (
          <KorrigierenSchritt key={aktuell.id} p={aktuell} lagerorte={auswahl.lagerorte} onKorrigieren={onKorrigieren} onFertig={zurListe} onZurueck={() => setSchritt({ art: "wahl", p: aktuell })} />
        ) : (
          <MengenSchritt key={`${schritt.art}-${aktuell.id}`} art={schritt.art} p={aktuell} auswahl={auswahl} onUmbuchen={onUmbuchen} onFertig={zurListe} onZurueck={() => setSchritt({ art: "wahl", p: aktuell })} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SchrittKnoepfe({ text, busy, disabled, onSpeichern, onZurueck }: { text: string; busy: boolean; disabled?: boolean; onSpeichern: () => void; onZurueck: () => void }) {
  return (
    <div className="pt-2 space-y-2">
      <Knopf className="w-full h-12 text-base" disabled={busy || disabled} onClick={onSpeichern}>
        {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
        {text}
      </Knopf>
      <Knopf variant="ghost" className="w-full h-12 text-base" disabled={busy} onClick={onZurueck}>
        Zurück
      </Knopf>
    </div>
  );
}

// Schrühen bzw. Glasieren: Stück vom Posten nehmen, Ausschuss abziehen, den Rest im nächsten Zustand eintragen.
function WeiterSchritt({ p, auswahl, onUmbuchen, onFertig, onZurueck }: { p: Posten; auswahl: Auswahlen; onUmbuchen: UmbuchenFn; onFertig: () => void; onZurueck: () => void }) {
  const ziel = naechsterZustand(p.zustand);
  const glasieren = ziel === GLASIERT;
  const [entnommen, setEntnommen] = useState(Math.min(1, p.anzahl));
  const [ausschuss, setAusschuss] = useState(0);
  const { modellGlasuren, glasuren, lagerorte, personen, kunden } = auswahl;
  const [glasurId, setGlasurId] = useState(modellGlasuren.length === 1 ? modellGlasuren[0].id : "");
  const [brand, setBrand] = useState(today());
  const [anderesDatum, setAnderesDatum] = useState(false);
  const [mehr, setMehr] = useState(!!p.reserviert);
  const [glasiertId, setGlasiertId] = useState("");
  const [fuer, setFuer] = useState(p.reserviert);
  const [lagerortId, setLagerortId] = useState(p.lagerort?.id ?? "");
  const [fehler, setFehler] = useState("");
  const [busy, setBusy] = useState(false);
  const gut = Math.max(0, entnommen - ausschuss);
  const glasur = glasuren.find((g) => g.id === glasurId)?.label ?? "";
  // Brand als Knöpfe: heute oder einer der letzten Brände. Ein vertipptes Datum ergäbe sonst einen Scheinbrand.
  const ANDERES = "Anderes Datum";
  const brandKnoepfe = [{ id: today(), label: "Heute" }, ...auswahl.braende.map((b) => ({ id: b, label: formatDate(b) })), { id: ANDERES, label: ANDERES }];
  const brandWert = anderesDatum ? ANDERES : (brandKnoepfe.find((k) => k.id === brand)?.label ?? ANDERES);

  async function speichern() {
    if (glasieren && !glasurId) {
      setFehler("Bitte die Glasur wählen.");
      return;
    }
    setBusy(true);
    const ok = await onUmbuchen(p, {
      entnommen,
      ausschuss,
      ziel: { ...keyVon(p), zustand: ziel, glasurId: glasieren ? glasurId : "", brand: glasieren ? brand : "", reserviert: fuer.trim(), glasiertId: glasieren ? glasiertId : "" },
      glasur,
      lagerortId,
      meldung: `${p.modell}: ${gut} Stück ${ziel}${glasur ? ` (${glasur})` : ""}${ausschuss ? `, ${ausschuss} Ausschuss` : ""}.`,
    });
    setBusy(false);
    if (ok) onFertig();
  }

  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="w-entnommen">Aus dem Lager genommen</FieldLabel>
        <Stueckzahl
          id="w-entnommen"
          value={entnommen}
          min={1}
          max={p.anzahl}
          onChange={(n) => {
            setEntnommen(n);
            setAusschuss((a) => Math.min(a, n));
          }}
        />
        <Hint>{`Vorhanden: ${p.anzahl} Stück ${p.zustand}.`}</Hint>
      </div>
      <div>
        <FieldLabel htmlFor="w-ausschuss">Davon Ausschuss</FieldLabel>
        <Stueckzahl id="w-ausschuss" value={ausschuss} max={entnommen} onChange={setAusschuss} />
        <Hint>Stücke, die nicht gut genug sind. Sie werden nicht eingetragen.</Hint>
      </div>
      {glasieren && (
        <>
          <div>
            <FieldLabel required>Glasur</FieldLabel>
            <GlasurWahl
              modell={modellGlasuren}
              alle={glasuren}
              value={glasurId}
              onChange={(id) => {
                setGlasurId(id);
                setFehler("");
              }}
              onCreate={auswahl.onGlasurNeu}
            />
            <ErrorText>{fehler}</ErrorText>
          </div>
          <div>
            <FieldLabel>Brand vom</FieldLabel>
            <ChoiceChips
              label="Brand vom"
              options={brandKnoepfe}
              value={brandWert}
              onChange={(label) => {
                const k = brandKnoepfe.find((x) => x.label === label);
                setAnderesDatum(label === ANDERES);
                if (k && label !== ANDERES) setBrand(k.id);
              }}
            />
            {anderesDatum && (
              <div className="mt-3">
                <Feld id="w-brand" type="date" aria-label="Datum des Brands" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
            )}
            <Hint>Stücke aus einem Brand haben denselben Farbton und stehen zusammen.</Hint>
          </div>
        </>
      )}
      {mehr ? (
        <>
          {glasieren && (
            <div>
              <FieldLabel htmlFor="w-glasiert">Glasiert von</FieldLabel>
              <OptionSelect id="w-glasiert" value={glasiertId} onChange={setGlasiertId} options={personen} placeholder="Freiwillig" />
            </div>
          )}
          <div>
            <FieldLabel htmlFor="w-fuer">Reserviert für</FieldLabel>
            <TextMitVorschlag id="w-fuer" value={fuer} onChange={setFuer} vorschlaege={kunden} placeholder="Kunde oder Auftrag (freiwillig)" />
          </div>
          <div>
            <FieldLabel htmlFor="w-lagerort">Lagerort</FieldLabel>
            <OptionSelect id="w-lagerort" value={lagerortId} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
          </div>
        </>
      ) : (
        <ZusatzKnopf label={glasieren ? "Mehr: glasiert von, reserviert, Lagerort" : "Mehr: reserviert, Lagerort"} onClick={() => setMehr(true)} />
      )}
      <p className="rounded-md bg-muted p-3 text-base">
        Danach: {p.zustand} <strong>{p.anzahl - entnommen}</strong> · {ziel}
        {glasur ? ` ${glasur}` : ""} <strong>+{gut}</strong>
        {ausschuss ? ` · ${ausschuss} Ausschuss` : ""}
      </p>
      <SchrittKnoepfe text={`${gut} Stück als ${ziel} eintragen`} busy={busy} disabled={entnommen < 1} onSpeichern={speichern} onZurueck={onZurueck} />
    </div>
  );
}

// Reservieren, Reservierung aufheben oder Ausbuchen: nur eine Anzahl (und beim Reservieren für wen).
function MengenSchritt({ art, p, auswahl, onUmbuchen, onFertig, onZurueck }: { art: MengenArt; p: Posten; auswahl: Auswahlen; onUmbuchen: UmbuchenFn; onFertig: () => void; onZurueck: () => void }) {
  const [anzahl, setAnzahl] = useState(art === "ausbuchen" && !p.reserviert ? Math.min(1, p.anzahl) : p.anzahl);
  const [fuer, setFuer] = useState("");
  const [status, setStatus] = useState(AUSGESTELLT);
  const [partnerId, setPartnerId] = useState("");
  const [rueckgabe, setRueckgabe] = useState("");
  const [fehler, setFehler] = useState("");
  const [busy, setBusy] = useState(false);
  const partner = auswahl.partner.find((x) => x.id === partnerId)?.label ?? "";
  // Wie bei Unikaten: Ausgestellte Ware steht auf „Außer Haus“, zurückgeholte bekommt ihren Platz beim Einräumen.
  const ausserHausOrt = auswahl.lagerorte.find((l) => l.label === AUSSER_HAUS_ORT)?.id ?? "";
  const lagerortNachher = art === "ausstellen" ? ausserHausOrt : art === "zurueck" && p.lagerort?.id === ausserHausOrt ? "" : (p.lagerort?.id ?? "");
  const text = {
    reservieren: `${anzahl} Stück reservieren`,
    freigeben: `${anzahl} Stück freigeben`,
    ausstellen: `${anzahl} Stück ${status === KOMMISSION ? "in Kommission geben" : "ausstellen"}`,
    zurueck: `${anzahl} Stück zurückholen`,
    ausbuchen: `${anzahl} Stück ausbuchen`,
  }[art];
  const ziele: Record<MengenArt, PostenKey | null> = {
    reservieren: { ...keyVon(p), reserviert: fuer.trim() },
    freigeben: { ...keyVon(p), reserviert: "" },
    ausstellen: { ...keyVon(p), status, partnerId, rueckgabe },
    zurueck: { ...keyVon(p), status: "", partnerId: "", rueckgabe: "" },
    ausbuchen: null,
  };
  const erledigt = {
    reservieren: `für ${fuer.trim()} reserviert`,
    freigeben: "wieder frei",
    ausstellen: statusText({ status, partner, rueckgabe }),
    zurueck: "wieder in der Werkstatt",
    ausbuchen: "ausgebucht",
  }[art];

  async function speichern() {
    if (art === "reservieren" && !fuer.trim()) {
      setFehler("Bitte angeben, für wen reserviert wird.");
      return;
    }
    setBusy(true);
    const ok = await onUmbuchen(p, {
      entnommen: anzahl,
      ausschuss: 0,
      ziel: ziele[art],
      glasur: p.glasur,
      lagerortId: lagerortNachher,
      meldung: `${p.modell} · ${postenText(p)}: ${anzahl} Stück ${erledigt}.`,
    });
    setBusy(false);
    if (ok) onFertig();
  }

  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="m-anzahl">Anzahl</FieldLabel>
        <Stueckzahl id="m-anzahl" value={anzahl} min={1} max={p.anzahl} onChange={setAnzahl} />
        <Hint>{art === "ausbuchen" ? "Verkauft, abgegeben oder zerbrochen. Die Stücke verlassen den Bestand." : `Vorhanden: ${p.anzahl} Stück.`}</Hint>
      </div>
      {art === "reservieren" && (
        <div>
          <FieldLabel htmlFor="m-fuer" required>
            Reserviert für
          </FieldLabel>
          <TextMitVorschlag
            id="m-fuer"
            value={fuer}
            onChange={(v) => {
              setFuer(v);
              setFehler("");
            }}
            vorschlaege={auswahl.kunden}
            placeholder="z. B. Café Lindenhof oder Auftrag 2026-14"
          />
          <ErrorText>{fehler}</ErrorText>
        </div>
      )}
      {art === "ausstellen" && (
        <>
          <div>
            <FieldLabel>Wohin</FieldLabel>
            <ChoiceChips label="Wohin" options={AUSSER_STATUS} value={status} onChange={setStatus} statusColors />
          </div>
          <div>
            <FieldLabel htmlFor="m-partner">Partner (Galerie, Museum …)</FieldLabel>
            <OptionSelect id="m-partner" value={partnerId} onChange={setPartnerId} options={auswahl.partner} placeholder="Freiwillig" />
          </div>
          <div>
            <FieldLabel htmlFor="m-rueckgabe">Rückgabe bis</FieldLabel>
            <Feld id="m-rueckgabe" type="date" value={rueckgabe} onChange={(e) => setRueckgabe(e.target.value)} />
            <Hint>Freiwillig. Die Übersicht erinnert rechtzeitig an die Rückgabe.</Hint>
          </div>
        </>
      )}
      <SchrittKnoepfe text={text} busy={busy} onSpeichern={speichern} onZurueck={onZurueck} />
    </div>
  );
}

function KorrigierenSchritt({ p, lagerorte, onKorrigieren, onFertig, onZurueck }: { p: Posten; lagerorte: Opt[]; onKorrigieren: KorrigierenFn; onFertig: () => void; onZurueck: () => void }) {
  const [anzahl, setAnzahl] = useState(p.anzahl);
  const [lagerortId, setLagerortId] = useState(p.lagerort?.id ?? "");
  const [notiz, setNotiz] = useState(p.notiz);
  const [masse, setMasse] = useState(p.masse);
  const [busy, setBusy] = useState(false);
  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="k-anzahl">Anzahl</FieldLabel>
        <Stueckzahl id="k-anzahl" value={anzahl} onChange={setAnzahl} />
      </div>
      <div>
        <FieldLabel htmlFor="k-masse">Maße</FieldLabel>
        <Feld id="k-masse" value={masse} onChange={(e) => setMasse(e.target.value)} placeholder="z. B. Ø 24 × H 3 cm" />
      </div>
      <div>
        <FieldLabel htmlFor="k-lagerort">Lagerort</FieldLabel>
        <OptionSelect id="k-lagerort" value={lagerortId} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
      </div>
      <div>
        <FieldLabel htmlFor="k-notiz">Notiz</FieldLabel>
        <Textfeld id="k-notiz" rows={3} value={notiz} onChange={(e) => setNotiz(e.target.value)} />
      </div>
      <SchrittKnoepfe
        text="Änderungen speichern"
        busy={busy}
        onSpeichern={async () => {
          setBusy(true);
          const ok = await onKorrigieren(p, { anzahl, lagerort: link(lagerortId), notiz: notiz.trim(), masse: masse.trim() });
          setBusy(false);
          if (ok) onFertig();
        }}
        onZurueck={onZurueck}
      />
    </div>
  );
}

export default function Block() {
  const [art, setArt] = useState<Art>(initialArt);
  const [tab, setTab] = useState<TabKey>(() => {
    const t = initialParam("tab");
    return TABS.some((x) => x.key === t) ? (t as TabKey) : "imhaus";
  });
  const [search, setSearch] = useState(() => initialParam("q"));
  const [sort, setSort] = useState<SortKey>("neu");
  const [typFilter, setTypFilter] = useState(() => initialParam("typ"));
  const [selectedId, setSelectedId] = useState(() => initialParam("id"));
  const [modellKey, setModellKey] = useState("");
  const [mengenFilter, setMengenFilter] = useState<MengenFilter>("alle");
  const [inventur, setInventur] = useState(false);
  const [filterSheet, setFilterSheet] = useState(false);
  const [ansicht, setAnsicht] = useAnsicht();
  const [limit, setLimit] = useState(LIST_STEP);

  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const kuenstlerQuery = useRecords({ from: ds.kuenstler, select: kuenstlerSelect, count: PAGE_SIZE });
  const glasurQuery = useRecords({ from: ds.glasuren, select: glasurSelect, count: PAGE_SIZE });
  const lagerortQuery = useRecords({ from: ds.lagerorte, select: lagerortSelect, count: PAGE_SIZE });
  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  const modellQuery = useRecords({ from: ds.modelle, select: modellSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  useAllPages(kuenstlerQuery);
  useAllPages(glasurQuery);
  useAllPages(lagerortQuery);
  useAllPages(partnerQuery);
  useAllPages(modellQuery);

  const editionUpdate = useRecordUpdate({ from: ds.edition, fields: editionUpdateFields });
  const editionCreate = useRecordCreate({ from: ds.edition, fields: editionCreateFields });
  const editionDelete = useRecordDelete({ from: ds.edition });
  const glasurCreate = useRecordCreate({ from: ds.glasuren, fields: glasurNeu });
  const typen = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "typ" }).options as Opt[];
  const statusListe = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "status" }).options as Opt[];
  const stamm: Stamm = { lagerorte: lagerortQuery.data, partner: partnerQuery.data, kuenstler: kuenstlerQuery.data, glasuren: glasurQuery.data };

  const unikate = useMemo(() => (unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toUnikat(i as RawItem)), [unikateQuery.data]);
  const posten = useMemo(() => (editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toPosten(i as RawItem)), [editionQuery.data]);
  // Frühere Kunden und Aufträge als Vorschläge, damit derselbe Name gleich geschrieben wird.
  // Die letzten Brände (außer heute) als Knöpfe beim Glasieren.
  const letzteBraende = useMemo(
    () =>
      [...new Set<string>(posten.map((p) => p.brand).filter((b) => b && b !== today()))]
        .sort()
        .reverse()
        .slice(0, LETZTE_BRAENDE),
    [posten],
  );
  const kunden = useMemo(
    () => [...new Set([...posten.map((p) => p.reserviert), ...unikate.map((u) => u.verkauftAn.trim())].filter(Boolean))].sort((a, b) => a.localeCompare(b, "de")),
    [posten, unikate],
  );

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const term = search.trim();
  const visible = useMemo(
    () => unikate.filter((u) => (activeTab.match ? activeTab.match(u) : true) && (!typFilter || u.typ === typFilter) && matchesSearch(u, term)).sort((a, b) => compare(a, b, sort)),
    [unikate, activeTab, typFilter, term, sort],
  );
  const tabs = useMemo(() => TABS.map((t) => ({ key: t.key, label: t.label, count: unikate.filter((u) => (t.match ? t.match(u) : true)).length })), [unikate]);

  const isMenge = art !== "unikat";
  const serie = art === "edition" ? EDITION_PROGRAMM : GESCHIRR;
  const postenSerie = posten.filter((p) => p.serie === serie);
  const staende = nachModell(postenSerie);
  const imTyp = staende.filter((s) => !typFilter || s.typ === typFilter);
  const mengenChips = MENGEN_FILTER.filter((f) => !NUR_WENN_VORHANDEN.includes(f.key) || imTyp.some(f.match)).map((f) => ({ key: f.key, label: f.label, count: imTyp.filter(f.match).length }));
  const activeMenge = MENGEN_FILTER.find((f) => f.key === mengenFilter) ?? MENGEN_FILTER[0];
  const visibleStaende = imTyp
    .filter(activeMenge.match)
    .filter((s) => !term || [s.modell, s.typ, ...s.posten.flatMap((p) => [p.glasur, p.reserviert, p.partner, p.lagerort?.label])].join(" ").toLowerCase().includes(term.toLowerCase()));
  const typenMenge = [...new Set(staende.map((s) => s.typ).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const glasurenJeModell = useMemo(
    () => new Map(((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[]).map((m) => [m.id, asOpts(m.fields.glasuren)] as [string, Opt[]])),
    [modellQuery.data],
  );

  const selected = unikate.find((u) => u.id === selectedId);
  const offenesModell = staende.find((s) => (s.modellId || s.modell) === modellKey);
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const stueckGesamt = visibleStaende.reduce((n, s) => n + Object.values(s.je).reduce((a, b) => a + b, 0), 0);
  const filtered = !!(search || typFilter);
  const canEdit = editionUpdate.enabled && editionCreate.enabled && editionDelete.enabled;

  // Umbuchen immer auf dem frisch geladenen Stand. Erst das Ziel schreiben, dann die Quelle verringern:
  // Bricht es dazwischen ab, fehlt kein Stück, es ist höchstens doppelt gezählt und fällt beim Zählen auf.
  async function umbuchen(p: Posten, a: { entnommen: number; ausschuss: number; ziel: PostenKey | null; glasur: string; lagerortId: string; meldung: string }): Promise<boolean> {
    try {
      const fresh = await freshItems(editionQuery);
      if (!fresh) {
        toast.error("Der Bestand konnte nicht geladen werden. Bitte erneut versuchen.");
        return false;
      }
      const plan = planeUmbuchung(fresh.map(toPosten), p.id, a.entnommen, a.ausschuss, a.ziel, a.lagerortId);
      if (typeof plan === "string") {
        toast.error(plan);
        return false;
      }
      if (plan.ziel && "neu" in plan.ziel) {
        const n = plan.ziel.neu;
        await editionCreate.mutateAsync({
          bezeichnung: bezeichnung(p.modell, { zustand: n.zustand, glasur: a.glasur, brand: n.brand, reserviert: n.reserviert, status: n.status, rueckgabe: n.rueckgabe, partner: activeOptions(stamm.partner, [n.partnerId]).find((x) => x.id === n.partnerId)?.label ?? "" }),
          modell: link(n.modellId),
          glasur: link(n.glasurId || undefined),
          zustand: n.zustand,
          anzahl: n.anzahl,
          lagerort: link(n.lagerortId || undefined),
          brand: n.brand || null,
          reserviert: n.reserviert,
          status: n.status || null,
          partner: link(n.partnerId || undefined),
          rueckgabe: n.rueckgabe || null,
          gedreht: link(n.gedrehtId || undefined),
          glasiert: link(n.glasiertId || undefined),
          masse: n.masse,
        } as never);
      } else if (plan.ziel) {
        await editionUpdate.mutateAsync({ recordId: plan.ziel.id, fields: { anzahl: plan.ziel.anzahl } } as never);
      }
      if ("loeschen" in plan.quelle) await editionDelete.mutateAsync(plan.quelle.id);
      else await editionUpdate.mutateAsync({ recordId: plan.quelle.id, fields: { anzahl: plan.quelle.anzahl } } as never);
      if (a.meldung) toast.success(a.meldung);
      return true;
    } catch {
      toast.error("Speichern hat nicht geklappt. Bitte den Bestand dieses Modells prüfen.");
      return false;
    } finally {
      await editionQuery.refetch();
    }
  }

  // Neue Glasur direkt beim Glasieren anlegen. Gibt es den Namen schon, wird die vorhandene genommen.
  async function neueGlasur(name: string): Promise<string | null> {
    const vorhanden = activeOptions(stamm.glasuren).find((g) => g.label.toLowerCase() === name.toLowerCase());
    if (vorhanden) return vorhanden.id;
    try {
      const created = await glasurCreate.mutateAsync({ name } as never);
      await glasurQuery.refetch();
      toast.success(`Glasur „${name}“ angelegt.`);
      return (created as { id: string }).id;
    } catch {
      toast.error("Glasur konnte nicht angelegt werden.");
      return null;
    }
  }

  // Inventur übernehmen: nur Posten, deren Anzahl sich seit dem Zählen nicht geändert hat. Die anderen bleiben offen.
  async function applyInventur(changes: InventurChange[]): Promise<string[]> {
    const fresh = await freshItems(editionQuery);
    if (!fresh) {
      toast.error("Der Bestand konnte nicht geladen werden. Bitte erneut übernehmen.");
      return changes.map((c) => c.e.id);
    }
    const offen: string[] = [];
    let ok = 0;
    for (const c of changes) {
      const row = fresh.find((i) => i.id === c.e.id);
      if (!row || (num(row.fields.anzahl) ?? 0) !== c.e.anzahl) {
        offen.push(c.e.id);
        continue;
      }
      try {
        await editionUpdate.mutateAsync({ recordId: c.e.id, fields: { anzahl: c.gezaehlt } } as never);
        ok++;
      } catch {
        offen.push(c.e.id);
      }
    }
    await editionQuery.refetch();
    if (ok) toast.success(`${ok} Posten übernommen.`);
    if (offen.length) toast.error(`${offen.length} ${offen.length === 1 ? "Posten wurde" : "Posten wurden"} inzwischen geändert oder nicht gespeichert. Bitte dort neu zählen.`);
    return offen;
  }

  async function korrigieren(p: Posten, fields: { anzahl: number; lagerort: string[]; notiz: string; masse: string }): Promise<boolean> {
    try {
      // Hat jemand die Anzahl geändert, seit das Fenster offen ist, nicht überschreiben, sondern melden.
      const fresh = await freshItems(editionQuery);
      const row = fresh?.find((i) => i.id === p.id);
      if (!row) {
        toast.error("Diesen Posten gibt es nicht mehr.");
        return false;
      }
      const aktuell = num(row.fields.anzahl) ?? 0;
      const anzahlGeaendert = fields.anzahl !== p.anzahl;
      if (anzahlGeaendert && aktuell !== p.anzahl) {
        toast.error(`Die Anzahl wurde inzwischen geändert (jetzt ${aktuell}). Bitte prüfen und erneut speichern.`);
        return false;
      }
      await editionUpdate.mutateAsync({ recordId: p.id, fields: { ...fields, anzahl: anzahlGeaendert ? fields.anzahl : aktuell } } as never);
      toast.success("Änderungen gespeichert.");
      return true;
    } catch {
      toast.error("Speichern hat nicht geklappt.");
      return false;
    } finally {
      await editionQuery.refetch();
    }
  }

  // Filter-Auswahllisten im Blatt (Handy und Rechner gleich), mit sichtbarer Beschriftung.
  const typAuswahl = (id: string, liste: string[]) => (
    <Auswahl id={id} value={typFilter} onChange={(e) => setTypFilter(e.target.value)}>
      <option value="">Alle Typen</option>
      {liste.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </Auswahl>
  );
  const sortAuswahl = (id: string) => (
    <Auswahl id={id} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
      {SORTS.map((s) => (
        <option key={s.key} value={s.key}>
          {s.label}
        </option>
      ))}
    </Auswahl>
  );
  const filterCount = typFilter ? 1 : 0;
  function resetFilters() {
    setTypFilter("");
  }
  const searchPlaceholder = isMenge ? "Nummer, Modell, Kunde" : "Name, Nummer, Glasur, Ort";
  const inventurButton =
    isMenge && !inventur && editionUpdate.enabled ? (
      <Knopf variant="outline" className="h-12 text-base" onClick={() => setInventur(true)}>
        <ClipboardList className="w-5 h-5 mr-2" aria-hidden /> Inventur
      </Knopf>
    ) : undefined;

  return (
    <div className={SEITE_CLASS}>
      <div className="content space-y-4" lang="de">
        <PageHeader
          title="Bestand"
          description={isMenge ? `${zahl.format(stueckGesamt)} Stück in ${zahl.format(visibleStaende.length)} ${visibleStaende.length === 1 ? "Modell" : "Modellen"}` : `${zahl.format(visible.length)} von ${zahl.format(unikate.length)} Meisterstücken`}
          // Handy und Desktop gleich: Ansichtsumschalter bzw. Inventur im Kopf, Filter hinter dem Filterknopf.
          aside={isMenge ? inventurButton : <AnsichtToggle value={ansicht} onChange={setAnsicht} />}
        />

        <Tabs
          label="Serie"
          tabs={[
            { key: "geschirr" as Art, label: GESCHIRR, count: nachModell(posten.filter((p) => p.serie === GESCHIRR)).length },
            { key: "edition" as Art, label: EDITION_PROGRAMM, count: nachModell(posten.filter((p) => p.serie === EDITION_PROGRAMM)).length },
            { key: "unikat" as Art, label: "Meisterstücke", count: unikate.length },
          ]}
          value={art}
          onChange={(key) => {
            setArt(key);
            setSearch("");
            setTypFilter("");
            setLimit(LIST_STEP);
            setInventur(false);
          }}
        />

        {isMenge ? (
          <FilterChips label="Zustand" options={mengenChips} value={mengenFilter} onChange={setMengenFilter} />
        ) : (
          <FilterChips
            label="Status"
            options={tabs}
            value={tab}
            onChange={(key) => {
              setTab(key);
              setLimit(LIST_STEP);
            }}
          />
        )}

        <div className="flex gap-3">
          <SearchField label="Suche" placeholder={searchPlaceholder} value={search} onChange={setSearch} />
          <FilterButton count={filterCount} onClick={() => setFilterSheet(true)} />
        </div>

        <FilterSheet
          open={filterSheet}
          onOpenChange={setFilterSheet}
          resultText={isMenge ? `${zahl.format(visibleStaende.length)} ${visibleStaende.length === 1 ? "Modell" : "Modelle"} anzeigen` : `${zahl.format(visible.length)} ${visible.length === 1 ? "Stück" : "Stücke"} anzeigen`}
          canReset={filterCount > 0}
          onReset={resetFilters}
        >
          <div>
            <FieldLabel htmlFor="f-typ">Typ</FieldLabel>
            {typAuswahl(
              "f-typ",
              isMenge ? typenMenge : typen.map((t) => t.label),
            )}
          </div>
          {!isMenge && (
            <div>
              <FieldLabel htmlFor="f-sort">Sortierung</FieldLabel>
              {sortAuswahl("f-sort")}
            </div>
          )}
        </FilterSheet>

        {failed ? (
          <ErrorState text="Der Bestand konnte nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Bestand wird geladen …" />
        ) : isMenge && inventur ? (
          <InventurView rows={postenSerie} onApply={applyInventur} onClose={() => setInventur(false)} />
        ) : isMenge ? (
          visibleStaende.length === 0 ? (
            <EmptyState text={term || typFilter || mengenFilter !== "alle" ? "Nichts gefunden. Suche oder Filter ändern." : `Noch kein ${serie} im Lager. Neue Ware unter „Erfassen“ eintragen.`} />
          ) : (
            <ul className={`${PANEL_CLASS} px-3 divide-y`}>
              {visibleStaende.map((s) => (
                <li key={s.modellId || s.modell}>
                  <ListRow
                    fotos={s.fotos}
                    title={s.modell}
                    sub={
                      <>
                        {standText(s.je)}
                        {glasurZeile(s.posten) && <span className="block">{glasurZeile(s.posten)}</span>}
                      </>
                    }
                    meta={s.reserviert > 0 ? <span className="text-sm text-amber-900">{zahl.format(s.reserviert)} reserviert</span> : undefined}
                    onClick={() => setModellKey(s.modellId || s.modell)}
                  />
                </li>
              ))}
            </ul>
          )
        ) : visible.length === 0 ? (
          <div className="space-y-3 text-center">
            <EmptyState text={filtered ? "Keine Stücke zu Suche und Filter." : "Hier ist zurzeit kein Stück."} />
            {filtered && (
              <Knopf
                variant="outline"
                className="h-11 text-base"
                onClick={() => {
                  setSearch("");
                  setTypFilter("");
                }}
              >
                Suche und Filter zurücksetzen
              </Knopf>
            )}
          </div>
        ) : (
          <>
            {ansicht === "kacheln" ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visible.slice(0, limit).map((u) => (
                  <li key={u.id} className="grid">
                    <UnikatTile u={u} onOpen={() => setSelectedId(u.id)} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={`${PANEL_CLASS} px-3 divide-y`}>
                {visible.slice(0, limit).map((u) => (
                  <li key={u.id}>
                    <ListRow
                      fotos={u.fotos}
                      title={u.name || "Ohne Namen"}
                      sub={[u.inv, ortVon(u) || "Kein Lagerort"].filter(Boolean).join(" · ")}
                      meta={
                        <span className="flex flex-col items-end gap-1">
                          <StatusBadge text={u.status} />
                          {u.preis !== null && <span className="text-sm tabular-nums">{euro.format(u.preis)}</span>}
                        </span>
                      }
                      onClick={() => setSelectedId(u.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
            {visible.length > limit && (
              <div className="flex justify-center">
                <Knopf variant="outline" className="h-12 text-base" onClick={() => setLimit((l) => l + LIST_STEP)}>
                  Weitere {Math.min(LIST_STEP, visible.length - limit)} anzeigen
                </Knopf>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <UnikatDetail key={selected.id} u={selected} onClose={() => setSelectedId("")} onSaved={() => unikateQuery.refetch()} stamm={stamm} typen={typen} statusListe={statusListe} kunden={kunden} />
      )}
      {offenesModell && (
        <ModellFenster
          key={modellKey}
          stand={offenesModell}
          canEdit={canEdit}
          auswahl={{
            modellGlasuren: glasurenJeModell.get(offenesModell.modellId) ?? [],
            glasuren: activeOptions(stamm.glasuren),
            lagerorte: activeOptions(stamm.lagerorte),
            personen: activeOptions(stamm.kuenstler),
            partner: activeOptions(stamm.partner),
            kunden,
            braende: letzteBraende,
            onGlasurNeu: neueGlasur,
          }}
          onClose={() => setModellKey("")}
          onUmbuchen={umbuchen}
          onKorrigieren={korrigieren}
        />
      )}
    </div>
  );
}

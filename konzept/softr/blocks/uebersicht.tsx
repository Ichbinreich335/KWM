// Generiert von konzept/softr/build.mjs aus src/blocks/uebersicht.tsx und src/shared/. Nicht von Hand ändern.
import { useEffect, useMemo, useState } from "react";
import { datasource, q, useRecords } from "@/lib/datasource";
import { AlertTriangle, CalendarClock, ChevronDown, ChevronRight, CircleCheck, ClipboardList, ImageOff, Loader2, Package, Receipt } from "lucide-react";

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

function firstLabel(v: unknown): string {
  return asOpts(v)[0]?.label ?? "";
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

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
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
  anzahl: number;
  vk: number | null;
  lagerort: Opt | undefined;
  fotos: Attachment[];
  notiz: string;
};

// Liest einen Datensatz des Editionsbestands. Jeder Block wählt seine Felder selbst aus, fehlende bleiben leer.
function toPosten(item: RawItem): Posten {
  const f = item.fields;
  const modell = asOpts(f.modell)[0];
  const nr = str(lookupValue(f.artikelnr));
  const glasur = asOpts(f.glasur)[0];
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
    anzahl: num(f.anzahl) ?? 0,
    vk: num(lookupValue(f.vk)),
    lagerort: asOpts(f.lagerort)[0],
    fotos: asAttachments(f.foto),
    notiz: str(f.notiz),
  };
}

// Kurzbeschreibung eines Postens ohne Modell, z. B. „Rostbraun · Brand 24.09.2026“.
function postenText(p: Pick<Posten, "zustand" | "glasur" | "brand">): string {
  return [p.glasur || p.zustand, p.brand && `Brand ${formatDate(p.brand)}`].filter(Boolean).join(" · ");
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
    const s = map.get(key) ?? { modellId: p.modellId, nr: p.nr, modell: p.modell, serie: p.serie, typ: p.typ, fotos: [], je: {}, reserviert: 0, posten: [] };
    s.je[p.zustand] = (s.je[p.zustand] ?? 0) + p.anzahl;
    if (p.reserviert) s.reserviert += p.anzahl;
    if (!s.fotos.length && p.fotos.length) s.fotos = p.fotos;
    s.posten.push(p);
    map.set(key, s);
  }
  const stande = [...map.values()];
  for (const s of stande) {
    s.posten.sort((a, b) => ZUSTAND_RANG(a.zustand) - ZUSTAND_RANG(b.zustand) || a.glasur.localeCompare(b.glasur, "de") || b.brand.localeCompare(a.brand) || a.reserviert.localeCompare(b.reserviert, "de"));
  }
  return stande.sort((a, b) => compareNr(a.nr, b.nr) || a.modell.localeCompare(b.modell, "de"));
}

// Die eine Rahmenfarbe der App: Flächen, Kacheln, Felder, Auswahlen, Knöpfe. Nur Trennlinien innerhalb einer Fläche bleiben heller.
const LINE = "border-neutral-300";

// Die Box: jede umrandete Fläche (Bereich, Liste, Kachel, Tabelle). Innerhalb einer Box keine zweite Box.
const PANEL_CLASS = `rounded-lg border ${LINE} bg-card`;

// Box, deren Inhalt in Felder geteilt ist (z. B. Kennzahlen): Die Trennlinien haben dieselbe Farbe wie der Rahmen.
const PANEL_GRID_CLASS = `rounded-lg border ${LINE} bg-neutral-300 gap-px overflow-hidden`;

// Nur waagerecht wischbar. overflow-x-auto allein macht in CSS auch die senkrechte Achse scrollbar, dann lässt sich der Inhalt nach oben und unten ziehen.
// Einzige Stelle mit overflow-x-auto (geprüft von pruefung/einheitlich.mjs).
const WISCHEN = "overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// Wurzel jeder Seite. overflow-x-clip: Nichts kann die Seite verbreitern, am Handy lässt sie sich nie seitlich verschieben.
const SEITE_CLASS = "container pt-6 pb-28 sm:pb-8 overflow-x-clip";

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

function Section({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={`${PANEL_CLASS} p-4 sm:p-5 space-y-3 min-w-0`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
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

const ds = datasource.define({ unikate: "unikate", edition: "edition", partner: "partner", modelle: "modelle" });
const modellSelect = q.select({ name: "eXo5w", artikelnr: "BNpSN", vk: "772dM", archiviert: "3tlrw" });

const unikatSelect = q.select({
  inv: "glG6V",
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  fotos: "rqreT",
  galerie: "NfsXv",
  preis: "N9yfT",
  erfasstAm: "p4ha0",
  geaendertAm: "aGhiL",
  verkauftAm: "48BXo",
  rueckgabe: "ENQkk",
});
const partnerSelect = q.select({ name: "a4yfc", art: "ZS9HU", ort: "RQRec" });
const editionSelect = q.select({
  modell: "jxN6x",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  foto: "nibt5",
  erfasstAm: "0x7rU",
  geaendertAm: "JZyKO",
  artikelnr: "Zzp1S",
  vk: "kAyrB",
  programm: "IIAdh",
  brand: "jqmqn",
  reserviert: "L1bO5",
});

const RECENT_COUNT = 6;
const MODELLE_SICHTBAR = 8;
const LOW_STOCK = 5;
const SOON_DAYS = 14;
const AUSSER_HAUS_MAX = 8;
const DAY_MS = 86400000;

type Unikat = {
  id: string;
  inv: string;
  name: string;
  typ: string;
  status: string;
  fotos: Attachment[];
  galerie: string;
  galerieId: string;
  rueckgabe: string;
  preis: number | null;
  erfasstAm: string;
  geaendertAm: string;
  verkauftAm: string;
};
type Edition = Posten & { erfasstAm: string; geaendertAm: string };
type CountRow = { label: string; href: string; values: number[] };
type Pruefpunkt = { label: string; items: { id: string; label: string; href: string }[] };
type Ton = "rot" | "gelb";
type Aufgabe = { key: string; ton: Ton; icon: React.ReactNode; text: string; detail?: string; href: string };
type Kennzahl = { label: string; value: string; sub: string[]; href: string };

const PRUEF_SICHTBAR = 8;
const TON_CLASS: Record<Ton | "neutral", string> = { rot: "bg-red-50 text-red-700", gelb: "bg-amber-50 text-amber-800", neutral: "bg-muted text-muted-foreground" };
const ICON = "w-5 h-5";
const ROW = "flex items-center gap-3 min-h-14 py-2 px-1 rounded-md hover:bg-muted/40";

// Vier Kennzahlen in einem Band statt einzelner Kästen. Jede führt in den passenden Bestand.
function Kennzahlen({ items }: { items: Kennzahl[] }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 ${PANEL_GRID_CLASS}`}>
      {items.map((k) => (
        <a key={k.label} href={k.href} className="group bg-card p-4 hover:bg-muted/40 transition-colors">
          <span className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            {k.label}
            <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100" aria-hidden />
          </span>
          <span className="block text-3xl font-semibold mt-1 tabular-nums">{k.value}</span>
          {k.sub.map((line) => (
            <span key={line} className="block text-sm text-muted-foreground">
              {line}
            </span>
          ))}
        </a>
      ))}
    </div>
  );
}

function TonIcon({ ton, children }: { ton: Ton | "neutral"; children: React.ReactNode }) {
  return <span className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${TON_CLASS[ton]}`}>{children}</span>;
}

// Was Aufmerksamkeit braucht, dringendstes zuerst. Datenpflege ist die letzte Zeile und klappt auf.
function ZuErledigen({ aufgaben, pflege }: { aufgaben: Aufgabe[]; pflege: Pruefpunkt[] }) {
  const offen = pflege.reduce((n, p) => n + p.items.length, 0);
  if (aufgaben.length === 0 && offen === 0) {
    return (
      <Section title="Zu erledigen">
        <p className="flex items-center gap-3 text-base text-muted-foreground">
          <CircleCheck className="w-5 h-5 text-emerald-700" aria-hidden /> Nichts offen. Keine Fristen, kein knapper Bestand, keine fehlenden Angaben.
        </p>
      </Section>
    );
  }
  return (
    <Section title="Zu erledigen">
      <ul className="divide-y">
        {aufgaben.map((a) => (
          <li key={a.key}>
            <a href={a.href} className={ROW}>
              <TonIcon ton={a.ton}>{a.icon}</TonIcon>
              <span className="flex-1 min-w-0">
                <span className="block font-medium">{a.text}</span>
                {a.detail && <span className="block text-sm text-muted-foreground truncate">{a.detail}</span>}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
            </a>
          </li>
        ))}
        {offen > 0 && (
          <li>
            <details className="group">
              <summary className={`${ROW} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                <TonIcon ton="neutral">
                  <ClipboardList className={ICON} aria-hidden />
                </TonIcon>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium">Datenpflege · {zahl.format(offen)} offen</span>
                  <span className="block text-sm text-muted-foreground truncate">{pflege.filter((p) => p.items.length).map((p) => p.label).join(" · ")}</span>
                </span>
                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="pl-12 pr-1 pb-3 space-y-3">
                {pflege
                  .filter((p) => p.items.length > 0)
                  .map((p) => (
                    <div key={p.label}>
                      <p className="text-sm font-medium">
                        {p.label} <span className="text-muted-foreground tabular-nums">{zahl.format(p.items.length)}</span>
                      </p>
                      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {p.items.slice(0, PRUEF_SICHTBAR).map((i) => (
                          <li key={i.id}>
                            <a href={i.href} className="inline-flex min-h-8 items-center text-muted-foreground underline underline-offset-4 decoration-neutral-300 hover:text-foreground">
                              {i.label}
                            </a>
                          </li>
                        ))}
                        {p.items.length > PRUEF_SICHTBAR && <li className="text-muted-foreground">und {zahl.format(p.items.length - PRUEF_SICHTBAR)} weitere</li>}
                      </ul>
                    </div>
                  ))}
              </div>
            </details>
          </li>
        )}
      </ul>
    </Section>
  );
}

// Zuletzt Bearbeitetes als Bildleiste: am Handy zum Wischen, am Rechner in einer Reihe.
function Bildleiste({ items }: { items: { key: string; href: string; titel: string; zeile: string; fotos: Attachment[] }[] }) {
  return (
    <ul className={`grid grid-flow-col auto-cols-[8.5rem] gap-3 pb-1 ${WISCHEN} sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible`}>
      {items.map((z) => (
        <li key={z.key}>
          <a href={z.href} className="group block">
            <Thumb fotos={z.fotos} size="medium" className="w-full aspect-square rounded-md" />
            <span className="block mt-2 text-sm font-medium leading-snug line-clamp-2 group-hover:underline underline-offset-4">{z.titel}</span>
            <span className="block text-sm text-muted-foreground truncate">{z.zeile}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function fristStatus(iso: string): "ueberfaellig" | "bald" | "ok" | "" {
  if (!iso) return "";
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const tage = (new Date(`${iso.slice(0, 10)}T00:00:00`).getTime() - heute.getTime()) / DAY_MS;
  return tage < 0 ? "ueberfaellig" : tage <= SOON_DAYS ? "bald" : "ok";
}

// Datum ohne Jahr, z. B. 30.9. Für Fristen und Listen, in denen das Jahr klar ist.
function kurzDatum(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" });
}

function latest(...dates: string[]): string {
  return dates.filter(Boolean).sort().at(-1) ?? "";
}

const AUSSER_HAUS_LINK = "/bestand?tab=kommission";

function plural(n: number, eins: string, mehrere: string): string {
  return `${zahl.format(n)} ${n === 1 ? eins : mehrere}`;
}

// Kleine Zähltabelle: erste Spalte Text, danach Zahlen. Nullen als Strich, damit Werte auffallen.
function CountTable({ head, rows, empty }: { head: string[]; rows: CountRow[]; empty: string }) {
  if (rows.length === 0) return <EmptyState text={empty} />;
  return (
    <table className="w-full text-base">
      <thead>
        <tr className="border-b text-sm text-muted-foreground">
          {head.map((h, i) => (
            <th key={h} scope="col" className={`py-2 font-normal ${i === 0 ? "text-left" : "text-right pl-3"}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((r) => (
          <tr key={r.label} className="hover:bg-muted/40">
            <th scope="row" className="py-0 text-left font-medium">
              <a href={r.href} className="flex items-center min-h-11 hover:underline underline-offset-4">
                {r.label}
              </a>
            </th>
            {r.values.map((v, i) => (
              <td key={i} className={`py-2 pl-3 text-right tabular-nums ${i === r.values.length - 1 ? "font-semibold" : ""} ${v === 0 ? "text-muted-foreground" : ""}`}>
                {v === 0 ? "–" : zahl.format(v)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FristBadge({ iso }: { iso: string }) {
  if (!iso) return null;
  const frist = fristStatus(iso);
  return (
    <span className={`inline-block text-sm rounded-md px-2 py-0.5 whitespace-nowrap ${frist === "ueberfaellig" ? "bg-red-50 text-red-800" : frist === "bald" ? "bg-amber-50 text-amber-900" : "text-muted-foreground"}`}>
      {frist === "ueberfaellig" ? "überfällig " : "bis "}
      {kurzDatum(iso)}
    </span>
  );
}

export default function Block() {
  const [alleModelle, setAlleModelle] = useState(false);
  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  const modellQuery = useRecords({ from: ds.modelle, select: modellSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  useAllPages(modellQuery);
  const unikate = useMemo<Unikat[]>(
    () =>
      (unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
        const f = (i as RawItem).fields;
        return {
          id: i.id,
          inv: str(f.inv),
          name: str(f.name),
          typ: firstLabel(f.typ),
          status: firstLabel(f.status),
          fotos: asAttachments(f.fotos),
          galerie: firstLabel(f.galerie),
          galerieId: asOpts(f.galerie)[0]?.id ?? "",
          rueckgabe: str(f.rueckgabe),
          preis: num(f.preis),
          erfasstAm: str(f.erfasstAm),
          geaendertAm: str(f.geaendertAm),
          verkauftAm: str(f.verkauftAm),
        };
      }),
    [unikateQuery.data],
  );
  const editionen = useMemo<Edition[]>(
    () =>
      (editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
        const f = (i as RawItem).fields;
        return { ...toPosten(i as RawItem), erfasstAm: str(f.erfasstAm), geaendertAm: str(f.geaendertAm) };
      }),
    [editionQuery.data],
  );
  const partnerInfo = useMemo(
    () =>
      new Map<string, { art: string; ort: string }>(
        (partnerQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
          const f = (i as RawItem).fields;
          return [i.id, { art: firstLabel(f.art), ort: str(f.ort) }];
        }),
      ),
    [partnerQuery.data],
  );

  const jahr = new Date().getFullYear();
  const stats = useMemo(() => {
    const by = (s: string) => unikate.filter((u) => u.status === s);
    const verfuegbar = by(VERFUEGBAR);
    const ausserHaus = unikate.filter((u) => isAusserHaus(u.status));
    const verkauftJahr = by(VERKAUFT).filter((u) => u.verkauftAm.startsWith(String(jahr)));
    const sum = (list: Unikat[]) => list.reduce((n, u) => n + (u.preis ?? 0), 0);
    return {
      verfuegbar: verfuegbar.length,
      verfuegbarWert: sum(verfuegbar),
      reserviert: by(RESERVIERT).length,
      ausserHaus: ausserHaus.length,
      partner: new Set(ausserHaus.map((u) => u.galerieId).filter(Boolean)).size,
      ueberfaellig: ausserHaus.filter((u) => fristStatus(u.rueckgabe) === "ueberfaellig").length,
      verkauftJahr: verkauftJahr.length,
      umsatzJahr: sum(verkauftJahr),
      verkauftLuecken: by(VERKAUFT).filter((u) => !u.verkauftAm || u.preis === null).length,
      bald: ausserHaus.filter((u) => fristStatus(u.rueckgabe) === "bald").length,
      ueberfaelligBei: [...new Set(ausserHaus.filter((u) => fristStatus(u.rueckgabe) === "ueberfaellig").map((u) => u.galerie || "ohne Partner"))],
    };
  }, [unikate, editionen, jahr]);

  const typRows = useMemo<CountRow[]>(() => {
    const imBestand = unikate.filter((u) => u.status !== VERKAUFT && u.typ);
    const typen = [...new Set(imBestand.map((u) => u.typ))].sort((a, b) => a.localeCompare(b, "de"));
    return typen.map((typ) => {
      const list = imBestand.filter((u) => u.typ === typ);
      const imHaus = list.filter((u) => !isAusserHaus(u.status)).length;
      const ausser = list.length - imHaus;
      return { label: typ, href: `/bestand?typ=${encodeURIComponent(typ)}&tab=alle`, values: [imHaus, ausser, list.length] };
    });
  }, [unikate]);

  // Mengenlager je Serie wie auf der Lagerliste: eine Zeile je Modell, Stück je Zustand. „roh“ nur, wenn es Rohware gibt.
  const mengen = useMemo(
    () =>
      [GESCHIRR, EDITION_PROGRAMM].map((serie) => {
        const staende = nachModell(editionen.filter((e) => e.serie === serie));
        const zustaende = ZUSTAENDE.filter((z) => z !== ROH || staende.some((s) => (s.je[ROH] ?? 0) > 0));
        const summe = (z: string) => staende.reduce((n, s) => n + (s.je[z] ?? 0), 0);
        const tab = serie === GESCHIRR ? "geschirr" : "edition";
        return {
          serie,
          tab,
          staende,
          zustaende,
          je: Object.fromEntries(zustaende.map((z) => [z, summe(z)])) as Record<string, number>,
          gesamt: zustaende.reduce((n, z) => n + summe(z), 0),
          wertGlasiert: editionen.filter((e) => e.serie === serie && e.zustand === GLASIERT).reduce((n, e) => n + e.anzahl * (e.vk ?? 0), 0),
          rows: staende.map((s) => {
            const values = zustaende.map((z) => s.je[z] ?? 0);
            return { label: s.modell, href: `/bestand?tab=${tab}&q=${encodeURIComponent(s.modell)}`, values: [...values, values.reduce((a, b) => a + b, 0)] };
          }),
        };
      }),
    [editionen],
  );
  const [geschirr, edition] = mengen;

  // Reservierungen je Kunde oder Auftrag (Freitext), mit den reservierten Posten.
  const reservierungen = useMemo(() => {
    const map = new Map<string, { name: string; anzahl: number; posten: Edition[] }>();
    for (const e of editionen) {
      if (!e.reserviert || e.anzahl <= 0) continue;
      const key = e.reserviert.toLowerCase();
      const r = map.get(key) ?? { name: e.reserviert, anzahl: 0, posten: [] };
      r.anzahl += e.anzahl;
      r.posten.push(e);
      map.set(key, r);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [editionen]);

  const ausserHausGruppen = useMemo(() => {
    const groups = new Map<string, { key: string; name: string; art: string; ort: string; anzahl: number; naechste: string }>();
    unikate
      .filter((u) => isAusserHaus(u.status))
      .forEach((u) => {
        const key = u.galerieId || "ohne";
        const info = partnerInfo.get(u.galerieId);
        const g = groups.get(key) ?? { key, name: u.galerie || "Ohne Partner", art: info?.art ?? "", ort: info?.ort ?? "", anzahl: 0, naechste: "" };
        g.anzahl += 1;
        const frist = u.rueckgabe.slice(0, 10);
        if (frist && (!g.naechste || frist < g.naechste)) g.naechste = frist;
        groups.set(key, g);
      });
    return [...groups.values()].sort((a, b) => (a.naechste || "9").localeCompare(b.naechste || "9"));
  }, [unikate, partnerInfo]);

  const zuletzt = useMemo(() => {
    const items = [
      ...unikate.map((u) => ({
        key: `u-${u.id}`,
        href: `/bestand?id=${u.id}`,
        titel: u.name || "Ohne Namen",
        zeile: [u.status, kurzDatum(latest(u.erfasstAm, u.geaendertAm))].filter(Boolean).join(" · "),
        fotos: u.fotos,
        zeit: latest(u.erfasstAm, u.geaendertAm),
      })),
      ...editionen.map((e) => ({
        key: `e-${e.id}`,
        href: `/bestand?tab=${e.serie === GESCHIRR ? "geschirr" : "edition"}&q=${encodeURIComponent(e.modell)}`,
        titel: e.modell,
        zeile: [postenText(e), plural(e.anzahl, "Stück", "Stück")].join(" · "),
        fotos: e.fotos,
        zeit: latest(e.erfasstAm, e.geaendertAm),
      })),
    ];
    return items.sort((a, b) => b.zeit.localeCompare(a.zeit)).slice(0, RECENT_COUNT);
  }, [unikate, editionen]);

  // Geschirr wird aus geschrühter Ware glasiert. Wird sie knapp, muss nachgedreht werden.
  const knapp = geschirr.staende.filter((s) => (s.je[GESCHRUEHT] ?? 0) < LOW_STOCK).sort((a, b) => (a.je[GESCHRUEHT] ?? 0) - (b.je[GESCHRUEHT] ?? 0));
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";

  const mengeSub = (m: (typeof mengen)[number]) => m.zustaende.filter((z) => m.je[z] > 0).map((z) => `${z} ${zahl.format(m.je[z])}`);
  const kennzahlen: Kennzahl[] = [
    { label: GESCHIRR, value: zahl.format(geschirr.gesamt), sub: mengeSub(geschirr), href: "/bestand?tab=geschirr" },
    { label: EDITION_PROGRAMM, value: zahl.format(edition.gesamt), sub: [...mengeSub(edition), ...(edition.wertGlasiert > 0 ? [`Wert glasiert ${euro.format(edition.wertGlasiert)}`] : [])], href: "/bestand?tab=edition" },
    {
      label: "Reserviert",
      value: zahl.format(reservierungen.reduce((n, r) => n + r.anzahl, 0)),
      sub: [reservierungen.length === 1 ? "für 1 Kunden oder Auftrag" : `für ${zahl.format(reservierungen.length)} Kunden oder Aufträge`],
      href: "/bestand?tab=geschirr",
    },
    {
      label: "Unikate im Haus",
      value: zahl.format(stats.verfuegbar + stats.reserviert),
      sub: [`${zahl.format(stats.ausserHaus)} außer Haus`, `${zahl.format(stats.verkauftJahr)} verkauft ${jahr}`],
      href: "/bestand?tab=imhaus",
    },
  ];

  const kandidaten: (Aufgabe | false)[] = [
    stats.ueberfaellig > 0 && {
      key: "ueberfaellig",
      ton: "rot",
      icon: <AlertTriangle className={ICON} aria-hidden />,
      text: `${plural(stats.ueberfaellig, "Rückgabe", "Rückgaben")} überfällig`,
      detail: stats.ueberfaelligBei.join(", "),
      href: AUSSER_HAUS_LINK,
    },
    stats.bald > 0 && {
      key: "bald",
      ton: "gelb",
      icon: <CalendarClock className={ICON} aria-hidden />,
      text: `${plural(stats.bald, "Rückgabe", "Rückgaben")} in den nächsten ${SOON_DAYS} Tagen`,
      href: AUSSER_HAUS_LINK,
    },
    knapp.length > 0 && {
      key: "knapp",
      ton: "gelb",
      icon: <Package className={ICON} aria-hidden />,
      text: `Geschirr: ${plural(knapp.length, "Modell", "Modelle")} mit weniger als ${LOW_STOCK} geschrühten`,
      detail: knapp.map((s) => `${s.modell}: ${s.je[GESCHRUEHT] ?? 0}`).join(" · "),
      href: "/bestand?tab=geschirr",
    },
    stats.verkauftLuecken > 0 && {
      key: "verkauft",
      ton: "gelb",
      icon: <Receipt className={ICON} aria-hidden />,
      text: `${plural(stats.verkauftLuecken, "Verkauf", "Verkäufe")} ohne Datum oder Preis`,
      detail: "Fehlt im Umsatz",
      href: "/bestand?tab=verkauft",
    },
  ];
  const aufgaben = kandidaten.filter((a): a is Aufgabe => a !== false);

  const pruefpunkte: Pruefpunkt[] = [
    {
      label: "Unikate ohne Foto",
      items: unikate.filter((u) => u.status !== VERKAUFT && u.fotos.length === 0).map((u) => ({ id: u.id, label: u.name || u.inv, href: `/bestand?id=${u.id}` })),
    },
    {
      label: "Unikate ohne Preis",
      items: unikate.filter((u) => u.status !== VERKAUFT && u.preis === null).map((u) => ({ id: u.id, label: u.name || u.inv, href: `/bestand?id=${u.id}` })),
    },
    {
      label: "Außer Haus ohne Partner",
      items: unikate.filter((u) => isAusserHaus(u.status) && !u.galerieId).map((u) => ({ id: u.id, label: u.name || u.inv, href: `/bestand?id=${u.id}` })),
    },
    {
      label: "Modelle ohne VK-Preis",
      items: ((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[])
        .filter((i) => i.fields.archiviert !== true && num(i.fields.vk) === null)
        .map((i) => ({ id: i.id, label: modellLabel(str(i.fields.artikelnr), str(i.fields.name)), href: "/stammdaten?tab=modelle" })),
    },
  ];

  return (
    <div className={SEITE_CLASS}>
      <div className="content space-y-6" lang="de">
        <PageHeader title="Übersicht" description={`${zahl.format(geschirr.gesamt)} Stück Geschirr · ${zahl.format(edition.gesamt)} Stück Edition · ${plural(unikate.length, "Unikat", "Unikate")}`} />

        {failed ? (
          <ErrorState text="Die Übersicht konnte nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Übersicht wird geladen …" />
        ) : (
          <>
            <Kennzahlen items={kennzahlen} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <ZuErledigen aufgaben={aufgaben} pflege={pruefpunkte} />

              <Section title="Reservierungen" description="Geschirr und Edition, je Kunde oder Auftrag">
                {reservierungen.length === 0 ? (
                  <EmptyState text="Zurzeit ist nichts reserviert." />
                ) : (
                  <ul className="divide-y">
                    {reservierungen.map((r) => (
                      <li key={r.name}>
                        <ListRow
                          title={r.name}
                          sub={r.posten.map((e) => `${e.modell} · ${postenText(e)} · ${e.anzahl}`).join(" | ")}
                          meta={<span className="text-base font-semibold tabular-nums">{plural(r.anzahl, "Stück", "Stück")}</span>}
                          href={`/bestand?tab=${r.posten[0].serie === GESCHIRR ? "geschirr" : "edition"}&q=${encodeURIComponent(r.name)}`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {mengen.map((m) => (
                <Section key={m.serie} title={`${m.serie} je Modell`} description="Stück nach Zustand">
                  <CountTable
                    head={["Modell", ...m.zustaende, "gesamt"]}
                    rows={alleModelle ? m.rows : m.rows.slice(0, MODELLE_SICHTBAR)}
                    empty={`Noch kein ${m.serie} im Lager.`}
                  />
                  {m.rows.length > MODELLE_SICHTBAR && (
                    <button type="button" onClick={() => setAlleModelle((x) => !x)} className="inline-flex items-center gap-1 min-h-11 text-base font-medium text-primary hover:underline underline-offset-4">
                      {alleModelle ? "Weniger zeigen" : `Alle ${zahl.format(m.rows.length)} Modelle zeigen`}
                      <ChevronDown className={`w-4 h-4 transition-transform ${alleModelle ? "rotate-180" : ""}`} aria-hidden />
                    </button>
                  )}
                </Section>
              ))}
            </div>

            <Section title="Zuletzt erfasst oder geändert">{zuletzt.length === 0 ? <EmptyState text="Noch nichts erfasst." /> : <Bildleiste items={zuletzt} />}</Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <Section
                title="Unikate außer Haus"
                description="Nach Partner, früheste Rückgabe zuerst"
              >
                {ausserHausGruppen.length === 0 ? (
                  <EmptyState text="Zurzeit ist nichts außer Haus." />
                ) : (
                  <ul className="divide-y">
                    {ausserHausGruppen.slice(0, AUSSER_HAUS_MAX).map((g) => (
                      <li key={g.key}>
                        <ListRow
                          title={g.name}
                          sub={[plural(g.anzahl, "Stück", "Stück"), g.art, g.ort].filter(Boolean).join(" · ")}
                          meta={<FristBadge iso={g.naechste} />}
                          href={g.key === "ohne" ? AUSSER_HAUS_LINK : `${AUSSER_HAUS_LINK}&q=${encodeURIComponent(g.name)}`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
                {ausserHausGruppen.length > AUSSER_HAUS_MAX && <p className="text-sm text-muted-foreground">und {ausserHausGruppen.length - AUSSER_HAUS_MAX} weitere Partner im Bestand</p>}
              </Section>

              <Section title="Unikate nach Typ" description="Ohne verkaufte Stücke">
                <CountTable head={["Typ", "im Haus", "außer Haus", "gesamt"]} rows={typRows} empty="Noch keine Unikate im Bestand." />
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

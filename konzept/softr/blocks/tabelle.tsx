// Generiert von konzept/softr/build.mjs aus src/blocks/tabelle.tsx und src/shared/. Nicht von Hand ändern.
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { datasource, q, useRecordCreate, useRecordDelete, useRecords } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ArrowDown, ArrowUp, Bookmark, ChevronDown, ChevronLeft, ChevronRight, Columns3, Download, FileSpreadsheet, ImageOff, Loader2, Plus, Printer, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
const MANUFAKTUR_PROGRAMM = "Manufakturprogramm";
const GESCHIRR = "Geschirr";

function serieVon(programm: string): string {
  return programm === MANUFAKTUR_PROGRAMM ? GESCHIRR : programm;
}

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

// Nachschlagefelder liefern je nach Feld einen Wert oder eine Liste mit einem Wert.
function lookupValue(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
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

function csvCell(v: string): string {
  return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const csv = String.fromCharCode(0xfeff) + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type PrintColumn = { label: string; align?: "right" };

// Druckansicht in einem eigenen Fenster, unabhängig von Navigation und Layout der App.
// Im Druckdialog „Als PDF sichern“ wählen. false: Das Fenster wurde vom Browser blockiert.
function printTable({ title, subtitle, columns, rows, footer }: { title: string; subtitle: string; columns: PrintColumn[]; rows: string[][]; footer?: string[] }): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  const cell = (tag: "th" | "td", v: string, c: PrintColumn) => `<${tag}${c.align === "right" ? ' class="r"' : ""}>${escapeHtml(v)}</${tag}>`;
  const stand = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  win.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  body { font: 10pt/1.35 system-ui, -apple-system, "Segoe UI", sans-serif; color: #111; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1.5pt solid #111; padding-bottom: 6pt; margin-bottom: 10pt; }
  h1 { font-size: 15pt; margin: 0; }
  .sub { color: #555; margin-top: 2pt; }
  .firma { text-align: right; color: #555; font-size: 9pt; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-weight: 600; border-bottom: 1pt solid #111; padding: 4pt 6pt; }
  td { border-bottom: 0.5pt solid #ccc; padding: 4pt 6pt; vertical-align: top; }
  tfoot td { border-top: 1pt solid #111; border-bottom: none; font-weight: 600; }
  .r { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tr { break-inside: avoid; }
  thead { display: table-header-group; }
</style></head><body>
<header><div><h1>${escapeHtml(title)}</h1><div class="sub">${escapeHtml(subtitle)}</div></div>
<div class="firma">Keramische Werkstatt Margaretenhöhe<br>Stand ${stand} · ${rows.length} Einträge</div></header>
<table><thead><tr>${columns.map((c) => cell("th", c.label, c)).join("")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((v, i) => cell("td", v, columns[i])).join("")}</tr>`).join("")}</tbody>
${footer ? `<tfoot><tr>${footer.map((v, i) => cell("td", v, columns[i])).join("")}</tr></tfoot>` : ""}
</table></body></html>`);
  win.document.close();
  win.focus();
  // Je nach Browser kommt „load“ oder nicht; gedruckt wird genau einmal.
  let printed = false;
  const go = () => {
    if (printed) return;
    printed = true;
    win.print();
  };
  win.onload = go;
  window.setTimeout(go, 400);
  return true;
}

// Die eine Rahmenfarbe der App: Flächen, Kacheln, Felder, Auswahlen, Knöpfe. Nur Trennlinien innerhalb einer Fläche bleiben heller.
const LINE = "border-neutral-300";

// Jedes Fenster (Dialog). Rahmen in der App-Rahmenfarbe.
const DIALOG_CLASS = `w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-lg border ${LINE} p-4 sm:p-6 [&>button:last-child]:hidden`;

// Jedes aufklappende Menü (Popover, Ausklappliste).
const POPOVER_CLASS = `border ${LINE}`;

// md:text-base hebt das md:text-sm der shadcn-Felder auf, damit Eingabe und Auswahlliste gleich groß schreiben.
const FIELD_CLASS = `h-12 min-w-0 rounded-md text-base md:text-base ${LINE}`;

// iOS gibt Datumsfeldern eine eigene Mindestbreite; ohne appearance-none ragen sie aus der Spalte und die Seite lässt sich seitlich schieben.
const DATUM_CLASS = "appearance-none [&::-webkit-date-and-time-value]:text-left";

// Die Box: jede umrandete Fläche (Bereich, Liste, Kachel, Tabelle). Innerhalb einer Box keine zweite Box.
const PANEL_CLASS = `rounded-lg border ${LINE} bg-card`;

// Box um eine breite Tabelle: Die Tabelle wischt nur waagerecht (shadcn legt um <table> einen Scrollbereich).
const TABLE_PANEL_CLASS = `${PANEL_CLASS} [&>div]:overflow-y-hidden [&>div]:overscroll-x-contain`;

// Nur waagerecht wischbar. overflow-x-auto allein macht in CSS auch die senkrechte Achse scrollbar, dann lässt sich der Inhalt nach oben und unten ziehen.
// Einzige Stelle mit overflow-x-auto (geprüft von pruefung/einheitlich.mjs).
const WISCHEN = "overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// Wie SEITE_CLASS, aber über die volle Breite (Tabelle).
const SEITE_BREIT_CLASS = "w-full px-4 sm:px-6 pt-6 pb-28 sm:pb-8 overflow-x-clip";

// Einzige Ausnahme von „Handy und Rechner zeigen dasselbe“: Werkzeuge der Tabellenansicht (z. B. Spaltenwahl).
// Am Handy gibt es statt der Tabelle Karten, dort hätten sie keine Wirkung.
const NUR_TABELLE = "hidden sm:inline-flex";

// Am Handy eine Zeile zum seitlich Wischen statt mehrerer umbrochener Reihen, ab Tablet umbrechen.
const SCROLL_ROW = `flex gap-2 py-0.5 ${WISCHEN} sm:flex-wrap sm:overflow-visible`;

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

// Jede Auswahlliste (öffnet am Handy die Auswahl des Telefons). kompakt: für dichte Filterzeilen. breite ersetzt die volle Breite.
const Auswahl = forwardRef<HTMLSelectElement, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & { kompakt?: boolean; breite?: string }>(function Auswahl(
  { kompakt, breite = "w-full", ...props },
  ref,
) {
  return <select ref={ref} className={`${breite} ${kompakt ? "h-11 px-2" : "h-12 px-3"} rounded-md border ${LINE} bg-background text-base`} {...props} />;
});

// Jedes Ankreuzfeld.
function Ankreuzfeld({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <Checkbox className={LINE} checked={checked} onCheckedChange={(v) => onChange(v === true)} />;
}

// Kleines Etikett für Werte in Tabellen (z. B. Glasuren).
function Etikett({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={`text-sm font-normal ${LINE}`}>
      {children}
    </Badge>
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

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" data-error="true" className="text-sm text-destructive mt-1.5">
      {children}
    </p>
  );
}

function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Feld type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
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

// Export einer Liste: Excel-taugliche CSV-Datei oder Druckansicht (dort „Als PDF sichern“).
function ExportMenu({ onCsv, onPdf, disabled }: { onCsv: () => void; onPdf: () => void; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Knopf variant="outline" className={`h-12 w-12 px-0 text-base sm:w-auto sm:px-4`} disabled={disabled} aria-label="Exportieren">
          <Download className="w-5 h-5 sm:mr-2" aria-hidden />
          <span className="hidden sm:inline">Exportieren</span>
          <ChevronDown className="hidden sm:block w-4 h-4 ml-1" aria-hidden />
        </Knopf>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`${POPOVER_CLASS} w-56`}>
        <DropdownMenuItem className="min-h-11 text-base gap-2" onSelect={onCsv}>
          <FileSpreadsheet className="w-5 h-5" aria-hidden /> Excel (CSV-Datei)
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-11 text-base gap-2" onSelect={onPdf}>
          <Printer className="w-5 h-5" aria-hidden /> PDF / Drucken
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ds = datasource.define({ unikate: "unikate", edition: "edition", ansichten: "ansichten" });

const unikatSelect = q.select({
  inv: "glG6V",
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  kuenstler: "oDNBh",
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
  geaendertAm: "aGhiL",
  verkauftAm: "48BXo",
  verkauftAn: "4qhRx",
  rueckgabe: "ENQkk",
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
  erfasstAm: "0x7rU",
  geaendertAm: "JZyKO",
  artikelnr: "Zzp1S",
  vk: "kAyrB",
  programm: "IIAdh",
  brand: "jqmqn",
  reserviert: "L1bO5",
});
const ansichtSelect = q.select({ name: "8s5KL", definition: "rWGS9", von: "uPraE" });

const VIEW_VERSION = 3;
const SCROLL_STEP = 320;
const PAGE_ROWS = 50;
const UNIKAT = "Unikat";
const EDITION = "Geschirr & Edition";
const euroCent = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

type ArtTab = "alle" | "unikat" | "edition";
const ART_OF_TAB: Record<ArtTab, string | null> = { alle: null, unikat: UNIKAT, edition: EDITION };

type Row = {
  id: string;
  art: string;
  inv: string;
  artikelnr: string;
  programm: string;
  name: string;
  typ: string;
  status: string;
  anzahl: number;
  kuenstler: string;
  gedreht: string;
  glasiert: string;
  glasur: string[];
  datum: string;
  gedrehtAm: string;
  glasiertAm: string;
  jahr: number | null;
  masse: string;
  lagerort: string;
  galerie: string;
  preis: number | null;
  vk: number | null;
  website: boolean | null;
  bildnachweis: string;
  notiz: string;
  erfasstVon: string;
  erfasstAm: string;
  geaendertAm: string;
  verkauftAm: string;
  verkauftAn: string;
  brand: string;
  reserviert: string;
  rueckgabe: string;
  fotos: Attachment[];
};

type FieldType = "text" | "number" | "select" | "multi" | "bool" | "date";
type ColKey =
  | "art"
  | "programm"
  | "inv"
  | "name"
  | "typ"
  | "status"
  | "anzahl"
  | "kuenstler"
  | "gedreht"
  | "glasiert"
  | "glasur"
  | "datum"
  | "gedrehtAm"
  | "glasiertAm"
  | "jahr"
  | "masse"
  | "lagerort"
  | "galerie"
  | "preis"
  | "vk"
  | "website"
  | "notiz"
  | "erfasstAm"
  | "geaendertAm"
  | "verkauftAm"
  | "verkauftAn"
  | "brand"
  | "reserviert"
  | "rueckgabe";
type CellValue = string | number | boolean | string[] | null;
// only: Spalte gibt es nur bei Unikaten bzw. nur bei Geschirr und Edition. Im Reiter der anderen Art fällt sie weg.
type Col = { key: ColKey; label: string; type: FieldType; get: (r: Row) => CellValue; visible: boolean; align?: "right"; only?: ArtTab };

const COLUMNS: Col[] = [
  { key: "art", label: "Art", type: "select", get: (r) => r.art, visible: false, only: "alle" },
  { key: "programm", label: "Serie", type: "select", get: (r) => r.programm || null, visible: false, only: "edition" },
  { key: "inv", label: "Nr.", type: "text", get: (r) => r.inv || r.artikelnr || null, visible: true },
  { key: "name", label: "Name / Modell", type: "text", get: (r) => r.name, visible: true },
  { key: "typ", label: "Typ", type: "select", get: (r) => r.typ || null, visible: true },
  { key: "status", label: "Status / Zustand", type: "select", get: (r) => r.status || null, visible: true },
  { key: "anzahl", label: "Anzahl", type: "number", get: (r) => r.anzahl, visible: true, align: "right", only: "edition" },
  { key: "preis", label: "Preis intern", type: "number", get: (r) => r.preis, visible: true, align: "right", only: "unikat" },
  { key: "vk", label: "VK-Preis", type: "number", get: (r) => r.vk, visible: false, align: "right", only: "edition" },
  { key: "glasur", label: "Glasur", type: "multi", get: (r) => r.glasur, visible: false },
  { key: "lagerort", label: "Lagerort", type: "select", get: (r) => r.lagerort || null, visible: true },
  { key: "kuenstler", label: "Künstler:in", type: "select", get: (r) => r.kuenstler || null, visible: false, only: "unikat" },
  { key: "gedreht", label: "Gedreht von", type: "select", get: (r) => r.gedreht || null, visible: false, only: "unikat" },
  { key: "glasiert", label: "Glasiert von", type: "select", get: (r) => r.glasiert || null, visible: false, only: "unikat" },
  { key: "datum", label: "Datum", type: "date", get: (r) => r.datum.slice(0, 10) || null, visible: false, only: "unikat" },
  { key: "gedrehtAm", label: "Gedreht am", type: "date", get: (r) => r.gedrehtAm.slice(0, 10) || null, visible: false, only: "unikat" },
  { key: "glasiertAm", label: "Glasiert am", type: "date", get: (r) => r.glasiertAm.slice(0, 10) || null, visible: false, only: "unikat" },
  { key: "jahr", label: "Jahr", type: "number", get: (r) => r.jahr, visible: false, align: "right", only: "unikat" },
  { key: "masse", label: "Maße", type: "text", get: (r) => r.masse || null, visible: false, only: "unikat" },
  { key: "galerie", label: "Partner", type: "select", get: (r) => r.galerie || null, visible: false, only: "unikat" },
  { key: "website", label: "Auf Website", type: "bool", get: (r) => r.website, visible: false, only: "unikat" },
  { key: "notiz", label: "Notiz", type: "text", get: (r) => r.notiz || null, visible: false },
  { key: "erfasstAm", label: "Erfasst am", type: "date", get: (r) => r.erfasstAm.slice(0, 10) || null, visible: false },
  { key: "geaendertAm", label: "Geändert am", type: "date", get: (r) => r.geaendertAm.slice(0, 10) || null, visible: false },
  { key: "verkauftAm", label: "Verkauft am", type: "date", get: (r) => r.verkauftAm.slice(0, 10) || null, visible: false, only: "unikat" },
  { key: "verkauftAn", label: "Verkauft an", type: "text", get: (r) => r.verkauftAn || null, visible: false, only: "unikat" },
  { key: "brand", label: "Brand vom", type: "date", get: (r) => r.brand || null, visible: false, only: "edition" },
  { key: "reserviert", label: "Reserviert für", type: "text", get: (r) => r.reserviert || null, visible: false, only: "edition" },
  { key: "rueckgabe", label: "Rückgabe bis", type: "date", get: (r) => r.rueckgabe.slice(0, 10) || null, visible: false, only: "unikat" },
];

// „Art“ ist nur im Reiter „Alle“ sinnvoll, sonst gilt: Spalten der anderen Art fallen weg.
function relevant(c: Col, tab: ArtTab): boolean {
  if (c.only === "alle") return tab === "alle";
  return !c.only || tab === "alle" || c.only === tab;
}

const QUICK_KEYS: ColKey[] = ["programm", "typ", "status", "kuenstler", "glasur", "lagerort", "galerie"];
type Quick = Partial<Record<ColKey, string[]>>;

function quickLabel(key: ColKey, tab: ArtTab): string {
  if (key === "status") return tab === "unikat" ? "Status" : tab === "edition" ? "Zustand" : "Status / Zustand";
  return COL_LABEL[key];
}
const COL = Object.fromEntries(COLUMNS.map((c) => [c.key, c])) as Record<ColKey, Col>;
const COL_LABEL = Object.fromEntries(COLUMNS.map((c) => [c.key, c.label])) as Record<ColKey, string>;
const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.visible).map((c) => c.key);

type Op =
  | "contains"
  | "notContains"
  | "is"
  | "anyOf"
  | "noneOf"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "yes"
  | "no"
  | "on"
  | "before"
  | "after"
  | "empty"
  | "notEmpty";

const OPS: Record<FieldType, { op: Op; label: string }[]> = {
  text: [
    { op: "contains", label: "enthält" },
    { op: "notContains", label: "enthält nicht" },
    { op: "is", label: "ist genau" },
    { op: "empty", label: "ist leer" },
    { op: "notEmpty", label: "ist nicht leer" },
  ],
  select: [
    { op: "anyOf", label: "ist" },
    { op: "noneOf", label: "ist nicht" },
    { op: "empty", label: "ist leer" },
    { op: "notEmpty", label: "ist nicht leer" },
  ],
  multi: [
    { op: "anyOf", label: "enthält eine von" },
    { op: "noneOf", label: "enthält keine von" },
    { op: "empty", label: "ist leer" },
    { op: "notEmpty", label: "ist nicht leer" },
  ],
  number: [
    { op: "eq", label: "ist gleich" },
    { op: "neq", label: "ist nicht" },
    { op: "gt", label: "größer als" },
    { op: "gte", label: "mindestens" },
    { op: "lt", label: "kleiner als" },
    { op: "lte", label: "höchstens" },
    { op: "empty", label: "ist leer" },
    { op: "notEmpty", label: "ist nicht leer" },
  ],
  bool: [
    { op: "yes", label: "ist ja" },
    { op: "no", label: "ist nein" },
  ],
  date: [
    { op: "on", label: "am" },
    { op: "before", label: "vor" },
    { op: "after", label: "nach" },
    { op: "empty", label: "ist leer" },
    { op: "notEmpty", label: "ist nicht leer" },
  ],
};
const NO_VALUE: Op[] = ["empty", "notEmpty", "yes", "no"];

type Condition = { id: string; field: ColKey; op: Op; value: string | string[] };
type Conj = "und" | "oder";
type Sort = { key: ColKey; dir: "asc" | "desc" } | null;
type ViewDef = { v: number; tab: ArtTab; quick: Quick; conditions: Condition[]; conj: Conj; columns: ColKey[]; sort: Sort; search: string };

function labels(v: unknown): string[] {
  return asOpts(v).map((o) => o.label);
}
function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}
function isEmpty(v: CellValue): boolean {
  return v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

function toUnikatRow(i: RawItem): Row {
  const f = i.fields;
  return {
    id: i.id,
    art: UNIKAT,
    inv: str(f.inv),
    artikelnr: "",
    programm: "",
    name: str(f.name),
    typ: labels(f.typ)[0] ?? "",
    status: labels(f.status)[0] ?? "",
    anzahl: 1,
    kuenstler: labels(f.kuenstler)[0] ?? "",
    gedreht: labels(f.gedreht)[0] ?? "",
    glasiert: labels(f.glasiert)[0] ?? "",
    glasur: labels(f.glasur),
    datum: str(f.datum),
    gedrehtAm: str(f.gedrehtAm),
    glasiertAm: str(f.glasiertAm),
    jahr: num(f.jahr),
    masse: str(f.masse),
    lagerort: labels(f.lagerort)[0] ?? "",
    galerie: labels(f.galerie)[0] ?? "",
    preis: num(f.preis),
    vk: null,
    website: f.website === true,
    bildnachweis: str(f.bildnachweis),
    notiz: str(f.notiz),
    erfasstVon: str(f.erfasstVon),
    erfasstAm: str(f.erfasstAm),
    geaendertAm: str(f.geaendertAm),
    verkauftAm: str(f.verkauftAm),
    verkauftAn: str(f.verkauftAn),
    brand: "",
    reserviert: "",
    rueckgabe: str(f.rueckgabe),
    fotos: asAttachments(f.fotos),
  };
}

function toEditionRow(i: RawItem): Row {
  const f = i.fields;
  return {
    id: i.id,
    art: EDITION,
    inv: "",
    artikelnr: str(lookupValue(f.artikelnr)),
    programm: serieVon(labels(f.programm)[0] ?? ""),
    name: labels(f.modell)[0] ?? "",
    typ: labels(f.typ)[0] ?? "",
    status: labels(f.zustand)[0] ?? "",
    anzahl: num(f.anzahl) ?? 0,
    kuenstler: "",
    gedreht: "",
    glasiert: "",
    glasur: labels(f.glasur),
    datum: "",
    gedrehtAm: "",
    glasiertAm: "",
    jahr: null,
    masse: "",
    lagerort: labels(f.lagerort)[0] ?? "",
    galerie: "",
    preis: null,
    vk: num(lookupValue(f.vk)),
    website: null,
    bildnachweis: "",
    notiz: str(f.notiz),
    erfasstVon: "",
    erfasstAm: str(f.erfasstAm),
    geaendertAm: str(f.geaendertAm),
    verkauftAm: "",
    verkauftAn: "",
    brand: str(f.brand).slice(0, 10),
    reserviert: str(f.reserviert),
    rueckgabe: "",
    fotos: asAttachments(f.foto),
  };
}

function matches(r: Row, c: Condition): boolean {
  const col = COL[c.field];
  const v = col.get(r);
  if (c.op === "empty") return isEmpty(v);
  if (c.op === "notEmpty") return !isEmpty(v);
  if (c.op === "yes") return v === true;
  if (c.op === "no") return v === false;
  const list = Array.isArray(c.value) ? c.value : [];
  const text = typeof c.value === "string" ? c.value.trim().toLowerCase() : "";
  switch (col.type) {
    case "text": {
      if (!text) return true;
      const s = String(v ?? "").toLowerCase();
      if (c.op === "contains") return s.includes(text);
      if (c.op === "notContains") return !s.includes(text);
      return s === text;
    }
    case "select":
    case "multi": {
      if (list.length === 0) return true;
      const values = Array.isArray(v) ? v : v === null ? [] : [String(v)];
      const hit = values.some((x) => list.includes(x));
      return c.op === "noneOf" ? !hit : hit;
    }
    case "number": {
      const target = parseNumber(typeof c.value === "string" ? c.value : "");
      if (target === null) return true;
      if (typeof v !== "number") return c.op === "neq";
      return c.op === "eq" ? v === target : c.op === "neq" ? v !== target : c.op === "gt" ? v > target : c.op === "gte" ? v >= target : c.op === "lt" ? v < target : v <= target;
    }
    case "date": {
      if (!text) return true;
      if (typeof v !== "string") return false;
      return c.op === "on" ? v === text : c.op === "before" ? v < text : v > text;
    }
    default:
      return true;
  }
}

function matchesSearch(r: Row, term: string): boolean {
  if (!term) return true;
  const hay = [r.art, r.inv, r.artikelnr, r.programm, r.name, r.typ, r.status, r.kuenstler, r.gedreht, r.glasiert, r.lagerort, r.galerie, r.masse, r.notiz, r.verkauftAn, r.reserviert, ...r.glasur].join(" ").toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .every((t) => hay.includes(t));
}

function compareRows(a: Row, b: Row, sort: NonNullable<Sort>): number {
  const col = COL[sort.key];
  const va = col.get(a);
  const vb = col.get(b);
  if (isEmpty(va) && isEmpty(vb)) return 0;
  if (isEmpty(va)) return 1;
  if (isEmpty(vb)) return -1;
  const r =
    typeof va === "number" && typeof vb === "number"
      ? va - vb
      : String(Array.isArray(va) ? va.join(", ") : va).localeCompare(String(Array.isArray(vb) ? vb.join(", ") : vb), "de", { numeric: true });
  return sort.dir === "asc" ? r : -r;
}

function formatCell(col: Col, r: Row): string {
  const v = col.get(r);
  if (isEmpty(v)) return "";
  if (col.key === "preis" && typeof v === "number") return euro.format(v);
  if (col.key === "vk" && typeof v === "number") return euroCent.format(v);
  if (col.type === "number" && typeof v === "number") return col.key === "jahr" ? String(v) : zahl.format(v);
  if (col.type === "bool") return v ? "ja" : "nein";
  if (col.type === "date" && typeof v === "string") return formatDate(v);
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

function legacyToConditions(def: Record<string, unknown>): Condition[] {
  const f = (def.filters ?? {}) as Record<string, unknown>;
  const out: Condition[] = [];
  for (const key of ["typ", "status", "kuenstler", "glasur", "lagerort", "galerie"] as ColKey[]) {
    const list = f[key];
    if (Array.isArray(list) && list.length) out.push({ id: newId(), field: key, op: "anyOf", value: list.map(String) });
  }
  if (f.website === "ja" || f.website === "nein") out.push({ id: newId(), field: "website", op: f.website === "ja" ? "yes" : "no", value: "" });
  const range = (field: ColKey, von: unknown, bis: unknown) => {
    if (typeof von === "string" && von) out.push({ id: newId(), field, op: "gte", value: von });
    if (typeof bis === "string" && bis) out.push({ id: newId(), field, op: "lte", value: bis });
  };
  range("jahr", f.jahrVon, f.jahrBis);
  range("preis", f.preisVon, f.preisBis);
  out.push({ id: newId(), field: "art", op: "anyOf", value: [UNIKAT] });
  return out;
}

function exportRows(rows: Row[]) {
  downloadCsv(
    `kwm-tabelle-${today()}.csv`,
    ["Art", "Serie", "Inventarnummer", "Artikelnr.", "Name / Modell", "Typ", "Status / Zustand", "Anzahl", "Künstler:in", "Gedreht von", "Glasiert von", "Glasur", "Datum", "Jahr", "Maße", "Lagerort", "Partner", "Preis intern (€)", "VK-Preis (€)", "Auf Website", "Notiz", "Erfasst am", "Verkauft am", "Verkauft an", "Brand vom", "Reserviert für"],
    rows.map((r) => [
      r.art,
      r.programm,
      r.inv,
      r.artikelnr,
      r.name,
      r.typ,
      r.status,
      String(r.anzahl),
      r.kuenstler,
      r.gedreht,
      r.glasiert,
      r.glasur.join(", "),
      formatDate(r.datum),
      r.jahr === null ? "" : String(r.jahr),
      r.masse,
      r.lagerort,
      r.galerie,
      r.preis === null ? "" : String(r.preis),
      r.vk === null ? "" : String(r.vk),
      r.website === null ? "" : r.website ? "ja" : "nein",
      r.notiz,
      formatDate(r.erfasstAm),
      formatDate(r.verkauftAm),
      r.verkauftAn,
      formatDate(r.brand),
      r.reserviert,
    ]),
  );
}

// Startzustand aus der Adresse, z. B. aus den Kacheln der Übersicht: ?status=…&partner=…&art=…&verkauftJahr=…
type Start = { tab: ArtTab; quick: Quick; conditions: Condition[]; columns: ColKey[] };
function startFromUrl(): Start {
  const params = new URLSearchParams(window.location.search);
  const list = (key: string) => (params.get(key) ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  const art = list("art");
  const tab: ArtTab = art.length === 1 && art[0] === UNIKAT ? "unikat" : art.length === 1 && art[0] === EDITION ? "edition" : "alle";
  const quick: Quick = {};
  if (list("status").length) quick.status = list("status");
  if (list("partner").length) quick.galerie = list("partner");
  const conditions: Condition[] = [];
  const verkauftJahr = Number(params.get("verkauftJahr"));
  if (Number.isInteger(verkauftJahr) && verkauftJahr > 0) {
    conditions.push({ id: newId(), field: "verkauftAm", op: "after", value: `${verkauftJahr - 1}-12-31` });
    conditions.push({ id: newId(), field: "verkauftAm", op: "before", value: `${verkauftJahr + 1}-01-01` });
  }
  const extra: ColKey[] = [];
  if (quick.galerie || quick.status?.some((v) => v === "in Kommission" || v === "ausgestellt")) extra.push("galerie", "rueckgabe");
  if (conditions.length) extra.push("verkauftAm");
  return { tab, quick, conditions, columns: [...DEFAULT_VISIBLE, ...extra.filter((k) => !DEFAULT_VISIBLE.includes(k))] };
}

function matchesQuick(r: Row, quick: Quick): boolean {
  return QUICK_KEYS.every((key) => {
    const wanted = quick[key];
    if (!wanted?.length) return true;
    const v = COL[key].get(r);
    const values = Array.isArray(v) ? v : v === null ? [] : [String(v)];
    return values.some((x) => wanted.includes(x));
  });
}

function CheckList({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  if (options.length === 0) return <p className="text-sm text-muted-foreground p-2">Keine Werte vorhanden.</p>;
  return (
    <>
      {options.map((o) => {
        const checked = value.includes(o);
        return (
          <label key={o} className="flex items-center gap-3 min-h-11 px-2 rounded-md hover:bg-muted cursor-pointer">
            <Ankreuzfeld checked={checked} onChange={() => onChange(checked ? value.filter((x) => x !== o) : [...value, o])} />
            <span className="text-base">{o}</span>
          </label>
        );
      })}
    </>
  );
}

function MultiPick({ options, value, onChange, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  const text = value.length === 0 ? "Wert wählen" : value.length <= 2 ? value.join(", ") : `${value.length} ausgewählt`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Knopf variant="outline" className="h-11 justify-start text-base font-normal min-w-40 max-w-full truncate" aria-label={`${label}: Werte wählen`}>
          <span className="truncate">{text}</span>
        </Knopf>
      </PopoverTrigger>
      <PopoverContent align="start" className={`${POPOVER_CLASS} w-64 max-h-80 overflow-y-auto p-2`}>
        <CheckList options={options} value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

// Schnellfilter wie in Softrs Tabellen: ein Knopf je Feld, mehrere Werte je Feld (oder), Felder untereinander (und).
function QuickFilter({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const active = value.length > 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Knopf variant={active ? "secondary" : "outline"} className="h-11 text-base font-normal max-w-72">
          <span className="truncate">
            {label}
            {active && <span className="font-medium">: {value.length === 1 ? value[0] : `${value.length} gewählt`}</span>}
          </span>
          <ChevronDown className="w-4 h-4 ml-1 shrink-0" aria-hidden />
        </Knopf>
      </PopoverTrigger>
      <PopoverContent align="start" className={`${POPOVER_CLASS} w-64 max-h-80 overflow-y-auto p-2`}>
        <CheckList options={options} value={value} onChange={onChange} />
        {active && (
          <Knopf variant="ghost" className="w-full h-11 text-base mt-1" onClick={() => onChange([])}>
            Auswahl aufheben
          </Knopf>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ConditionRow({
  c,
  index,
  conj,
  fields,
  onConj,
  onChange,
  onRemove,
  optionsFor,
}: {
  c: Condition;
  index: number;
  conj: Conj;
  fields: Col[];
  onConj: (c: Conj) => void;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  optionsFor: (key: ColKey) => string[];
}) {
  const col = COL[c.field];
  const ops = OPS[col.type];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-20 shrink-0">
        {index === 0 ? (
          <span className="text-base text-muted-foreground">Wenn</span>
        ) : index === 1 ? (
          <Auswahl aria-label="Verknüpfung" value={conj} onChange={(e) => onConj(e.target.value as Conj)} kompakt breite="w-20">
            <option value="und">und</option>
            <option value="oder">oder</option>
          </Auswahl>
        ) : (
          <span className="text-base text-muted-foreground">{conj}</span>
        )}
      </div>
      <Auswahl
        aria-label="Feld"
        kompakt
        breite="w-auto"
        value={c.field}
        onChange={(e) => {
          const field = e.target.value as ColKey;
          onChange({ ...c, field, op: OPS[COL[field].type][0].op, value: COL[field].type === "select" || COL[field].type === "multi" ? [] : "" });
        }}
      >
        {(fields.includes(col) ? fields : [col, ...fields]).map((x) => (
          <option key={x.key} value={x.key}>
            {x.label}
          </option>
        ))}
      </Auswahl>
      <Auswahl aria-label="Bedingung" value={c.op} onChange={(e) => onChange({ ...c, op: e.target.value as Op })} kompakt breite="w-auto">
        {ops.map((o) => (
          <option key={o.op} value={o.op}>
            {o.label}
          </option>
        ))}
      </Auswahl>
      {!NO_VALUE.includes(c.op) &&
        (col.type === "select" || col.type === "multi" ? (
          <MultiPick label={col.label} options={optionsFor(c.field)} value={Array.isArray(c.value) ? c.value : []} onChange={(value) => onChange({ ...c, value })} />
        ) : (
          <Feld
            aria-label="Wert"
            type={col.type === "date" ? "date" : "text"}
            inputMode={col.type === "number" ? "decimal" : undefined}
            value={typeof c.value === "string" ? c.value : ""}
            onChange={(e) => onChange({ ...c, value: e.target.value })}
            placeholder="Wert"
            className="h-11 text-base w-44"
          />
        ))}
      <Knopf variant="ghost" className="h-11 w-11 p-0" aria-label="Bedingung entfernen" onClick={onRemove}>
        <X className="w-5 h-5" aria-hidden />
      </Knopf>
    </div>
  );
}

function Detail({ r, onClose }: { r: Row; onClose: () => void }) {
  const tab: ArtTab = r.art === UNIKAT ? "unikat" : "edition";
  const fields: [string, string][] = COLUMNS.filter((c) => c.key !== "name" && relevant(c, tab)).map((c) => [c.key === "inv" ? (r.art === UNIKAT ? "Inv.-Nr." : "Artikelnr.") : c.label, formatCell(c, r)]);
  if (r.art === UNIKAT) fields.push(["Bildnachweis", r.bildnachweis], ["Erfasst von", r.erfasstVon]);
  const href = r.art === UNIKAT ? `/bestand?id=${r.id}` : "/bestand?tab=edition";
  const foto = r.fotos[0];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-2xl`}>
        <PanelHeader title={r.name || "Ohne Namen"} description={[r.art, r.inv || r.artikelnr, r.typ].filter(Boolean).join(" · ")} />
        <div className="pb-2 space-y-5">
          {foto ? (
            <img src={thumb(foto, "large")} alt={r.name} className="w-full max-h-80 object-contain rounded-lg bg-muted" />
          ) : (
            <div className="h-32 rounded-lg bg-muted flex items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="w-5 h-5" aria-hidden /> Kein Foto
            </div>
          )}
          <dl className="grid grid-cols-2 gap-4">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-base break-words">{value || "–"}</dd>
              </div>
            ))}
          </dl>
          <Knopf asChild className="w-full h-12 text-base">
            <a href={href}>Im Bestand bearbeiten</a>
          </Knopf>
          <DoneButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SaveViewDialog({ open, onOpenChange, onSave, taken }: { open: boolean; onOpenChange: (o: boolean) => void; onSave: (name: string) => Promise<void>; taken: string[] }) {
  const [name, setName] = useState("");
  const duplicate = taken.some((t) => t.toLowerCase() === name.trim().toLowerCase());
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${DIALOG_CLASS} max-w-md`}>
        <PanelHeader title="Ansicht speichern" description="Gespeichert werden Reiter, Filter, Spalten, Sortierung und Suche. Alle Mitarbeitenden sehen die Ansicht." />
        <div className="pb-2 space-y-5">
          <div>
            <FieldLabel htmlFor="view-name">Name der Ansicht</FieldLabel>
            <Feld id="view-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Seladon im Schauraum" aria-invalid={duplicate} />
            <ErrorText>{duplicate ? "Diesen Namen gibt es schon. Bitte einen anderen wählen." : undefined}</ErrorText>
          </div>
          <Knopf
            className="w-full h-12 text-base"
            disabled={!name.trim() || duplicate || busy}
            onClick={async () => {
              setBusy(true);
              await onSave(name.trim());
              setBusy(false);
              setName("");
            }}
          >
            Speichern
          </Knopf>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Pager({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_ROWS);
  if (pages <= 1) return null;
  const from = page * PAGE_ROWS + 1;
  const to = Math.min(total, from + PAGE_ROWS - 1);
  return (
    <nav aria-label="Seiten" className="flex items-center justify-between gap-2">
      <Knopf variant="outline" className="h-11 text-base" disabled={page === 0} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="w-5 h-5 mr-1" aria-hidden /> Zurück
      </Knopf>
      <span className="text-sm text-muted-foreground tabular-nums">
        {zahl.format(from)}–{zahl.format(to)} von {zahl.format(total)}
      </span>
      <Knopf variant="outline" className="h-11 text-base" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Weiter <ChevronRight className="w-5 h-5 ml-1" aria-hidden />
      </Knopf>
    </nav>
  );
}

// Textspalte direkt nach einer rechtsbündigen Zahlenspalte bekommt Luft, sonst kleben Betrag und Text aneinander.
function gapAfterNumber(cols: { align?: string }[], i: number): string {
  return i > 0 && cols[i - 1].align === "right" && cols[i].align !== "right" ? "pl-8" : "";
}

export default function Block() {
  const user = useCurrentUser();
  const [start] = useState(startFromUrl);
  const [tab, setTab] = useState<ArtTab>(start.tab);
  const [search, setSearch] = useState("");
  const [quick, setQuick] = useState<Quick>(start.quick);
  const [conditions, setConditions] = useState<Condition[]>(start.conditions);
  const [conj, setConj] = useState<Conj>("und");
  const [filterOpen, setFilterOpen] = useState(start.conditions.length > 0);
  const [columns, setColumns] = useState<ColKey[]>(start.columns);
  const [sort, setSort] = useState<Sort>(null);
  const [page, setPage] = useState(0);
  const [viewId, setViewId] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);

  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const ansichtenQuery = useRecords({ from: ds.ansichten, select: ansichtSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  const createView = useRecordCreate({ from: ds.ansichten, fields: ansichtSelect });
  const deleteView = useRecordDelete({ from: ds.ansichten });

  const rows = useMemo(
    () => [
      ...(unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toUnikatRow(i as RawItem)),
      ...(editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toEditionRow(i as RawItem)),
    ],
    [unikateQuery.data, editionQuery.data],
  );
  const ansichten = (ansichtenQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
    const f = (i as RawItem).fields;
    return { id: i.id, name: str(f.name), definition: str(f.definition) };
  });

  const art = ART_OF_TAB[tab];
  const tabRows = useMemo(() => (art ? rows.filter((r) => r.art === art) : rows), [rows, art]);
  const tabColumns = COLUMNS.filter((c) => relevant(c, tab));
  const quickKeys = QUICK_KEYS.filter((k) => relevant(COL[k], tab));

  const optionsFor = (key: ColKey): string[] => {
    const set = new Set<string>();
    tabRows.forEach((r) => {
      const v = COL[key].get(r);
      (Array.isArray(v) ? v : v === null ? [] : [String(v)]).forEach((x) => x && set.add(x));
    });
    return [...set].sort((a, b) => a.localeCompare(b, "de"));
  };

  const activeConditions = conditions.filter((c) => NO_VALUE.includes(c.op) || (Array.isArray(c.value) ? c.value.length > 0 : c.value.trim() !== ""));
  const quickCount = quickKeys.filter((k) => quick[k]?.length).length;
  const visibleRows = useMemo(() => {
    const out = tabRows.filter(
      (r) =>
        matchesSearch(r, search.trim()) &&
        matchesQuick(r, quick) &&
        (activeConditions.length === 0 || (conj === "und" ? activeConditions.every((c) => matches(r, c)) : activeConditions.some((c) => matches(r, c)))),
    );
    return sort ? out.sort((a, b) => compareRows(a, b, sort)) : out.sort((a, b) => b.erfasstAm.localeCompare(a.erfasstAm));
  }, [tabRows, search, quick, activeConditions, conj, sort]);
  const lastPage = Math.max(0, Math.ceil(visibleRows.length / PAGE_ROWS) - 1);
  const currentPage = Math.min(page, lastPage);
  const pageRows = visibleRows.slice(currentPage * PAGE_ROWS, (currentPage + 1) * PAGE_ROWS);

  const shown = tabColumns.filter((c) => columns.includes(c.key));
  const tableBox = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });
  const scroller = () => tableBox.current?.firstElementChild as HTMLElement | null | undefined;
  const updateScroll = () => {
    const el = scroller();
    if (!el) return;
    const left = el.scrollLeft > 0;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setScrollState((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  };
  useEffect(() => {
    const el = scroller();
    updateScroll();
    el?.addEventListener("scroll", updateScroll);
    window.addEventListener("resize", updateScroll);
    return () => {
      el?.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  });
  const scrollBy = (dx: number) => scroller()?.scrollBy({ left: dx, behavior: "smooth" });

  const summeAnzahl = visibleRows.reduce((n, r) => n + r.anzahl, 0);
  // Preise verkaufter Stücke zählen nur mit, wenn ausschließlich Verkauftes gezeigt wird (dann ist die Summe der Umsatz).
  const nurVerkauft = visibleRows.length > 0 && visibleRows.every((r) => r.status === VERKAUFT);
  const ohneVerkauftePreise = !nurVerkauft && visibleRows.some((r) => r.status === VERKAUFT && r.preis !== null);
  const summePreis = visibleRows.filter((r) => nurVerkauft || r.status !== VERKAUFT).reduce((n, r) => n + (r.preis ?? 0), 0);
  const summeVk = visibleRows.reduce((n, r) => n + (r.vk ?? 0) * r.anzahl, 0);
  const summeLabel = ohneVerkauftePreise ? "Summe (Preis ohne Verkauftes)" : "Summe";
  const mitFotos = pageRows.some((r) => r.fotos.length > 0);
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const anythingSet = quickCount > 0 || conditions.length > 0 || search !== "" || sort !== null;

  // Jede Änderung an Filter, Suche oder Sortierung beginnt wieder auf Seite 1.
  function changed() {
    setPage(0);
    setViewId("");
  }

  function switchTab(next: ArtTab) {
    setTab(next);
    setQuick((qq) => Object.fromEntries(Object.entries(qq).filter(([k]) => relevant(COL[k as ColKey], next))) as Quick);
    setPage(0);
  }

  function addCondition() {
    setConditions((cs) => [...cs, { id: newId(), field: "typ", op: "anyOf", value: [] }]);
    setFilterOpen(true);
    changed();
  }

  function toggleSort(key: ColKey) {
    setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));
    setPage(0);
  }

  function applyView(id: string) {
    const view = ansichten.find((v) => v.id === id);
    if (!view) return;
    try {
      const def = JSON.parse(view.definition) as Partial<ViewDef> & Record<string, unknown>;
      if (def.v === VIEW_VERSION || def.v === 2) {
        setTab(def.tab ?? "alle");
        setQuick(def.quick ?? {});
        setConditions(def.conditions ?? []);
        setConj(def.conj ?? "und");
        setColumns(def.columns?.length ? def.columns : DEFAULT_VISIBLE);
        setSort(def.sort ?? null);
      } else {
        setTab("alle");
        setQuick({});
        setConditions(legacyToConditions(def));
        setConj("und");
        setColumns(DEFAULT_VISIBLE);
        setSort(null);
      }
      setSearch(typeof def.search === "string" ? def.search : "");
      setFilterOpen((def.conditions?.length ?? 0) > 0);
      setPage(0);
      setViewId(id);
    } catch {
      toast.error("Diese Ansicht ist beschädigt.");
    }
  }

  async function saveView(name: string) {
    const def: ViewDef = { v: VIEW_VERSION, tab, quick, conditions, conj, columns, sort, search };
    try {
      const created = await createView.mutateAsync({ name, definition: JSON.stringify(def), von: user?.fullName || user?.email || "" } as never);
      await ansichtenQuery.refetch();
      setViewId((created as { id: string }).id);
      setSaveOpen(false);
      toast.success(`Ansicht „${name}“ gespeichert.`);
    } catch {
      toast.error("Ansicht konnte nicht gespeichert werden.");
    }
  }

  async function removeView() {
    const view = ansichten.find((v) => v.id === viewId);
    if (!view || !window.confirm(`Ansicht „${view.name}“ für alle entfernen?`)) return;
    try {
      await deleteView.mutateAsync(view.id);
      await ansichtenQuery.refetch();
      setViewId("");
      toast.success(`Ansicht „${view.name}“ entfernt.`);
    } catch {
      toast.error("Ansicht konnte nicht entfernt werden.");
    }
  }

  function reset() {
    setQuick({});
    setConditions([]);
    setSearch("");
    setSort(null);
    setColumns(DEFAULT_VISIBLE);
    setFilterOpen(false);
    changed();
  }

  // Untertitel der Druckansicht: was gerade gefiltert ist, damit eine Liste für sich verständlich bleibt.
  function filterBeschreibung(): string {
    const teile: string[] = [tab === "alle" ? "Geschirr, Edition und Unikate" : tab === "unikat" ? "Unikate" : EDITION];
    quickKeys.forEach((k) => quick[k]?.length && teile.push(`${quickLabel(k, tab)}: ${quick[k]?.join(", ")}`));
    if (search.trim()) teile.push(`Suche „${search.trim()}“`);
    if (activeConditions.length) teile.push(`${activeConditions.length} weitere Bedingung${activeConditions.length === 1 ? "" : "en"}`);
    return teile.join(" · ");
  }

  function exportPdf() {
    const partner = quick.galerie?.length === 1 ? quick.galerie[0] : "";
    const ok = printTable({
      title: partner ? `Liste ${partner}` : "Bestandsliste",
      subtitle: filterBeschreibung(),
      columns: shown.map((c) => ({ label: c.label, align: c.align })),
      rows: visibleRows.map((r) => shown.map((c) => formatCell(c, r))),
      footer: shown.map((c, i) => footerCell(c, i)),
    });
    if (!ok) toast.error("Der Browser hat das Druckfenster blockiert. Bitte Pop-ups für diese Seite erlauben.");
  }

  const footerCell = (c: Col, i: number) =>
    c.key === "anzahl" ? `${zahl.format(summeAnzahl)} Stück` : c.key === "preis" ? euro.format(summePreis) : c.key === "vk" ? (summeVk ? euroCent.format(summeVk) : "") : i === 0 ? summeLabel : "";

  return (
    <div className={SEITE_BREIT_CLASS}>
      <div className="w-full space-y-4" lang="de">
        <PageHeader
          title="Tabelle"
          description={`${zahl.format(visibleRows.length)} von ${zahl.format(tabRows.length)} Einträgen`}
          actions={
            <>
              <div className="flex flex-1 min-w-0 sm:flex-none sm:w-80">
                <SearchField
                  label="Suche"
                  placeholder="Suchen: Name, Nummer, Glasur …"
                  value={search}
                  onChange={(v) => {
                    setSearch(v);
                    changed();
                  }}
                />
              </div>
              <ExportMenu onCsv={() => exportRows(visibleRows)} onPdf={exportPdf} disabled={visibleRows.length === 0} />
            </>
          }
        />

        <Tabs
          label="Art"
          tabs={[
            { key: "alle" as ArtTab, label: "Alle", count: rows.length },
            { key: "edition" as ArtTab, label: EDITION, count: rows.filter((r) => r.art === EDITION).length },
            { key: "unikat" as ArtTab, label: "Unikate", count: rows.filter((r) => r.art === UNIKAT).length },
          ]}
          value={tab}
          onChange={switchTab}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className={`${SCROLL_ROW} sm:contents`}>
            {quickKeys.map((key) => (
              <QuickFilter
                key={key}
                label={quickLabel(key, tab)}
                options={optionsFor(key)}
                value={quick[key] ?? []}
                onChange={(v) => {
                  setQuick((qq) => ({ ...qq, [key]: v }));
                  changed();
                }}
              />
            ))}
            <Knopf variant={activeConditions.length ? "secondary" : "ghost"} className="h-11 text-base" onClick={() => (conditions.length ? setFilterOpen((o) => !o) : addCondition())} aria-expanded={filterOpen}>
              <SlidersHorizontal className="w-5 h-5 mr-2" aria-hidden />
              Weitere Filter{activeConditions.length ? ` (${activeConditions.length})` : ""}
            </Knopf>
            {anythingSet && (
              <Knopf variant="ghost" className="h-11 text-base underline-offset-4 hover:underline" onClick={reset}>
                Zurücksetzen
              </Knopf>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Knopf variant="outline" className={`h-11 text-base ${NUR_TABELLE}`}>
                  <Columns3 className="w-5 h-5 mr-2" aria-hidden />
                  Spalten
                </Knopf>
              </PopoverTrigger>
              <PopoverContent align="end" className={`${POPOVER_CLASS} w-64 max-h-96 overflow-y-auto p-2`}>
                {tabColumns.map((c) => {
                  const checked = columns.includes(c.key);
                  return (
                    <label key={c.key} className="flex items-center gap-3 min-h-11 px-2 rounded-md hover:bg-muted cursor-pointer">
                      <Ankreuzfeld checked={checked} onChange={() => setColumns((cols) => (checked ? cols.filter((k) => k !== c.key) : COLUMNS.map((x) => x.key).filter((k) => k === c.key || cols.includes(k))))} />
                      <span className="text-base">{c.label}</span>
                    </label>
                  );
                })}
                <Knopf variant="ghost" className="w-full h-11 text-base mt-1" onClick={() => setColumns(DEFAULT_VISIBLE)}>
                  Standardspalten
                </Knopf>
              </PopoverContent>
            </Popover>
            <Auswahl aria-label="Gespeicherte Ansicht" value={viewId} onChange={(e) => (e.target.value ? applyView(e.target.value) : setViewId(""))} kompakt breite="flex-1 min-w-0 sm:flex-none sm:max-w-60">
              <option value="">Gespeicherte Ansichten</option>
              {ansichten.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Auswahl>
            <Knopf variant="outline" className="h-11 text-base" onClick={() => setSaveOpen(true)}>
              <Bookmark className="w-5 h-5 mr-2" aria-hidden />
              Speichern
            </Knopf>
            {viewId && deleteView.enabled && (
              <Knopf variant="ghost" className="h-11 text-base" onClick={removeView}>
                <Trash2 className="w-4 h-4 mr-1" aria-hidden />
                Ansicht entfernen
              </Knopf>
            )}
          </div>
        </div>

        {filterOpen && (
          <div className={`${PANEL_CLASS} p-3 space-y-3`}>
            {conditions.length === 0 ? (
              <p className="text-base text-muted-foreground">Für Bedingungen wie „Preis ist leer“, „Verkauft am nach …“ oder „Rückgabe bis vor …“.</p>
            ) : (
              conditions.map((c, i) => (
                <ConditionRow
                  key={c.id}
                  c={c}
                  index={i}
                  conj={conj}
                  fields={tabColumns}
                  onConj={(next) => {
                    setConj(next);
                    changed();
                  }}
                  optionsFor={optionsFor}
                  onChange={(next) => {
                    setConditions((cs) => cs.map((x) => (x.id === c.id ? next : x)));
                    changed();
                  }}
                  onRemove={() => {
                    setConditions((cs) => cs.filter((x) => x.id !== c.id));
                    changed();
                  }}
                />
              ))
            )}
            <Knopf variant="outline" className="h-11 text-base" onClick={addCondition}>
              <Plus className="w-5 h-5 mr-1" aria-hidden />
              Bedingung hinzufügen
            </Knopf>
          </div>
        )}

        {failed ? (
          <ErrorState text="Die Daten konnten nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Tabelle wird geladen …" />
        ) : visibleRows.length === 0 ? (
          <div className="space-y-2">
            <EmptyState text="Keine Einträge gefunden." />
            {anythingSet && (
              <Knopf variant="outline" className="h-11 text-base" onClick={reset}>
                Filter zurücksetzen
              </Knopf>
            )}
          </div>
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              <ul className={`${PANEL_CLASS} px-3 divide-y`}>
                {pageRows.map((r) => (
                  <li key={`${r.art}-${r.id}`}>
                    <ListRow
                      fotos={r.fotos}
                      title={r.name || "Ohne Namen"}
                      sub={[r.inv || r.artikelnr, r.typ, r.galerie || r.lagerort].filter(Boolean).join(" · ")}
                      meta={
                        <span className="flex flex-col items-end gap-1">
                          <StatusBadge text={r.status} />
                          <span className="text-sm tabular-nums">{r.art === EDITION ? `${zahl.format(r.anzahl)} Stück` : r.preis !== null ? euro.format(r.preis) : ""}</span>
                        </span>
                      }
                      onClick={() => setSelected(r)}
                    />
                  </li>
                ))}
              </ul>
              <Pager page={currentPage} total={visibleRows.length} onPage={setPage} />
              <p className="text-sm font-medium text-right">
                {summeLabel}: {zahl.format(summeAnzahl)} Stück · {euro.format(summePreis)}
              </p>
            </div>
            <div className="hidden sm:block space-y-3">
              {(scrollState.left || scrollState.right) && (
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground mr-auto">Weitere Spalten: seitlich wischen oder Pfeile nutzen.</span>
                  <Knopf variant="outline" className="h-11 w-11 p-0" aria-label="Spalten links zeigen" disabled={!scrollState.left} onClick={() => scrollBy(-SCROLL_STEP)}>
                    <ChevronLeft className="w-5 h-5" aria-hidden />
                  </Knopf>
                  <Knopf variant="outline" className="h-11 w-11 p-0" aria-label="Spalten rechts zeigen" disabled={!scrollState.right} onClick={() => scrollBy(SCROLL_STEP)}>
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  </Knopf>
                </div>
              )}
              <div ref={tableBox} className={TABLE_PANEL_CLASS}>
                <Table className="text-base">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {mitFotos && (
                        <TableHead className="w-14">
                          <span className="sr-only">Foto</span>
                        </TableHead>
                      )}
                      {shown.map((c, i) => {
                        const active = sort?.key === c.key;
                        return (
                          <TableHead key={c.key} className={`px-3 font-normal text-muted-foreground ${c.align === "right" ? "text-right" : ""} ${gapAfterNumber(shown, i)}`} aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : "none"}>
                            <button type="button" onClick={() => toggleSort(c.key)} className={`inline-flex items-center gap-1 min-h-11 hover:text-foreground ${active ? "text-foreground font-medium" : ""}`}>
                              {c.label}
                              {active && (sort?.dir === "asc" ? <ArrowUp className="w-4 h-4" aria-hidden /> : <ArrowDown className="w-4 h-4" aria-hidden />)}
                            </button>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((r) => (
                      <TableRow key={`${r.art}-${r.id}`} onClick={() => setSelected(r)} className="cursor-pointer">
                        {mitFotos && (
                          <TableCell className="px-3 py-1.5">
                            <Thumb fotos={r.fotos} className="w-9 h-9 rounded-md" />
                          </TableCell>
                        )}
                        {shown.map((c, i) => (
                          <TableCell key={c.key} className={`px-3 py-2 ${gapAfterNumber(shown, i)} ${c.align === "right" ? "text-right tabular-nums" : ""} ${c.key === "name" ? "font-medium min-w-44 whitespace-normal" : c.key === "notiz" ? "min-w-56 whitespace-normal" : ""}`}>
                            {c.key === "status" && r.status ? (
                              <StatusBadge text={r.status} />
                            ) : c.key === "name" ? (
                              <button type="button" className="text-left hover:underline min-h-11" onClick={() => setSelected(r)}>
                                {r.name || "Ohne Namen"}
                              </button>
                            ) : c.key === "typ" && r.typ ? (
                              <Etikett>
                                {r.typ}
                              </Etikett>
                            ) : c.key === "glasur" && r.glasur.length ? (
                              <span className="flex flex-wrap gap-1">
                                {r.glasur.map((g) => (
                                  <Etikett key={g}>
                                    {g}
                                  </Etikett>
                                ))}
                              </span>
                            ) : (
                              formatCell(c, r)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="hover:bg-transparent">
                      {mitFotos && <TableCell />}
                      {shown.map((c, i) => (
                        <TableCell key={c.key} className={`px-3 py-2 ${gapAfterNumber(shown, i)} ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                          {footerCell(c, i)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
              <Pager page={currentPage} total={visibleRows.length} onPage={setPage} />
            </div>
          </>
        )}
        <p className="text-sm text-muted-foreground">Tipp: Spaltenkopf antippen zum Sortieren. Eintrag antippen für alle Angaben. Bearbeitet wird im Bestand.</p>
      </div>
      <SaveViewDialog open={saveOpen} onOpenChange={setSaveOpen} onSave={saveView} taken={ansichten.map((v) => v.name)} />
      {selected && <Detail r={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

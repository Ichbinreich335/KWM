// Generiert von konzept/softr/build.mjs aus src/blocks/erfassen.tsx und src/shared/. Nicht von Hand ändern.
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { datasource, q, useFieldOptions, useRecord, useRecordCreate, useRecords, useRecordUpdate, useUpload } from "@/lib/datasource";
import { useNavigationSetting } from "@/lib/editable-settings";
import { NavigationAction } from "@/components/navigation-action";
import { useCurrentUser } from "@/lib/user";
import { Camera, Check, Loader2, Minus, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PAGE_SIZE = 100;
const VERFUEGBAR = "verfügbar";
const RESERVIERT = "reserviert";
const VERKAUFT = "verkauft";
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const GESCHRUEHT = "geschrüht";
const GLASIERT = "glasiert";
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

type PostenKey = Pick<Posten, "modellId" | "zustand" | "glasurId" | "brand" | "reserviert" | "status" | "partnerId" | "gedrehtId" | "glasiertId">;

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
    a.gedrehtId === b.gedrehtId &&
    a.glasiertId === b.glasiertId
  );
}

// Status für die Anzeige, z. B. „ausgestellt bei Galerie Mitte“.
function statusText(p: Pick<Posten, "status" | "partner">): string {
  return p.status ? [p.status, p.partner && `bei ${p.partner}`].filter(Boolean).join(" ") : "";
}

// Kurzbeschreibung eines Postens ohne Modell, z. B. „Rostbraun · Brand 24.09.2026“.
function postenText(p: Pick<Posten, "zustand" | "glasur" | "brand">): string {
  return [p.glasur || p.zustand, p.brand && `Brand ${formatDate(p.brand)}`].filter(Boolean).join(" · ");
}

// Bezeichnung des Datensatzes (Hauptfeld in der Datenbank), damit die Tabelle in Softr lesbar bleibt.
function bezeichnung(modell: string, p: Pick<Posten, "zustand" | "glasur" | "brand" | "reserviert" | "status" | "partner">): string {
  return [modell, postenText(p), p.reserviert && `für ${p.reserviert}`, statusText(p)].filter(Boolean).join(" · ");
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

// Klebende Leisten am unteren Rand: am Handy knapp über Softrs Navigationsleiste (ca. 56 px), ab Tablet am Rand.
const STICKY_BOTTOM = "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:bottom-4";

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

function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Feld type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
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

// Rückfrage vor einem Schritt, den man noch abbrechen kann, z. B. „Ohne Foto speichern?“. Bestätigen ist der Hauptknopf.
function Rueckfrage({
  offen,
  titel,
  text,
  bestaetigen,
  abbrechen,
  onBestaetigen,
  onAbbrechen,
}: {
  offen: boolean;
  titel: string;
  text: string;
  bestaetigen: string;
  abbrechen: string;
  onBestaetigen: () => void;
  onAbbrechen: () => void;
}) {
  return (
    <Dialog open={offen} onOpenChange={(o) => !o && onAbbrechen()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-md`}>
        <PanelHeader title={titel} description={text} />
        <div className="pb-2 flex flex-col-reverse sm:flex-row gap-3">
          <Knopf variant="outline" className="h-12 flex-1 text-base" onClick={onAbbrechen}>
            {abbrechen}
          </Knopf>
          <Knopf className="h-12 flex-1 text-base" onClick={onBestaetigen}>
            {bestaetigen}
          </Knopf>
        </div>
      </DialogContent>
    </Dialog>
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

const ds = datasource.define({ unikate: "unikate", edition: "edition", glasuren: "glasuren", kuenstler: "kuenstler", lagerorte: "lagerorte", partner: "partner", modelle: "modelle" });
const glasurNeu = q.select({ name: "OuhBi" });
const personNeu = q.select({ name: "vqD0c" });
const glasurListe = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const kuenstlerListe = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const lagerortListe = q.select({ name: "AoOjs", archiviert: "kMBsy" });
const partnerListe = q.select({ name: "a4yfc", archiviert: "24Tn9" });
const modellListe = q.select({ name: "eXo5w", artikelnr: "BNpSN", programm: "Mrgtb", glasuren: "EazCZ", masse: "h65qx", archiviert: "3tlrw" });

const unikatFields = q.select({
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
});
const unikatInfo = q.select({ name: "7IBVW", inventarnummer: "glG6V" });

const editionFields = q.select({
  bezeichnung: "LFUIR",
  modell: "jxN6x",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  lagerort: "T5iQe",
  foto: "nibt5",
  notiz: "lyJky",
  brand: "jqmqn",
  reserviert: "L1bO5",
  status: "v9V6W",
  partner: "hs3iV",
  gedreht: "7FQQm",
  glasiert: "dkREk",
  masse: "eVHco",
});

const FIELD_NAMES: Record<string, string> = {
  name: "Name",
  status: "Status",
  preis: "Preis",
  modell: "Modell",
  zustand: "Zustand",
  glasur: "Glasur",
  anzahl: "Anzahl",
};

// Zuerst die Serie wählen, dann nur deren Modelle. Geschirr und Edition sind der Hauptfluss, Unikate kommen seltener vor.
type Art = "geschirr" | "edition" | "unikat";
const ART_TABS: { key: Art; label: string }[] = [
  { key: "geschirr", label: "Geschirr" },
  { key: "edition", label: "Edition" },
  { key: "unikat", label: "Unikat" },
];
const IM_HAUS = "im Haus";
const EDITION_STATUS: Opt[] = [IM_HAUS, AUSGESTELLT, KOMMISSION].map((s) => ({ id: s, label: s }));
type Saved = { art: Art; recordId: string; text: string };

type UnikatForm = {
  name: string;
  typ: string;
  status: string;
  gedreht: string;
  glasiert: string;
  datum: string;
  gedrehtAm: string;
  glasiertAm: string;
  glasur: string[];
  masse: string;
  lagerort: string;
  galerie: string;
  preis: string;
  bildnachweis: string;
  website: boolean;
  notiz: string;
};

type EditionForm = {
  modell: string;
  zustand: string;
  glasur: string;
  brand: string;
  reserviert: string;
  status: string;
  partner: string;
  gedreht: string;
  glasiert: string;
  masse: string;
  anzahl: number;
  lagerort: string;
  notiz: string;
};

const emptyUnikat = (): UnikatForm => ({
  name: "",
  typ: "",
  status: "verfügbar",
  gedreht: "",
  glasiert: "",
  datum: today(),
  gedrehtAm: "",
  glasiertAm: "",
  glasur: [],
  masse: "",
  lagerort: "",
  galerie: "",
  preis: "",
  bildnachweis: "",
  website: false,
  notiz: "",
});

const emptyEdition = (): EditionForm => ({
  modell: "",
  zustand: GESCHRUEHT,
  glasur: "",
  brand: today(),
  reserviert: "",
  status: IM_HAUS,
  partner: "",
  gedreht: "",
  glasiert: "",
  masse: "",
  anzahl: 1,
  lagerort: "",
  notiz: "",
});

// Am Handy eine Spalte, ab Desktop Pflichtangaben links und Weitere Angaben rechts.
const COLUMNS = "grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12";
const SECOND_COLUMN = "border-t pt-6 lg:border-t-0 lg:pt-0";

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

// Zweite Spalte am Rechner, am Handy darunter. Nichts ist eingeklappt: Speichern klebt unten und ist jederzeit erreichbar.
function ZweiteSpalte({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-6 ${SECOND_COLUMN}`}>
      <SectionTitle title={title} hint={hint} />
      {children}
    </div>
  );
}

function SuccessCard({ saved, onNext }: { saved: Saved; onNext: () => void }) {
  const bestandLink = useNavigationSetting({
    name: "bestand-link",
    label: "Link zum Bestand",
    initialValue: { destination: "/bestand", openIn: "SELF" },
  });
  const { data } = useRecord({
    from: ds.unikate,
    select: unikatInfo,
    recordId: saved.art === "unikat" ? saved.recordId : null,
  });
  const inventarnummer = (data as { fields?: { inventarnummer?: string } } | undefined)?.fields?.inventarnummer;

  return (
    <div className={`${PANEL_CLASS} p-6 text-center space-y-4`} role="status">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="w-7 h-7 text-primary" aria-hidden />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Gespeichert</h2>
        <p className="text-base text-muted-foreground mt-1">{saved.text}</p>
        {inventarnummer && <p className="text-base mt-1">Inventarnummer: <strong>{inventarnummer}</strong></p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Knopf size="lg" onClick={onNext}>
          Nächstes Stück erfassen
        </Knopf>
        <Knopf asChild size="lg" variant="outline">
          <NavigationAction navigation={bestandLink}>Zum Bestand</NavigationAction>
        </Knopf>
      </div>
    </div>
  );
}

export default function Block() {
  const user = useCurrentUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [art, setArt] = useState<Art>("geschirr");
  const isMenge = art !== "unikat";
  const [unikat, setUnikat] = useState<UnikatForm>(emptyUnikat);
  const [edition, setEdition] = useState<EditionForm>(emptyEdition);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);
  const [rueckfrage, setRueckfrage] = useState(false);
  const [einzelDaten, setEinzelDaten] = useState(false);
  const [mehrOffen, setMehrOffen] = useState(false);

  const { uploadAsync } = useUpload();
  const createUnikat = useRecordCreate({ from: ds.unikate, fields: unikatFields });
  const createEdition = useRecordCreate({ from: ds.edition, fields: editionFields });
  const updateEdition = useRecordUpdate({ from: ds.edition, fields: q.select({ anzahl: "Ciiwp" }) });

  const typOptions = useFieldOptions({ from: ds.unikate, select: unikatFields, field: "typ" }).options as Opt[];
  const statusOptions = useFieldOptions({ from: ds.unikate, select: unikatFields, field: "status" })
    .options as Opt[];
  const zustandOptions = useFieldOptions({ from: ds.edition, select: editionFields, field: "zustand" })
    .options as Opt[];

  // Auswahllisten direkt aus den Stammdaten, damit archivierte Einträge wegfallen.
  const kuenstlerQuery = useRecords({ from: ds.kuenstler, select: kuenstlerListe, count: PAGE_SIZE });
  const glasurQuery = useRecords({ from: ds.glasuren, select: glasurListe, count: PAGE_SIZE });
  const lagerortQuery = useRecords({ from: ds.lagerorte, select: lagerortListe, count: PAGE_SIZE });
  const galerieQuery = useRecords({ from: ds.partner, select: partnerListe, count: PAGE_SIZE });
  const modellQuery = useRecords({ from: ds.modelle, select: modellListe, count: PAGE_SIZE });
  useAllPages(kuenstlerQuery);
  useAllPages(glasurQuery);
  useAllPages(lagerortQuery);
  useAllPages(galerieQuery);
  useAllPages(modellQuery);
  const kuenstlerOptions = activeOptions(kuenstlerQuery.data);
  const glasurOptions = activeOptions(glasurQuery.data);
  const lagerortOptions = activeOptions(lagerortQuery.data);
  const galerieOptions = activeOptions(galerieQuery.data);
  // Modelle aus dem Katalog: Nummer vor dem Namen, sortiert nach Artikelnummer.
  const modelle = useMemo(
    () =>
      ((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[])
        .filter((i) => i.fields.archiviert !== true || i.id === edition.modell)
        .map((i) => ({
          id: i.id,
          nr: str(i.fields.artikelnr),
          name: str(i.fields.name),
          label: modellLabel(str(i.fields.artikelnr), str(i.fields.name)),
          programm: asOpts(i.fields.programm)[0]?.label ?? "",
          glasuren: asOpts(i.fields.glasuren).map((g) => g.id),
          masse: str(i.fields.masse),
        }))
        .sort((a, b) => compareNr(a.nr, b.nr) || a.name.localeCompare(b.name, "de")),
    [modellQuery.data, edition.modell],
  );
  // Nur die Modelle der gewählten Serie. Modelle ohne Programm zählen zur Edition.
  const istGeschirr = (m: { programm: string }) => m.programm === MANUFAKTUR_PROGRAMM;
  const serienModelle = modelle.filter((m) => (art === "geschirr" ? istGeschirr(m) : !istGeschirr(m)));
  const gewaehltesModell = serienModelle.find((m) => m.id === edition.modell);
  // Glasuren des Modells als Knöpfe. Jede andere Glasur lässt sich wählen oder neu anlegen.
  const modellGlasuren = gewaehltesModell?.glasuren.length ? glasurOptions.filter((g) => gewaehltesModell.glasuren.includes(g.id)) : [];
  const [extraTypen, setExtraTypen] = useState<Opt[]>([]);
  const typChoices = [...typOptions, ...extraTypen.filter((t) => !typOptions.some((o) => o.label === t.label))];
  const createGlasur = useRecordCreate({ from: ds.glasuren, fields: glasurNeu });
  const createPerson = useRecordCreate({ from: ds.kuenstler, fields: personNeu });

  function addTyp(name: string): boolean {
    setExtraTypen((t) => [...t, { id: `neu-${name}`, label: name }]);
    setUnikat((s) => ({ ...s, typ: name }));
    return true;
  }

  async function addGlasur(name: string): Promise<string | null> {
    const vorhanden = glasurOptions.find((g) => g.label.toLowerCase() === name.toLowerCase());
    if (vorhanden) return vorhanden.id;
    try {
      const created = await createGlasur.mutateAsync({ name } as never);
      await glasurQuery.refetch();
      toast.success(`Glasur „${name}“ angelegt.`);
      return (created as { id: string }).id;
    } catch {
      toast.error("Glasur konnte nicht angelegt werden.");
      return null;
    }
  }

  // Neue Person (gedreht oder glasiert von) anlegen und direkt im jeweiligen Feld auswählen.
  const addPerson = (waehlen: (id: string) => void) => async (name: string): Promise<boolean> => {
    try {
      const created = await createPerson.mutateAsync({ name } as never);
      await kuenstlerQuery.refetch();
      waehlen((created as { id: string }).id);
      toast.success(`„${name}“ angelegt.`);
      return true;
    } catch {
      toast.error("Konnte nicht angelegt werden.");
      return false;
    }
  };

  // Alle Editionszeilen laden: Nur so findet die Prüfung „Gibt es diese Kombination schon?“
  // jede Zeile und legt keine doppelte an.
  const editionQuery = useRecords({ from: ds.edition, select: editionFields, count: PAGE_SIZE });
  useAllPages(editionQuery);
  const editionReady = editionQuery.status === "success" && !editionQuery.hasNextPage;
  const editionRows = editionQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const isGlasiert = edition.zustand === GLASIERT;
  const wantGlasur = isGlasiert ? edition.glasur : "";
  // Brand, Reservierung, Status und „glasiert von“ gibt es erst bei glasierter Ware.
  const status = isGlasiert && edition.status !== IM_HAUS ? edition.status : "";
  const postenKey: PostenKey = {
    modellId: edition.modell,
    zustand: edition.zustand,
    glasurId: wantGlasur,
    brand: isGlasiert ? edition.brand : "",
    reserviert: isGlasiert ? edition.reserviert.trim() : "",
    status,
    partnerId: status ? edition.partner : "",
    gedrehtId: edition.gedreht,
    glasiertId: isGlasiert ? edition.glasiert : "",
  };
  // Gleicher Posten wird weitergezählt statt doppelt angelegt.
  const findRow = (rows: { id: string; fields: unknown }[]) => (edition.modell ? rows.find((r) => gleicherPosten(toPosten(r as RawItem), postenKey)) : undefined);
  const kunden = [...new Set<string>(editionRows.map((r) => toPosten(r as RawItem).reserviert).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const existingRow = findRow(editionRows);
  const existingCount = Number((existingRow?.fields as { anzahl?: number } | undefined)?.anzahl ?? 0);

  const clearError = (key: string) =>
    setErrors((e) => {
      if (!(key in e)) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  const setU = <K extends keyof UnikatForm>(key: K, value: UnikatForm[K]) => {
    setUnikat((s) => ({ ...s, [key]: value }));
    clearError(key);
  };
  const setE = <K extends keyof EditionForm>(key: K, value: EditionForm[K]) => {
    setEdition((s) => ({ ...s, [key]: value }));
    clearError(key);
  };
  // Beim Modellwechsel Glasur und Maße aus dem Modell übernehmen: eine Glasur ist vorgewählt, sonst leer.
  function chooseModell(id: string) {
    const m = modelle.find((x) => x.id === id);
    const fest = m && m.glasuren.length === 1 ? m.glasuren[0] : "";
    setEdition((s) => ({ ...s, modell: id, glasur: fest, masse: m?.masse ?? "" }));
    clearError("modell");
    clearError("glasur");
  }
  const changeFiles = (next: File[]) => {
    setFiles(next);
    clearError("fotos");
  };

  const canCreate = isMenge ? createEdition.enabled : createUnikat.enabled;

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (art === "unikat") {
      if (!unikat.name.trim()) e.name = "Bitte einen Namen eingeben.";
      if (!unikat.status) e.status = "Bitte einen Status wählen.";
      const preis = parseNumber(unikat.preis);
      if (unikat.preis.trim() && (preis === null || preis < 0)) e.preis = "Bitte einen Betrag in Euro eingeben, z. B. 1.200.";
    } else {
      if (!edition.modell) e.modell = "Bitte ein Modell wählen.";
      if (!edition.zustand) e.zustand = "Bitte den Zustand wählen.";
      if (isGlasiert && !edition.glasur) e.glasur = "Bitte die Glasur wählen.";
      if (!(edition.anzahl > 0)) e.anzahl = "Die Anzahl muss mindestens 1 sein.";
    }
    return e;
  }

  async function uploadFiles(): Promise<{ filename: string; url: string }[]> {
    if (files.length === 0) return [];
    const results = await uploadAsync(files);
    const failed = results.filter((r) => r.status !== "completed");
    if (failed.length > 0) throw new Error("Foto konnte nicht hochgeladen werden. Bitte erneut versuchen.");
    return results.map((r) => ({ filename: r.file.name, url: r.url as string }));
  }

  // Empfohlene Angaben, die beim Unikat noch fehlen. Speichern geht trotzdem, nach einer Rückfrage.
  const fehlendEmpfohlen = !isMenge ? [files.length === 0 ? "Foto" : "", unikat.typ ? "" : "Typ"].filter(Boolean) : [];

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector('[data-error="true"]');
        (first?.parentElement ?? first)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (isMenge && !editionReady) {
      toast.error("Der Editionsbestand lädt noch. Bitte gleich noch einmal speichern.");
      return;
    }
    if (fehlendEmpfohlen.length > 0) {
      setRueckfrage(true);
      return;
    }
    await speichern();
  }

  async function speichern() {
    setRueckfrage(false);
    setBusy(true);
    try {
      const fotos = await uploadFiles();
      if (art === "unikat") {
        const preis = parseNumber(unikat.preis) ?? undefined;
        // Ohne Angabe gilt der Tag der Erfassung. Das Jahr folgt immer dem Datum.
        const datum = unikat.datum || today();
        const created = await createUnikat.mutateAsync({
          name: unikat.name.trim(),
          typ: unikat.typ,
          status: unikat.status,
          gedreht: link(unikat.gedreht),
          glasiert: link(unikat.glasiert),
          datum,
          jahr: Number(datum.slice(0, 4)),
          gedrehtAm: unikat.gedrehtAm || undefined,
          glasiertAm: unikat.glasiertAm || undefined,
          glasur: unikat.glasur,
          masse: unikat.masse.trim(),
          fotos,
          bildnachweis: unikat.bildnachweis.trim(),
          lagerort: link(unikat.lagerort),
          galerie: isAusserHaus(unikat.status) ? link(unikat.galerie) : [],
          preis,
          website: unikat.website,
          notiz: unikat.notiz.trim(),
          erfasstVon: user?.fullName || user?.email || "",
        } as never);
        setSaved({ art, recordId: (created as { id: string }).id, text: `Unikat „${unikat.name.trim()}“ ist im Bestand.` });
      } else {
        const modell = gewaehltesModell?.label ?? "";
        const glasur = glasurOptions.find((g) => g.id === wantGlasur)?.label;
        const partner = galerieOptions.find((g) => g.id === postenKey.partnerId)?.label ?? "";
        const variante = bezeichnung(modell, { zustand: edition.zustand, glasur: glasur ?? "", brand: postenKey.brand, reserviert: postenKey.reserviert, status, partner });
        // Direkt vor dem Speichern frisch laden: Hat jemand anderes die Zeile gerade angelegt oder geändert,
        // wird dort weitergezählt statt eine doppelte Zeile anzulegen oder Stück zu verlieren.
        const fresh = await freshItems(editionQuery);
        if (!fresh) throw new Error("Der Bestand konnte nicht geladen werden. Bitte erneut speichern.");
        const row = findRow(fresh);
        if (row) {
          const neu = Number((row.fields as { anzahl?: number }).anzahl ?? 0) + edition.anzahl;
          await updateEdition.mutateAsync({ recordId: row.id, fields: { anzahl: neu } } as never);
          setSaved({ art, recordId: row.id, text: `${variante}: jetzt ${neu} Stück.` });
        } else {
          const created = await createEdition.mutateAsync({
            bezeichnung: variante,
            modell: link(edition.modell),
            glasur: link(wantGlasur || undefined),
            zustand: edition.zustand,
            anzahl: edition.anzahl,
            brand: postenKey.brand || null,
            reserviert: postenKey.reserviert,
            status: status || null,
            partner: link(postenKey.partnerId || undefined),
            gedreht: link(postenKey.gedrehtId || undefined),
            glasiert: link(postenKey.glasiertId || undefined),
            masse: edition.masse.trim(),
            lagerort: link(edition.lagerort),
            foto: fotos,
            notiz: edition.notiz.trim(),
          } as never);
          setSaved({ art, recordId: (created as { id: string }).id, text: `${variante}: ${edition.anzahl} Stück angelegt.` });
        }
        await editionQuery.refetch();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSaved(null);
    setEinzelDaten(false);
    setMehrOffen(false);
    setErrors({});
    setFiles([]);
    setUnikat(emptyUnikat());
    setEdition(emptyEdition());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={SEITE_CLASS}>
      <div className="content">
        <div className="mb-5">
          <PageHeader title="Neues Stück erfassen" description="Nur Felder mit * sind Pflicht. Alles andere kann später ergänzt werden." />
        </div>

        {saved ? (
          <SuccessCard saved={saved} onNext={reset} />
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
            <Tabs
              label="Art des Stücks"
              tabs={ART_TABS}
              value={art}
              onChange={(key) => {
                if (key !== art) setEdition((s) => ({ ...s, modell: "", glasur: "", masse: "" }));
                setArt(key);
                setErrors({});
                setFiles((f) => (key === "unikat" ? f : f.slice(0, 1)));
              }}
            />

            {art === "unikat" ? (
              <div className={COLUMNS}>
                <div className="space-y-6">
                  <SectionTitle title="Das Stück" hint="Nur der Name ist Pflicht." />
                  <div>
                    <FieldLabel htmlFor="foto-input" empfohlen>
                      Fotos
                    </FieldLabel>
                    <PhotoPicker files={files} onChange={changeFiles} multiple />
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-name" required>
                      Name
                    </FieldLabel>
                    <Feld
                      id="u-name"
                      value={unikat.name}
                      onChange={(e) => setU("name", e.target.value)}
                      placeholder="z. B. Mondvase „Seladon“"
                      aria-invalid={!!errors.name}
                    />
                    <ErrorText>{errors.name}</ErrorText>
                  </div>

                  <div>
                    <FieldLabel empfohlen>Typ</FieldLabel>
                    <ChoiceChips label="Typ" options={typChoices} value={unikat.typ} onChange={(v) => setU("typ", v)} />
                    <div className="mt-2">
                      <AddNew label="Neuer Typ" placeholder="z. B. Krug" existing={typChoices} onAdd={addTyp} />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <ChoiceChips
                      label="Status"
                      options={statusOptions}
                      value={unikat.status}
                      onChange={(v) => {
                        setU("status", v);
                        const ort = lagerortOptions.find((l) => l.label === AUSSER_HAUS_ORT)?.id;
                        if (isAusserHaus(v) && ort) setU("lagerort", ort);
                        else if (unikat.lagerort === ort) setU("lagerort", "");
                      }}
                      statusColors
                    />
                    <ErrorText>{errors.status}</ErrorText>
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-lagerort">Lagerort</FieldLabel>
                    <OptionSelect id="u-lagerort" value={unikat.lagerort} onChange={(v) => setU("lagerort", v)} options={lagerortOptions} placeholder="Bitte wählen" />
                  </div>

                  {isAusserHaus(unikat.status) && (
                    <div>
                      <FieldLabel htmlFor="u-galerie">Partner (Galerie, Museum …)</FieldLabel>
                      <OptionSelect id="u-galerie" value={unikat.galerie} onChange={(v) => setU("galerie", v)} options={galerieOptions} placeholder="Partner wählen" />
                    </div>
                  )}
                </div>

                <ZweiteSpalte title="Herstellung" hint="Wer hat das Stück gemacht und wann.">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel htmlFor="u-gedreht">Gedreht von</FieldLabel>
                      <OptionSelect id="u-gedreht" value={unikat.gedreht} onChange={(v) => setU("gedreht", v)} options={kuenstlerOptions} placeholder="Bitte wählen" />
                      <div className="mt-2">
                        <AddNew label="Neue Person" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addPerson((id) => setU("gedreht", id))} />
                      </div>
                    </div>
                    <div>
                      <FieldLabel htmlFor="u-glasiert">Glasiert von</FieldLabel>
                      <OptionSelect id="u-glasiert" value={unikat.glasiert} onChange={(v) => setU("glasiert", v)} options={kuenstlerOptions} placeholder="Bitte wählen" />
                      <div className="mt-2">
                        <AddNew label="Neue Person" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addPerson((id) => setU("glasiert", id))} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-datum">Datum</FieldLabel>
                    <Feld id="u-datum" type="date" value={unikat.datum} onChange={(e) => setU("datum", e.target.value)} />
                    <Hint>Vorbelegt mit heute. Leer gelassen gilt der Tag der Erfassung.</Hint>
                    {einzelDaten || unikat.gedrehtAm || unikat.glasiertAm ? (
                      <div className="grid sm:grid-cols-2 gap-6 mt-4">
                        <div>
                          <FieldLabel htmlFor="u-gedreht-am">Gedreht am</FieldLabel>
                          <Feld id="u-gedreht-am" type="date" value={unikat.gedrehtAm} onChange={(e) => setU("gedrehtAm", e.target.value)} />
                        </div>
                        <div>
                          <FieldLabel htmlFor="u-glasiert-am">Glasiert am</FieldLabel>
                          <Feld id="u-glasiert-am" type="date" value={unikat.glasiertAm} onChange={(e) => setU("glasiertAm", e.target.value)} />
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
                    <SearchPick label="Glasuren" createNoun="neue Glasur" options={glasurOptions} value={unikat.glasur} onChange={(ids) => setU("glasur", ids)} multiple onCreate={addGlasur} />
                    <Hint>Mehrere möglich. Fehlt eine Glasur, den Namen ins Suchfeld schreiben und anlegen.</Hint>
                  </div>

                  <div className="pt-2">
                    <SectionTitle title="Details" hint="Kann auch später im Bestand ergänzt werden." />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel htmlFor="u-masse">Maße</FieldLabel>
                      <Feld id="u-masse" value={unikat.masse} onChange={(e) => setU("masse", e.target.value)} placeholder="z. B. Ø 24 × H 8 cm" />
                    </div>
                    <div>
                      <FieldLabel htmlFor="u-bildnachweis">Bildnachweis</FieldLabel>
                      <Feld id="u-bildnachweis" value={unikat.bildnachweis} onChange={(e) => setU("bildnachweis", e.target.value)} placeholder="z. B. Foto: Name der Fotografin" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel htmlFor="u-preis">Preis intern (€)</FieldLabel>
                      <Feld id="u-preis" inputMode="decimal" value={unikat.preis} onChange={(e) => setU("preis", e.target.value)} placeholder="z. B. 480" aria-invalid={!!errors.preis} />
                      <Hint>Nur intern, erscheint nie auf der Website.</Hint>
                      <ErrorText>{errors.preis}</ErrorText>
                    </div>
                    <SchalterFeld
                      id="u-website"
                      label="Auf Website zeigen"
                      hint="Nur für die spätere Website-Anbindung."
                      checked={unikat.website}
                      onChange={(v) => setU("website", v)}
                      lage="self-start sm:mt-8"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-notiz">Notiz</FieldLabel>
                    <Textfeld id="u-notiz" value={unikat.notiz} onChange={(e) => setU("notiz", e.target.value)} rows={3} />
                  </div>
                </ZweiteSpalte>
              </div>
            ) : (
              <div className={COLUMNS}>
                <div className="space-y-6">
                  <SectionTitle title="Pflichtangaben" hint="Modell, Zustand und Anzahl. Glasierte Ware zusätzlich mit Glasur." />
                  <div>
                    <FieldLabel htmlFor="e-modell" required>
                      Modell
                    </FieldLabel>
                    <OptionSelect id="e-modell" value={edition.modell} onChange={chooseModell} options={serienModelle} placeholder={art === "geschirr" ? "Geschirr wählen (Nummer oder Name)" : "Edition wählen (Nummer oder Name)"} />
                    <Hint>Neue Modelle unter „Stammdaten“ anlegen.</Hint>
                    <ErrorText>{errors.modell}</ErrorText>
                  </div>

                  {edition.modell && (
                    <div>
                      <FieldLabel htmlFor="e-masse">Maße</FieldLabel>
                      <Feld id="e-masse" value={edition.masse} onChange={(e) => setE("masse", e.target.value)} placeholder="z. B. Ø 24 × H 3 cm" />
                      <Hint>Aus dem Modell übernommen. Bitte nachmessen und bei Bedarf ändern.</Hint>
                    </div>
                  )}

                  <div>
                    <FieldLabel required>Zustand</FieldLabel>
                    <ChoiceChips
                      label="Zustand"
                      options={zustandOptions}
                      value={edition.zustand}
                      onChange={(v) => setE("zustand", v)}
                    />
                    <ErrorText>{errors.zustand}</ErrorText>
                  </div>

                  {isGlasiert && edition.modell && (
                    <div>
                      <FieldLabel required>Glasur</FieldLabel>
                      <GlasurWahl modell={modellGlasuren} alle={glasurOptions} value={edition.glasur} onChange={(id) => setE("glasur", id)} onCreate={addGlasur} />
                      <ErrorText>{errors.glasur}</ErrorText>
                    </div>
                  )}

                  {isGlasiert && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <FieldLabel htmlFor="e-brand">Brand vom</FieldLabel>
                        <Feld id="e-brand" type="date" value={edition.brand} onChange={(e) => setE("brand", e.target.value)} />
                        <Hint>Stücke aus einem Brand haben denselben Farbton.</Hint>
                      </div>
                      <div>
                        <FieldLabel htmlFor="e-reserviert">Reserviert für</FieldLabel>
                        <TextMitVorschlag id="e-reserviert" value={edition.reserviert} onChange={(v) => setE("reserviert", v)} vorschlaege={kunden} placeholder="Kunde oder Auftrag (freiwillig)" />
                      </div>
                    </div>
                  )}

                  <div>
                    <FieldLabel htmlFor="e-anzahl" required>
                      Anzahl
                    </FieldLabel>
                    <Stueckzahl id="e-anzahl" value={edition.anzahl} min={1} onChange={(n) => setE("anzahl", n)} />
                    <ErrorText>{errors.anzahl}</ErrorText>
                    {existingRow && (
                      <p className="mt-3 rounded-md bg-muted p-3 text-base">
                        Diese Kombination gibt es schon mit <strong>{existingCount} Stück</strong>. Beim Speichern wird
                        die Anzahl dort auf <strong>{existingCount + edition.anzahl}</strong> erhöht. Maße, Lagerort, Foto und Notiz bleiben wie dort.
                      </p>
                    )}
                  </div>
                </div>

                {/* Edition: weitere Angaben offen, weil jedes Stück anders ist. Geschirr: auf Wunsch aufklappen. */}
                {art === "edition" || mehrOffen ? (
                  <ZweiteSpalte title="Weitere Angaben" hint="Freiwillig. Kann auch später im Bestand ergänzt werden.">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <FieldLabel htmlFor="e-gedreht">Gedreht von</FieldLabel>
                        <OptionSelect id="e-gedreht" value={edition.gedreht} onChange={(v) => setE("gedreht", v)} options={kuenstlerOptions} placeholder="Bitte wählen" />
                        <div className="mt-2">
                          <AddNew label="Neue Person" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addPerson((id) => setE("gedreht", id))} />
                        </div>
                      </div>
                      {isGlasiert && (
                        <div>
                          <FieldLabel htmlFor="e-glasiert">Glasiert von</FieldLabel>
                          <OptionSelect id="e-glasiert" value={edition.glasiert} onChange={(v) => setE("glasiert", v)} options={kuenstlerOptions} placeholder="Bitte wählen" />
                          <div className="mt-2">
                            <AddNew label="Neue Person" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addPerson((id) => setE("glasiert", id))} />
                          </div>
                        </div>
                      )}
                    </div>
                    {isGlasiert && (
                      <div>
                        <FieldLabel>Status</FieldLabel>
                        <ChoiceChips
                          label="Status"
                          options={EDITION_STATUS}
                          value={edition.status}
                          onChange={(v) => {
                            setE("status", v);
                            const ort = lagerortOptions.find((l) => l.label === AUSSER_HAUS_ORT)?.id;
                            if (v !== IM_HAUS && ort) setE("lagerort", ort);
                            else if (edition.lagerort === ort) setE("lagerort", "");
                          }}
                          statusColors
                        />
                        {status && (
                          <div className="mt-4">
                            <FieldLabel htmlFor="e-partner">Partner (Galerie, Museum …)</FieldLabel>
                            <OptionSelect id="e-partner" value={edition.partner} onChange={(v) => setE("partner", v)} options={galerieOptions} placeholder="Partner wählen" />
                          </div>
                        )}
                      </div>
                    )}
                    {!existingRow && (
                      <>
                        <div>
                          <FieldLabel htmlFor="e-lagerort">Lagerort</FieldLabel>
                          <OptionSelect id="e-lagerort" value={edition.lagerort} onChange={(v) => setE("lagerort", v)} options={lagerortOptions} placeholder="Bitte wählen" />
                        </div>
                        <div>
                          <FieldLabel htmlFor="foto-input">Foto</FieldLabel>
                          <PhotoPicker files={files} onChange={changeFiles} multiple={false} />
                        </div>
                        <div>
                          <FieldLabel htmlFor="e-notiz">Notiz</FieldLabel>
                          <Textfeld id="e-notiz" value={edition.notiz} onChange={(e) => setE("notiz", e.target.value)} rows={3} />
                        </div>
                      </>
                    )}
                  </ZweiteSpalte>
                ) : (
                  <div className={SECOND_COLUMN}>
                    <ZusatzKnopf label="Weitere Angaben zeigen" onClick={() => setMehrOffen(true)} />
                  </div>
                )}
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <p role="alert" className="text-base text-destructive">
                Bitte noch ausfüllen: {Object.keys(errors).map((k) => FIELD_NAMES[k] ?? k).join(", ")}
              </p>
            )}
            {canCreate ? (
              // Am Handy klebt Speichern unten, damit es nach den Pflichtangaben ohne Scrollen erreichbar ist.
              <div className={`sticky ${STICKY_BOTTOM} z-10 sm:static`}>
                <Knopf type="submit" size="lg" className="w-full h-14 rounded-md text-lg shadow-lg sm:shadow-none" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> Wird gespeichert …
                    </>
                  ) : existingRow && isMenge ? (
                    "Anzahl erhöhen"
                  ) : (
                    "Speichern"
                  )}
                </Knopf>
              </div>
            ) : (
              <p className="text-base text-muted-foreground">Du hast keine Berechtigung, Stücke zu erfassen.</p>
            )}
            <Rueckfrage
              offen={rueckfrage}
              titel={`${fehlendEmpfohlen.join(" und ")} ${fehlendEmpfohlen.length > 1 ? "fehlen" : "fehlt"} noch`}
              text="Trotzdem speichern? Du kannst alles jederzeit im Bestand nachtragen."
              bestaetigen="Trotzdem speichern"
              abbrechen="Noch ergänzen"
              onBestaetigen={speichern}
              onAbbrechen={() => setRueckfrage(false)}
            />
          </form>
        )}
      </div>
    </div>
  );
}

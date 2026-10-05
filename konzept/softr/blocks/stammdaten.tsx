// Generiert von konzept/softr/build.mjs aus src/blocks/stammdaten.tsx und src/shared/. Nicht von Hand ändern.
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { datasource, q, useFieldOptions, useRecordCreate, useRecordDelete, useRecords, useRecordUpdate, useUpload } from "@/lib/datasource";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Archive, ArchiveRestore, Camera, Check, ChevronDown, ChevronRight, ImageOff, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 100;
const VERFUEGBAR = "verfügbar";
const RESERVIERT = "reserviert";
const VERKAUFT = "verkauft";
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const MANUFAKTUR_PROGRAMM = "Manufakturprogramm";
const GESCHIRR = "Geschirr";

function serieVon(programm: string): string {
  return programm === MANUFAKTUR_PROGRAMM ? GESCHIRR : programm;
}

const AUSSER_HAUS_ORT = "Außer Haus";
type Opt = { id: string; label: string };
type Attachment = { id?: string; url: string; filename?: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };
type ThumbSize = "small" | "medium" | "large";
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

const ds = datasource.define({
  kuenstler: "kuenstler",
  glasuren: "glasuren",
  modelle: "modelle",
  partner: "partner",
  lagerorte: "lagerorte",
  unikate: "unikate",
  edition: "edition",
  ansichten: "ansichten",
});
const ansichtZaehler = q.select({ name: "8s5KL" });
// Grenze im Free-Plan von Softr (Einträge je Datenbank, vorsichtig angesetzt). Bei Planwechsel anpassen.
const DATENSATZ_GRENZE = 1000;
const GRENZE_WARNUNG = 0.8;

const kuenstlerSelect = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const glasurSelect = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const modellSelect = q.select({ name: "eXo5w", artikelnr: "BNpSN", programm: "Mrgtb", nameEn: "CyPYU", typ: "gCX7K", masse: "h65qx", vk: "772dM", glasuren: "EazCZ", foto: "GbUfa", archiviert: "3tlrw" });
const partnerSelect = q.select({ name: "a4yfc", art: "ZS9HU", ort: "RQRec", kontakt: "lnhez", zusammenarbeit: "uEfkz", notiz: "8pLh8", archiviert: "24Tn9" });
const lagerortSelect = q.select({ name: "AoOjs", bereich: "5h1mS", archiviert: "kMBsy" });
const unikatLinks = q.select({ kuenstler: "oDNBh", gedreht: "90TmC", glasiert: "2PXtk", glasur: "ByeH3", lagerort: "EkVC3", galerie: "NfsXv" });
// Felder, in denen ein Unikat bzw. ein Editionsposten auf eine Person (Tabelle Künstler:innen) verweist.
// „kuenstler“ wird nicht mehr erfasst, alte Einträge zählen aber noch als Verwendung.
const PERSONEN_FELDER = ["kuenstler", "gedreht", "glasiert"];
const PERSONEN_FELDER_EDITION = ["gedreht", "glasiert"];
const editionLinks = q.select({ modell: "jxN6x", glasur: "pbGEk", lagerort: "T5iQe", partner: "hs3iV", gedreht: "7FQQm", glasiert: "dkREk" });

const SEARCH_FROM = 10;

type KatKey = "kuenstler" | "glasuren" | "modelle" | "partner" | "lagerorte";
type FieldDef = { key: string; label: string; kind: "text" | "textarea" | "chips" | "price" | "multi"; required?: boolean; placeholder?: string; options?: Opt[] };
type Entry = { id: string; name: string; values: Record<string, string>; fotos: Attachment[]; sub: string; archiviert: boolean };
type Values = Record<string, string>;
type Kategorie = {
  key: KatKey;
  label: string;
  singular: string;
  hint: string;
  fields: FieldDef[];
  foto?: boolean;
  entries: Entry[];
  usage: (id: string) => string;
  usageCount: (id: string) => number;
  // Eigene Regel für Doppelte (z. B. Artikelnummer) und Sortierung. Ohne Angabe: Name.
  duplicateOf?: (values: Values, selfId: string | undefined) => string | undefined;
  sortKey?: (e: Entry) => string;
  locked?: (e: Entry) => string | undefined;
  save: (id: string | null, values: Values, fotos: Attachment[] | undefined) => Promise<void>;
  archive: (id: string, archiviert: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

function toEntry(item: RawItem, keys: string[], sub: (v: Values) => string, fotoKey?: string): Entry {
  const f = item.fields;
  const values: Values = {};
  keys.forEach((k) => (values[k] = asOpts(f[k]).length ? firstLabel(f[k]) : typeof f[k] === "number" ? zahl.format(f[k] as number) : str(f[k])));
  return { id: item.id, name: values.name ?? "", values, fotos: fotoKey ? asAttachments(f[fotoKey]) : [], sub: sub(values), archiviert: f.archiviert === true };
}

// Dezenter Hinweis für den Admin: wie voll die Datenbank im Free-Plan ist.
function Speicherstand({ eintraege }: { eintraege: number }) {
  const anteil = eintraege / DATENSATZ_GRENZE;
  const knapp = anteil >= GRENZE_WARNUNG;
  return (
    <div className="pt-6 flex items-center gap-3 text-sm text-muted-foreground" title="Alle Einträge der Datenbank: Stücke, Editionsware, Stammdaten und gespeicherte Ansichten">
      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden" aria-hidden>
        <div className={`h-full ${knapp ? "bg-amber-500" : "bg-muted-foreground/40"}`} style={{ width: `${Math.min(100, Math.round(anteil * 100))}%` }} />
      </div>
      <span className={knapp ? "text-amber-800" : ""}>
        Datenbank: {zahl.format(eintraege)} von {zahl.format(DATENSATZ_GRENZE)} Einträgen (Free-Plan)
        {knapp && " – bald voll, Plan prüfen"}
      </span>
    </div>
  );
}

function countLinks(items: RawItem[], keys: string[]): Map<string, number> {
  const map = new Map<string, number>();
  items.forEach((i) => keys.forEach((k) => asOpts(i.fields[k]).forEach((o) => map.set(`${k}:${o.id}`, (map.get(`${k}:${o.id}`) ?? 0) + 1))));
  return map;
}

function EntryDialog({ kat, entry, onClose }: { kat: Kategorie; entry: Entry | null; onClose: () => void }) {
  const [values, setValues] = useState<Values>(() => Object.fromEntries(kat.fields.map((f) => [f.key, entry?.values[f.key] ?? ""])));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<{ key: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { uploadAsync } = useUpload();
  const lockedReason = entry ? kat.locked?.(entry) : undefined;
  const inUse = entry ? kat.usageCount(entry.id) : 0;

  async function act(job: () => Promise<void>, message: string) {
    setBusy(true);
    try {
      await job();
      toast.success(message);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Das hat nicht geklappt. Bitte erneut versuchen.");
      setBusy(false);
    }
  }
  const name = (values.name ?? "").trim();
  const sameName = kat.entries.find((e) => e.id !== entry?.id && e.name.trim().toLowerCase() === name.toLowerCase());
  const duplicateText = kat.duplicateOf ? kat.duplicateOf({ ...values, name }, entry?.id) : sameName && `„${sameName.name}“ gibt es schon.`;

  async function save() {
    if (!name) {
      setError({ key: "name", text: "Bitte einen Namen eingeben." });
      return;
    }
    if (duplicateText) {
      setError({ key: kat.duplicateOf ? "artikelnr" : "name", text: duplicateText });
      return;
    }
    const badNumber = kat.fields.find((f) => f.kind === "price" && values[f.key].trim() && parseNumber(values[f.key]) === null);
    if (badNumber) {
      setError({ key: badNumber.key, text: "Bitte eine Zahl eingeben, z. B. 400 oder 12,50." });
      return;
    }
    setBusy(true);
    try {
      let fotos: Attachment[] | undefined;
      if (files.length) {
        const results = await uploadAsync(files);
        if (results.some((r) => r.status !== "completed")) throw new Error("Foto konnte nicht hochgeladen werden.");
        fotos = results.map((r) => ({ url: r.url as string, filename: r.file.name }));
      }
      await kat.save(entry?.id ?? null, { ...values, name }, fotos);
      toast.success(entry ? `„${name}“ gespeichert.` : `„${name}“ angelegt.`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-xl`}>
        <PanelHeader title={entry ? entry.name : `${kat.singular} anlegen`} description={entry ? `${kat.singular} · ${kat.usage(entry.id)}` : kat.hint} />
        <div className="pb-2 space-y-5" lang="de">
          {kat.fields.map((f) => (
            <div key={f.key}>
              <FieldLabel htmlFor={`f-${f.key}`} required={f.required}>
                {f.label}
              </FieldLabel>
              {f.kind === "chips" ? (
                <ChoiceChips label={f.label} options={f.options ?? []} value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: s[f.key] === v ? "" : v }))} />
              ) : f.kind === "multi" ? (
                <SearchPick
                  label={f.label}
                  createNoun={f.label}
                  options={f.options ?? []}
                  value={values[f.key].split(",").filter(Boolean)}
                  onChange={(ids) => setValues((s) => ({ ...s, [f.key]: ids.join(",") }))}
                  multiple
                />
              ) : f.kind === "textarea" ? (
                <Textfeld id={`f-${f.key}`} rows={3} value={values[f.key]} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))} />
              ) : (
                <Feld
                  id={`f-${f.key}`}
                  value={values[f.key]}
                  inputMode={f.kind === "price" ? "decimal" : undefined}
                  aria-invalid={error?.key === f.key}
                  disabled={f.key === "name" && !!lockedReason}
                  placeholder={f.placeholder}
                  onChange={(e) => {
                    setValues((s) => ({ ...s, [f.key]: e.target.value }));
                    setError(null);
                  }}
                />
              )}
              {f.key === "name" && lockedReason && <Hint>{lockedReason}</Hint>}
              {error?.key === f.key && <ErrorText>{error.text}</ErrorText>}
            </div>
          ))}
          {kat.foto && (
            <div>
              <FieldLabel htmlFor="foto-input">{entry?.fotos.length ? "Foto ersetzen" : "Foto"}</FieldLabel>
              {entry?.fotos[0] && files.length === 0 && <img src={entry.fotos[0].url} alt={entry.name} className="w-full max-h-48 object-contain rounded-lg bg-muted mb-3" />}
              <PhotoPicker files={files} onChange={setFiles} multiple={false} />
            </div>
          )}
          <div className="flex gap-3">
            <Knopf variant="outline" className="h-12 flex-1 text-base" disabled={busy} onClick={onClose}>
              Abbrechen
            </Knopf>
            <Knopf className="h-12 flex-1 text-base" disabled={busy || !name} onClick={save}>
              {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : <Check className="w-5 h-5 mr-2" aria-hidden />}
              {entry ? "Speichern" : "Anlegen"}
            </Knopf>
          </div>
          {entry && !lockedReason && (
            <section className="border-t pt-5 space-y-3" aria-label="Archivieren und Löschen">
              {entry.archiviert ? (
                <p className="text-sm text-muted-foreground">Archiviert: erscheint nicht in den Auswahllisten. Bestehende Stücke behalten die Angabe.</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {inUse > 0
                    ? `Wird noch verwendet (${kat.usage(entry.id)}). Löschen geht erst, wenn nichts mehr darauf verweist. Archivieren blendet den Eintrag in den Auswahllisten aus.`
                    : "Wird nirgends verwendet und kann gelöscht werden. Archivieren blendet ihn nur in den Auswahllisten aus."}
                </p>
              )}
              {confirmDelete ? (
                <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-3">
                  <p className="text-base">„{entry.name}“ endgültig löschen? Das lässt sich nicht rückgängig machen.</p>
                  <div className="flex flex-wrap gap-3">
                    <Knopf variant="destructive" className="h-11 text-base" disabled={busy} onClick={() => act(() => kat.remove(entry.id), `„${entry.name}“ gelöscht.`)}>
                      Endgültig löschen
                    </Knopf>
                    <Knopf variant="ghost" className="h-11 text-base" disabled={busy} onClick={() => setConfirmDelete(false)}>
                      Abbrechen
                    </Knopf>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Knopf
                    variant="outline"
                    className="h-11 text-base"
                    disabled={busy}
                    onClick={() => act(() => kat.archive(entry.id, !entry.archiviert), entry.archiviert ? `„${entry.name}“ wiederhergestellt.` : `„${entry.name}“ archiviert.`)}
                  >
                    {entry.archiviert ? <ArchiveRestore className="w-5 h-5 mr-2" aria-hidden /> : <Archive className="w-5 h-5 mr-2" aria-hidden />}
                    {entry.archiviert ? "Wiederherstellen" : "Archivieren"}
                  </Knopf>
                  {inUse === 0 && (
                    <Knopf variant="ghost" className="h-11 text-base text-destructive hover:text-destructive" disabled={busy} onClick={() => setConfirmDelete(true)}>
                      <Trash2 className="w-5 h-5 mr-2" aria-hidden /> Löschen
                    </Knopf>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Block() {
  const [tab, setTab] = useState<KatKey>(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    return (["kuenstler", "glasuren", "modelle", "partner", "lagerorte"] as string[]).includes(t ?? "") ? (t as KatKey) : "kuenstler";
  });
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [dialog, setDialog] = useState<{ entry: Entry | null } | null>(null);

  const kuenstlerQuery = useRecords({ from: ds.kuenstler, select: kuenstlerSelect, count: PAGE_SIZE });
  const glasurQuery = useRecords({ from: ds.glasuren, select: glasurSelect, count: PAGE_SIZE });
  const modellQuery = useRecords({ from: ds.modelle, select: modellSelect, count: PAGE_SIZE });
  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  const lagerortQuery = useRecords({ from: ds.lagerorte, select: lagerortSelect, count: PAGE_SIZE });
  const unikatQuery = useRecords({ from: ds.unikate, select: unikatLinks, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionLinks, count: PAGE_SIZE });
  const ansichtQuery = useRecords({ from: ds.ansichten, select: ansichtZaehler, count: PAGE_SIZE });
  useAllPages(ansichtQuery);
  useAllPages(kuenstlerQuery);
  useAllPages(glasurQuery);
  useAllPages(modellQuery);
  useAllPages(partnerQuery);
  useAllPages(lagerortQuery);
  useAllPages(unikatQuery);
  useAllPages(editionQuery);

  const kuenstlerCreate = useRecordCreate({ from: ds.kuenstler, fields: kuenstlerSelect });
  const kuenstlerUpdate = useRecordUpdate({ from: ds.kuenstler, fields: kuenstlerSelect });
  const glasurCreate = useRecordCreate({ from: ds.glasuren, fields: glasurSelect });
  const glasurUpdate = useRecordUpdate({ from: ds.glasuren, fields: glasurSelect });
  const modellCreate = useRecordCreate({ from: ds.modelle, fields: modellSelect });
  const modellUpdate = useRecordUpdate({ from: ds.modelle, fields: modellSelect });
  const partnerCreate = useRecordCreate({ from: ds.partner, fields: partnerSelect });
  const partnerUpdate = useRecordUpdate({ from: ds.partner, fields: partnerSelect });
  const lagerortCreate = useRecordCreate({ from: ds.lagerorte, fields: lagerortSelect });
  const lagerortUpdate = useRecordUpdate({ from: ds.lagerorte, fields: lagerortSelect });
  const kuenstlerDelete = useRecordDelete({ from: ds.kuenstler });
  const glasurDelete = useRecordDelete({ from: ds.glasuren });
  const modellDelete = useRecordDelete({ from: ds.modelle });
  const partnerDelete = useRecordDelete({ from: ds.partner });
  const lagerortDelete = useRecordDelete({ from: ds.lagerorte });

  const modellTypen = useFieldOptions({ from: ds.modelle, select: modellSelect, field: "typ" }).options as Opt[];
  const programme = useFieldOptions({ from: ds.modelle, select: modellSelect, field: "programm" }).options as Opt[];
  const partnerArten = useFieldOptions({ from: ds.partner, select: partnerSelect, field: "art" }).options as Opt[];
  const zusammenarbeit = useFieldOptions({ from: ds.partner, select: partnerSelect, field: "zusammenarbeit" }).options as Opt[];
  const bereiche = useFieldOptions({ from: ds.lagerorte, select: lagerortSelect, field: "bereich" }).options as Opt[];

  const items = (query: { data?: { pages: { items: unknown[] }[] } }) => (query.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[];
  const glasurAuswahl: Opt[] = items(glasurQuery)
    .filter((i) => i.fields.archiviert !== true)
    .map((i) => ({ id: i.id, label: str(i.fields.name) }))
    .sort((a, b) => a.label.localeCompare(b.label, "de"));
  const usage = useMemo(() => {
    const unikate = (unikatQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[];
    const u = countLinks(unikate, ["glasur", "lagerort", "galerie"]);
    // Eine Person zählt je Unikat einmal, auch wenn sie es gefertigt, gedreht und glasiert hat.
    unikate.forEach((i) => new Set(PERSONEN_FELDER.flatMap((k) => asOpts(i.fields[k]).map((o) => o.id))).forEach((id) => u.set(`person:${id}`, (u.get(`person:${id}`) ?? 0) + 1)));
    const posten = (editionQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[];
    const e = countLinks(posten, ["modell", "glasur", "lagerort", "partner"]);
    posten.forEach((i) => new Set(PERSONEN_FELDER_EDITION.flatMap((k) => asOpts(i.fields[k]).map((o) => o.id))).forEach((id) => e.set(`person:${id}`, (e.get(`person:${id}`) ?? 0) + 1)));
    const m = countLinks((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[], ["glasuren"]);
    return (key: string, id: string, source: "u" | "e" | "m") => (source === "u" ? u : source === "e" ? e : m).get(`${key}:${id}`) ?? 0;
  }, [unikatQuery.data, editionQuery.data, modellQuery.data]);

  const stueck = (n: number, eins: string, mehrere: string) => (n === 0 ? `noch bei keinem ${eins}` : `bei ${zahl.format(n)} ${n === 1 ? eins : mehrere}`);

  async function run<T>(mutation: { mutateAsync: (v: never) => Promise<T> }, payload: unknown, refetch: () => unknown) {
    await mutation.mutateAsync(payload as never);
    await refetch();
  }
  const archiveVia = (mutation: { mutateAsync: (v: never) => Promise<unknown> }, refetch: () => unknown) => (id: string, archiviert: boolean) => run(mutation, { recordId: id, fields: { archiviert } }, refetch);
  // Löschen nur, wenn nach frischem Nachzählen nichts mehr darauf verweist (ein zweites Gerät könnte es gerade verwendet haben).
  type Ref = { source: "u" | "e" | "m"; key: string };
  const sources = { u: unikatQuery, e: editionQuery, m: modellQuery };
  async function freshUsage(id: string, refs: Ref[]): Promise<number> {
    let n = 0;
    for (const r of refs) {
      const list = await freshItems(sources[r.source]);
      if (!list) throw new Error("Die Verwendung konnte nicht geprüft werden. Bitte erneut versuchen.");
      n += countLinks(list, [r.key]).get(`${r.key}:${id}`) ?? 0;
    }
    return n;
  }
  const removeVia = (mutation: { mutateAsync: (v: never) => Promise<unknown> }, refetch: () => unknown, refs: Ref[]) => async (id: string) => {
    const n = await freshUsage(id, refs);
    if (n > 0) throw new Error(`Wird inzwischen ${n === 1 ? "einmal" : `${zahl.format(n)}-mal`} verwendet und kann nicht gelöscht werden. Stattdessen archivieren.`);
    await run(mutation, id, refetch);
  };

  const kategorien: Kategorie[] = [
    {
      key: "kuenstler",
      label: "Personen",
      singular: "Person",
      hint: "Wer dreht und glasiert. Erscheint als Auswahl beim Erfassen und Glasieren.",
      fields: [{ key: "name", label: "Name", kind: "text", required: true, placeholder: "Vor- und Nachname" }],
      entries: items(kuenstlerQuery).map((i) => toEntry(i, ["name"], () => "")),
      usage: (id) => [stueck(usage("person", id, "u"), "Unikat", "Unikaten"), usage("person", id, "e") ? stueck(usage("person", id, "e"), "Editionsposten", "Editionsposten") : ""].filter(Boolean).join(" · "),
      usageCount: (id) => usage("person", id, "u") + usage("person", id, "e"),
      archive: archiveVia(kuenstlerUpdate, kuenstlerQuery.refetch),
      remove: removeVia(kuenstlerDelete, kuenstlerQuery.refetch, [...PERSONEN_FELDER.map((key) => ({ source: "u" as const, key })), ...PERSONEN_FELDER_EDITION.map((key) => ({ source: "e" as const, key }))]),
      save: (id, v) => run(id ? kuenstlerUpdate : kuenstlerCreate, id ? { recordId: id, fields: { name: v.name } } : { name: v.name }, kuenstlerQuery.refetch),
    },
    {
      key: "glasuren",
      label: "Glasuren",
      singular: "Glasur",
      hint: "Glasurname für Unikate und Editionsware.",
      fields: [{ key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Seladon Nebel" }],
      entries: items(glasurQuery).map((i) => toEntry(i, ["name"], () => "")),
      usage: (id) =>
        [stueck(usage("glasur", id, "u"), "Unikat", "Unikaten"), stueck(usage("glasur", id, "e"), "Editionsposten", "Editionsposten"), usage("glasuren", id, "m") ? `bei ${zahl.format(usage("glasuren", id, "m"))} ${usage("glasuren", id, "m") === 1 ? "Modell" : "Modellen"}` : ""]
          .filter(Boolean)
          .join(" · "),
      usageCount: (id) => usage("glasur", id, "u") + usage("glasur", id, "e") + usage("glasuren", id, "m"),
      archive: archiveVia(glasurUpdate, glasurQuery.refetch),
      remove: removeVia(glasurDelete, glasurQuery.refetch, [
        { source: "u", key: "glasur" },
        { source: "e", key: "glasur" },
        { source: "m", key: "glasuren" },
      ]),
      save: (id, v) => run(id ? glasurUpdate : glasurCreate, id ? { recordId: id, fields: { name: v.name } } : { name: v.name }, glasurQuery.refetch),
    },
    {
      key: "modelle",
      label: "Modelle",
      singular: "Modell",
      hint: "Artikel aus Geschirr und Edition. Erscheinen beim Erfassen in der gewählten Serie.",
      fields: [
        { key: "artikelnr", label: "Artikelnr.", kind: "text", placeholder: "z. B. 2001 oder 6a" },
        { key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Kugelvase Craquelée" },
        { key: "nameEn", label: "Name englisch", kind: "text", placeholder: "z. B. spherical vase" },
        { key: "programm", label: "Serie", kind: "chips", options: programme.map((o) => ({ ...o, label: serieVon(o.label) })) },
        { key: "typ", label: "Typ", kind: "chips", options: modellTypen },
        { key: "glasuren", label: "Glasuren", kind: "multi", options: glasurAuswahl },
        { key: "masse", label: "Maße", kind: "text", placeholder: "z. B. Ø 8 × H 10 cm" },
        { key: "vk", label: "VK-Preis in €", kind: "price", placeholder: "z. B. 400" },
      ],
      foto: true,
      entries: items(modellQuery).map((i) => {
        const e = toEntry(i, ["name", "artikelnr", "nameEn", "programm", "typ", "masse", "vk"], (v) => [serieVon(v.programm), v.typ, v.masse, v.vk && `${v.vk} €`].filter(Boolean).join(" · "), "foto");
        e.values.glasuren = asOpts(i.fields.glasuren)
          .map((g) => g.id)
          .join(",");
        e.values.programm = serieVon(e.values.programm);
        return { ...e, name: modellLabel(e.values.artikelnr, e.values.name) };
      }),
      sortKey: (e) => e.values.artikelnr,
      // Eine Artikelnummer gibt es nur einmal. Ohne Nummer darf der Name nicht doppelt sein.
      duplicateOf: (v, selfId) => {
        const nr = (v.artikelnr ?? "").trim().toLowerCase();
        const andere = items(modellQuery).filter((i) => i.id !== selfId);
        const gleich = nr ? andere.find((i) => str(i.fields.artikelnr).trim().toLowerCase() === nr) : andere.find((i) => !str(i.fields.artikelnr) && str(i.fields.name).trim().toLowerCase() === v.name.toLowerCase());
        if (!gleich) return undefined;
        return nr ? `Artikelnr. ${nr} gibt es schon („${str(gleich.fields.name)}“).` : `„${v.name}“ gibt es schon. Bitte eine Artikelnr. angeben.`;
      },
      usage: (id) => stueck(usage("modell", id, "e"), "Editionsposten", "Editionsposten"),
      usageCount: (id) => usage("modell", id, "e"),
      archive: archiveVia(modellUpdate, modellQuery.refetch),
      remove: removeVia(modellDelete, modellQuery.refetch, [{ source: "e", key: "modell" }]),
      save: (id, v, fotos) => {
        const fields = {
          name: v.name,
          artikelnr: v.artikelnr.trim(),
          nameEn: v.nameEn.trim(),
          // In der Datenbank heißt das Geschirr „Manufakturprogramm“.
          programm: (v.programm === GESCHIRR ? MANUFAKTUR_PROGRAMM : v.programm) || null,
          typ: v.typ || null,
          masse: v.masse.trim(),
          vk: parseNumber(v.vk),
          glasuren: v.glasuren.split(",").filter(Boolean),
          ...(fotos ? { foto: fotos } : {}),
        };
        return run(id ? modellUpdate : modellCreate, id ? { recordId: id, fields } : fields, modellQuery.refetch);
      },
    },
    {
      key: "partner",
      label: "Partner",
      singular: "Partner",
      hint: "Galerien, Museen, Ausstellungen und Leihnehmer. Erscheinen als Auswahl, wenn ein Stück außer Haus geht.",
      fields: [
        { key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Galerie Nord" },
        { key: "art", label: "Art", kind: "chips", options: partnerArten },
        { key: "ort", label: "Ort", kind: "text", placeholder: "z. B. Essen" },
        { key: "zusammenarbeit", label: "Zusammenarbeit", kind: "chips", options: zusammenarbeit },
        { key: "kontakt", label: "Kontakt", kind: "textarea" },
        { key: "notiz", label: "Notiz", kind: "textarea" },
      ],
      entries: items(partnerQuery).map((i) => toEntry(i, ["name", "art", "ort", "kontakt", "zusammenarbeit", "notiz"], (v) => [v.art, v.ort, v.zusammenarbeit === "beendet" ? "beendet" : ""].filter(Boolean).join(" · "))),
      usage: (id) => [`zurzeit ${stueck(usage("galerie", id, "u"), "Unikat", "Unikaten")}`, usage("partner", id, "e") ? stueck(usage("partner", id, "e"), "Editionsposten", "Editionsposten") : ""].filter(Boolean).join(" · "),
      usageCount: (id) => usage("galerie", id, "u") + usage("partner", id, "e"),
      archive: archiveVia(partnerUpdate, partnerQuery.refetch),
      remove: removeVia(partnerDelete, partnerQuery.refetch, [
        { source: "u", key: "galerie" },
        { source: "e", key: "partner" },
      ]),
      save: (id, v) => {
        const fields = { name: v.name, art: v.art || null, ort: v.ort.trim(), zusammenarbeit: v.zusammenarbeit || null, kontakt: v.kontakt.trim(), notiz: v.notiz.trim() };
        return run(id ? partnerUpdate : partnerCreate, id ? { recordId: id, fields } : fields, partnerQuery.refetch);
      },
    },
    {
      key: "lagerorte",
      label: "Lagerorte",
      singular: "Lagerort",
      hint: "Regale, Vitrinen und Räume im Haus.",
      fields: [
        { key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Regal C – Lager" },
        { key: "bereich", label: "Bereich", kind: "chips", options: bereiche },
      ],
      entries: items(lagerortQuery).map((i) => toEntry(i, ["name", "bereich"], (v) => v.bereich)),
      usage: (id) => `${stueck(usage("lagerort", id, "u"), "Unikat", "Unikaten")} · ${stueck(usage("lagerort", id, "e"), "Editionsposten", "Editionsposten")}`,
      usageCount: (id) => usage("lagerort", id, "u") + usage("lagerort", id, "e"),
      archive: archiveVia(lagerortUpdate, lagerortQuery.refetch),
      remove: removeVia(lagerortDelete, lagerortQuery.refetch, [
        { source: "u", key: "lagerort" },
        { source: "e", key: "lagerort" },
      ]),
      locked: (e) => (e.name === AUSSER_HAUS_ORT ? "Diesen Namen setzen die Regeln für Stücke außer Haus. Er bleibt fest." : undefined),
      save: (id, v) => run(id ? lagerortUpdate : lagerortCreate, id ? { recordId: id, fields: { name: v.name, bereich: v.bereich || null } } : { name: v.name, bereich: v.bereich || null }, lagerortQuery.refetch),
    },
  ];

  const kat = kategorien.find((k) => k.key === tab) ?? kategorien[0];
  // Erst wenn alle Seiten von Unikaten und Editionsware da sind, stimmt die Verwendung. Sonst würde „Löschen“ zu früh angeboten.
  const queries = [kuenstlerQuery, glasurQuery, modellQuery, partnerQuery, lagerortQuery, unikatQuery, editionQuery];
  const loading = queries.some((qq) => qq.status === "pending" || qq.hasNextPage);
  const failed = queries.some((qq) => qq.status === "error");
  const term = search.trim().toLowerCase();
  const visible = kat.entries
    .filter((e) => !term || [e.name, e.sub].join(" ").toLowerCase().includes(term))
    .sort((a, b) => (kat.sortKey ? compareNr(kat.sortKey(a), kat.sortKey(b)) : 0) || a.name.localeCompare(b.name, "de"));
  const aktiv = visible.filter((e) => !e.archiviert);
  const archiviert = visible.filter((e) => e.archiviert);
  const rows = (list: Entry[]) => (
    <ul className={`${PANEL_CLASS} px-3 divide-y`}>
      {list.map((e) => (
        <li key={e.id}>
          <ListRow fotos={kat.foto ? e.fotos : undefined} title={e.name || "Ohne Namen"} sub={[e.sub, kat.usage(e.id)].filter(Boolean).join(" · ")} onClick={() => setDialog({ entry: e })} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={SEITE_CLASS}>
      <div className="content space-y-4" lang="de">
        <PageHeader title="Stammdaten" description="Die Auswahllisten für Erfassen und Bestand. Hier anlegen, korrigieren, archivieren." />
        <Tabs
          label="Stammdaten"
          tabs={kategorien.map((k) => ({ key: k.key, label: k.label, count: k.entries.filter((e) => !e.archiviert).length }))}
          value={tab}
          onChange={(key) => {
            setTab(key);
            setSearch("");
            setShowArchived(false);
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base text-muted-foreground min-w-0 flex-1 basis-64">{kat.hint}</p>
          <Knopf className="h-11 text-base" onClick={() => setDialog({ entry: null })}>
            <Plus className="w-5 h-5 mr-2" aria-hidden /> {kat.singular} anlegen
          </Knopf>
        </div>
        {kat.entries.length > SEARCH_FROM && <SearchField label="Suche" placeholder={`${kat.label} durchsuchen`} value={search} onChange={setSearch} />}
        {failed ? (
          <ErrorState text="Die Stammdaten konnten nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Stammdaten werden geladen …" />
        ) : (
          <>
            {aktiv.length === 0 ? <EmptyState text={term ? "Nichts gefunden." : `Noch keine ${kat.label}. Mit „${kat.singular} anlegen“ beginnen.`} /> : rows(aktiv)}
            {archiviert.length > 0 && (
              <div className="space-y-3">
                <Knopf variant="ghost" className="h-11 px-2 text-base text-muted-foreground" aria-expanded={showArchived} onClick={() => setShowArchived((v) => !v)}>
                  <ChevronDown className={`w-5 h-5 mr-1 transition-transform ${showArchived ? "rotate-180" : ""}`} aria-hidden />
                  Archiviert ({zahl.format(archiviert.length)})
                </Knopf>
                {showArchived && rows(archiviert)}
              </div>
            )}
            <Speicherstand eintraege={[...queries, ansichtQuery].reduce((n, qq) => n + (qq.data?.pages.flatMap((p) => p.items).length ?? 0), 0)} />
          </>
        )}
      </div>
      {dialog && <EntryDialog key={`${kat.key}-${dialog.entry?.id ?? "neu"}`} kat={kat} entry={dialog.entry} onClose={() => setDialog(null)} />}
    </div>
  );
}

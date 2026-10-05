// Gemeinsame Bauteile. Jede Auswahl, jedes Feld, jedes Fenster sieht in allen Blöcken gleich aus.
// Radien: Bedienelemente (Feld, Knopf, Auswahl, Badge) rounded-md, Flächen (Liste, Bereich, Fenster) rounded-lg.
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertTriangle, Camera, ChevronDown, ChevronRight, Download, FileSpreadsheet, ImageOff, LayoutGrid, List, Loader2, Plus, Printer, Search, SlidersHorizontal, X } from "lucide-react";
import { AUSGESTELLT, GLASIERT, KOMMISSION, RESERVIERT, ROHLING, VERFUEGBAR, VERKAUFT } from "../shared/konstanten";
import { type Attachment, type Opt, type ThumbSize, thumb } from "../shared/daten";

// Die eine Rahmenfarbe der App: Flächen, Kacheln, Felder, Auswahlen, Knöpfe. Nur Trennlinien innerhalb einer Fläche bleiben heller.
const LINE = "border-neutral-300";
// Jedes Fenster (Dialog). Rahmen in der App-Rahmenfarbe.
export const DIALOG_CLASS = `w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-lg border ${LINE} p-4 sm:p-6 [&>button:last-child]:hidden`;
// Jedes aufklappende Menü (Popover, Ausklappliste).
export const POPOVER_CLASS = `border ${LINE}`;
// md:text-base hebt das md:text-sm der shadcn-Felder auf, damit Eingabe und Auswahlliste gleich groß schreiben.
const FIELD_CLASS = `h-12 min-w-0 rounded-md text-base md:text-base ${LINE}`;
// iOS gibt Datumsfeldern eine eigene Mindestbreite; ohne appearance-none ragen sie aus der Spalte und die Seite lässt sich seitlich schieben.
const DATUM_CLASS = "appearance-none [&::-webkit-date-and-time-value]:text-left";
// Die Box: jede umrandete Fläche (Bereich, Liste, Kachel, Tabelle). Innerhalb einer Box keine zweite Box.
export const PANEL_CLASS = `rounded-lg border ${LINE} bg-card`;
// Box, deren Inhalt in Felder geteilt ist (z. B. Kennzahlen): Die Trennlinien haben dieselbe Farbe wie der Rahmen.
export const PANEL_GRID_CLASS = `rounded-lg border ${LINE} bg-neutral-300 gap-px overflow-hidden`;
// Box um eine breite Tabelle: Die Tabelle wischt nur waagerecht (shadcn legt um <table> einen Scrollbereich).
export const TABLE_PANEL_CLASS = `${PANEL_CLASS} [&>div]:overflow-y-hidden [&>div]:overscroll-x-contain`;
// Nur waagerecht wischbar. overflow-x-auto allein macht in CSS auch die senkrechte Achse scrollbar, dann lässt sich der Inhalt nach oben und unten ziehen.
// Einzige Stelle mit overflow-x-auto (geprüft von pruefung/einheitlich.mjs).
export const WISCHEN = "overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
// Wurzel jeder Seite. overflow-x-clip: Nichts kann die Seite verbreitern, am Handy lässt sie sich nie seitlich verschieben.
export const SEITE_CLASS = "container pt-6 pb-28 sm:pb-8 overflow-x-clip";
// Wie SEITE_CLASS, aber über die volle Breite (Tabelle).
export const SEITE_BREIT_CLASS = "w-full px-4 sm:px-6 pt-6 pb-28 sm:pb-8 overflow-x-clip";
// Am Handy eine Zeile zum seitlich Wischen statt mehrerer umbrochener Reihen, ab Tablet umbrechen.
export const SCROLL_ROW = `flex gap-2 py-0.5 ${WISCHEN} sm:flex-wrap sm:overflow-visible`;
// Klebende Leisten am unteren Rand: am Handy knapp über Softrs Navigationsleiste (ca. 56 px), ab Tablet am Rand.
export const STICKY_BOTTOM = "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:bottom-4";

// Farbe trägt nur den Status eines Unikats (farbiger Rand im Ton des Status). Neutrale Werte (verkauft, Rohling, glasiert) haben den App-Rahmen.
const STATUS_BADGE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-50 text-emerald-800 border-emerald-200",
  [RESERVIERT]: "bg-amber-50 text-amber-900 border-amber-200",
  [VERKAUFT]: `bg-zinc-100 text-zinc-700 ${LINE}`,
  [KOMMISSION]: "bg-sky-50 text-sky-800 border-sky-200",
  [AUSGESTELLT]: "bg-violet-50 text-violet-800 border-violet-200",
  [ROHLING]: `bg-background text-muted-foreground ${LINE}`,
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
export const Knopf = forwardRef<HTMLButtonElement, KnopfProps>(function Knopf({ variant = "default", className = "", ...props }, ref) {
  const rahmen = variant === "outline" || variant === "secondary" ? `border ${LINE}` : "";
  return <Button ref={ref} variant={variant} className={`${rahmen} ${className}`} {...props} />;
});

// Jedes einzeilige Eingabefeld.
export const Feld = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Feld({ className = "", ...props }, ref) {
  return <Input ref={ref} className={`${FIELD_CLASS} ${props.type === "date" ? DATUM_CLASS : ""} ${className}`} {...props} />;
});

// Jedes mehrzeilige Textfeld.
export const Textfeld = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textfeld({ className = "", ...props }, ref) {
  return <Textarea ref={ref} className={`rounded-md text-base md:text-base ${LINE} ${className}`} {...props} />;
});

// Jede Auswahlliste (öffnet am Handy die Auswahl des Telefons). kompakt: für dichte Filterzeilen. breite ersetzt die volle Breite.
export const Auswahl = forwardRef<HTMLSelectElement, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & { kompakt?: boolean; breite?: string }>(function Auswahl(
  { kompakt, breite = "w-full", ...props },
  ref,
) {
  return <select ref={ref} className={`${breite} ${kompakt ? "h-11 px-2" : "h-12 px-3"} rounded-md border ${LINE} bg-background text-base`} {...props} />;
});

// Ein-/Aus-Schalter als umrandete Zeile in Feldhöhe. lage: nur Ausrichtung im Raster (z. B. self-end).
export function SchalterFeld({ id, label, hint, checked, onChange, lage = "" }: { id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; lage?: string }) {
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

// Jedes Ankreuzfeld.
export function Ankreuzfeld({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <Checkbox className={LINE} checked={checked} onCheckedChange={(v) => onChange(v === true)} />;
}

// Kleines Etikett für Werte in Tabellen (z. B. Glasuren).
export function Etikett({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={`text-sm font-normal ${LINE}`}>
      {children}
    </Badge>
  );
}

const MOBILE_QUERY = "(max-width: 639px)";

// Handy oder größer. Für Bedienelemente, die am Handy anders aufgebaut sind (Filter im Blatt von unten).
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => window.matchMedia?.(MOBILE_QUERY).matches ?? false);
  useEffect(() => {
    const media = window.matchMedia?.(MOBILE_QUERY);
    if (!media) return;
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}

// Gewählt = gefüllt. Kein zusätzliches Symbol, damit der Knopf beim Antippen nicht breiter wird und nichts springt.
// Mindestbreite, damit kurze Wörter (Sieb, Topf) nicht winzig wirken und die Reihen ruhiger aussehen.
// shrink-0: In einer Wischzeile wird der Knopf nie gestaucht, der Text bleibt in der Box.
const CHIP_BASE = "inline-flex shrink-0 items-center justify-center gap-2 min-h-11 min-w-[5rem] px-3.5 rounded-md border text-base whitespace-nowrap transition-colors disabled:opacity-60";
const CHIP_IDLE = `bg-background hover:bg-muted ${LINE}`;
const CHIP_ACTIVE = "bg-primary text-primary-foreground border-primary";

// Ein einzelner Auswahl-Knopf. Gewählt: Hauptfarbe, beim Status die Statusfarbe.
export function Chip({ active, onClick, children, disabled, role, activeClass }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; role?: "radio"; activeClass?: string }) {
  const state = role === "radio" ? { "aria-checked": active } : { "aria-pressed": active };
  return (
    <button type="button" role={role} {...state} disabled={disabled} onClick={onClick} className={`${CHIP_BASE} ${active ? `${activeClass ?? CHIP_ACTIVE} font-medium` : CHIP_IDLE}`}>
      {children}
    </button>
  );
}

// Einfachauswahl als Knopfreihe, z. B. Status, Typ, Zustand. Wert ist das Label. statusColors färbt den gewählten Status.
export function ChoiceChips({ label, options, value, onChange, statusColors, disabled }: { label: string; options: Opt[]; value: string; onChange: (label: string) => void; statusColors?: boolean; disabled?: boolean }) {
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
export function FilterChips<K extends string>({ label, options, value, onChange }: { label: string; options: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void }) {
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
export function Tabs<K extends string>({ label, tabs, value, onChange }: { label: string; tabs: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void }) {
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

export function StatusBadge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-medium whitespace-nowrap ${STATUS_BADGE[text] ?? `bg-muted text-foreground ${LINE}`}`}>
      {text}
    </span>
  );
}

// required: Pflichtfeld (*). empfohlen: darf leer bleiben, beim Speichern kommt eine Rückfrage.
export function FieldLabel({ htmlFor, children, required, empfohlen }: { htmlFor?: string; children: string; required?: boolean; empfohlen?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
      {required && <span className="text-destructive"> *</span>}
      {empfohlen && <span className="font-normal text-muted-foreground"> · empfohlen</span>}
    </label>
  );
}

export function Hint({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground mt-1.5">{children}</p>;
}

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" data-error="true" className="text-sm text-destructive mt-1.5">
      {children}
    </p>
  );
}

// Auswahlliste für verknüpfte Datensätze. Wert ist die Datensatz-ID.
export function OptionSelect({ id, value, onChange, options, placeholder, disabled }: { id: string; value: string; onChange: (id: string) => void; options: Opt[]; placeholder: string; disabled?: boolean }) {
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

// Auswahlliste mit Gruppen (z. B. Editionen | Manufakturprogramm). Am Handy öffnet sie die Auswahl des Systems.
export function GroupedSelect({ id, value, onChange, groups, placeholder }: { id: string; value: string; onChange: (id: string) => void; groups: { label: string; options: Opt[] }[]; placeholder: string }) {
  return (
    <Auswahl id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {groups
        .filter((g) => g.options.length > 0)
        .map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
    </Auswahl>
  );
}

export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
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
export function SearchPick({
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

export function Thumb({ fotos, size = "small", className = "w-12 h-12 rounded-md" }: { fotos: Attachment[]; size?: ThumbSize; className?: string }) {
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
export function PageHeader({ title, description, aside, actions }: { title: string; description?: string; aside?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="flex items-end justify-between gap-4 min-w-0 flex-1 sm:flex-none">
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

export function Section({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
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
export function ListRow({ fotos, title, sub, meta, onClick, href }: { fotos?: Attachment[]; title: string; sub?: React.ReactNode; meta?: React.ReactNode; onClick?: () => void; href?: string }) {
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

export function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-base text-muted-foreground py-10 justify-center">
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> {text}
    </div>
  );
}

export function ErrorState({ text }: { text: string }) {
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-base">
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0" aria-hidden /> {text}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg bg-muted/50 px-4 py-6 text-center text-base text-muted-foreground">{text}</p>;
}

// Kopf jedes Fensters: Titel, Unterzeile, großer Schließen-Knopf.
export function PanelHeader({ title, description }: { title: string; description: string }) {
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

export function DoneButton() {
  return (
    <DialogClose asChild>
      <Knopf variant="outline" className={`w-full h-12 text-base`}>
        Fertig
      </Knopf>
    </DialogClose>
  );
}

// Rückfrage vor einem Schritt, den man noch abbrechen kann, z. B. „Ohne Foto speichern?“. Bestätigen ist der Hauptknopf.
export function Rueckfrage({
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
export function ZusatzKnopf({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Knopf type="button" variant="ghost" className="h-11 px-2 text-base text-primary" onClick={onClick}>
      <Plus className="w-5 h-5 mr-1" aria-hidden />
      {label}
    </Knopf>
  );
}

// „+ Neu anlegen“ mit Dublettenprüfung ohne Groß-/Kleinschreibung.
export function AddNew({ label, placeholder, existing, onAdd }: { label: string; placeholder: string; existing: Opt[]; onAdd: (name: string) => Promise<boolean> | boolean }) {
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
export function PhotoPicker({ files, onChange, multiple, error }: { files: File[]; onChange: (f: File[]) => void; multiple: boolean; error?: string }) {
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

// Export einer Liste: Excel-taugliche CSV-Datei oder Druckansicht (dort „Als PDF sichern“).
export function ExportMenu({ onCsv, onPdf, disabled }: { onCsv: () => void; onPdf: () => void; disabled?: boolean }) {
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

export type Ansicht = "liste" | "kacheln";
const ANSICHT_KEY = "kwm-ansicht";

// Liste oder Kacheln. Am Handy sind Kacheln Standard, am Rechner die Liste. Die Wahl merkt sich das Gerät.
export function useAnsicht(): [Ansicht, (a: Ansicht) => void] {
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

export function AnsichtToggle({ value, onChange }: { value: Ansicht; onChange: (a: Ansicht) => void }) {
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
export function FilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Knopf variant={count ? "secondary" : "outline"} className="relative h-12 w-12 px-0 shrink-0" aria-label={count ? `Filter, ${count} aktiv` : "Filter"} onClick={onClick}>
      <SlidersHorizontal className="w-5 h-5" aria-hidden />
      {count > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium leading-5 tabular-nums">{count}</span>}
    </Knopf>
  );
}

// Filter am Handy als Blatt von unten (wischbar). Auswahllisten darin öffnen die Auswahl des Telefons.
export function FilterSheet({
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
      {/* Hoher z-index: Das Blatt muss über Softrs eigener Navigationsleiste liegen. */}
      <DrawerContent lang="de" className={`z-[99999] ${LINE}`}>
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

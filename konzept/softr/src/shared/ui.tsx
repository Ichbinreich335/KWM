// Gemeinsame Bauteile. Jede Auswahl, jedes Feld, jedes Fenster sieht in allen Blöcken gleich aus.
// Radien: Bedienelemente (Feld, Knopf, Auswahl, Badge) rounded-md, Flächen (Liste, Bereich, Fenster) rounded-lg.
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertTriangle, Camera, Check, ChevronDown, ChevronRight, Download, FileSpreadsheet, ImageOff, LayoutGrid, List, Loader2, Plus, Printer, Search, SlidersHorizontal, X } from "lucide-react";
import { STATUS_ACTIVE, STATUS_BADGE } from "../shared/konstanten";
import { type Attachment, type Opt, type ThumbSize, thumb } from "../shared/daten";

export const DIALOG_CLASS = "w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 [&>button:last-child]:hidden";
// md:text-base hebt das md:text-sm der shadcn-Felder auf, damit Eingabe und Auswahlliste gleich groß schreiben.
export const FIELD_CLASS = "h-12 rounded-md text-base md:text-base";
export const TEXTAREA_CLASS = "rounded-md text-base md:text-base";
export const INPUT_CLASS = "w-full h-12 rounded-md border border-input bg-background px-3 text-base";
export const PANEL_CLASS = "rounded-lg border bg-card";
// Am Handy eine Zeile zum seitlich Wischen statt mehrerer umbrochener Reihen, ab Tablet umbrechen.
export const SCROLL_ROW = "flex gap-2 py-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible";
// Klebende Leisten am unteren Rand: am Handy über Softrs Navigationsleiste (ca. 80 px), ab Tablet am Rand.
export const STICKY_BOTTOM = "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-4";

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

const CHIP_BASE = "inline-flex items-center justify-center gap-2 min-h-11 px-3.5 rounded-md border text-base whitespace-nowrap transition-colors disabled:opacity-60";
const CHIP_IDLE = "bg-background hover:bg-muted border-input";
const CHIP_ACTIVE = "bg-primary text-primary-foreground border-primary";

// Ein einzelner Auswahl-Knopf für Formulare. Gewählt: Hauptfarbe mit Haken, beim Status die Statusfarbe.
export function Chip({ active, onClick, children, disabled, role, activeClass }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; role?: "radio"; activeClass?: string }) {
  const state = role === "radio" ? { "aria-checked": active } : { "aria-pressed": active };
  return (
    <button type="button" role={role} {...state} disabled={disabled} onClick={onClick} className={`${CHIP_BASE} ${active ? activeClass ?? CHIP_ACTIVE : CHIP_IDLE}`}>
      {active && <Check className="w-4 h-4" aria-hidden />}
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
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`inline-flex items-center gap-1.5 min-h-11 px-3 -mb-px border-b-2 text-base whitespace-nowrap transition-colors ${
              active ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count !== undefined && <span className="tabular-nums text-muted-foreground">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function StatusBadge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-medium whitespace-nowrap ${STATUS_BADGE[text] ?? "bg-muted text-foreground border-border"}`}>
      {text}
    </span>
  );
}

export function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
      {required && <span className="text-destructive"> *</span>}
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
    <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Auswahlliste mit Gruppen (z. B. Editionen | Manufakturprogramm). Am Handy öffnet sie die Auswahl des Systems.
export function GroupedSelect({ id, value, onChange, groups, placeholder }: { id: string; value: string; onChange: (id: string) => void; groups: { label: string; options: Opt[] }[]; placeholder: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS}>
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
    </select>
  );
}

export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`${FIELD_CLASS} pl-10`} />
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
        <Button
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
        </Button>
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

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-base text-muted-foreground mt-0.5">{description}</p>}
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

// Kennzahl als Link. warn (rot) für Fristen, note (gelb) für fehlende Angaben, die die Zahl verfälschen.
export function Tile({ label, value, sub, warn, note, href }: { label: string; value: string; sub?: string; warn?: string; note?: string; href: string }) {
  return (
    <a href={href} className={`group block h-full ${PANEL_CLASS} p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors`}>
      <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        {label}
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
      </p>
      <p className="text-3xl font-semibold mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
      {warn && <p className="text-sm text-red-800 mt-1">{warn}</p>}
      {note && <p className="text-sm text-amber-800 mt-1">{note}</p>}
    </a>
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
        <Button variant="ghost" className="h-11 w-11 p-0 shrink-0" aria-label="Schließen">
          <X className="w-6 h-6" aria-hidden />
        </Button>
      </DialogClose>
    </DialogHeader>
  );
}

export function DoneButton() {
  return (
    <DialogClose asChild>
      <Button variant="outline" className="w-full h-12 text-base">
        Fertig
      </Button>
    </DialogClose>
  );
}

// „+ Neu anlegen“ mit Dublettenprüfung ohne Groß-/Kleinschreibung.
export function AddNew({ label, placeholder, existing, onAdd }: { label: string; placeholder: string; existing: Opt[]; onAdd: (name: string) => Promise<boolean> | boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const name = value.trim();
  const duplicate = existing.find((o) => o.label.toLowerCase() === name.toLowerCase());
  if (!open) {
    return (
      <Button type="button" variant="ghost" className="h-11 px-2 text-base text-primary" onClick={() => setOpen(true)}>
        <Plus className="w-5 h-5 mr-1" aria-hidden />
        {label}
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} aria-label={label} className={`${FIELD_CLASS} flex-1 min-w-48`} />
      <Button
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
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-12 text-base"
        onClick={() => {
          setValue("");
          setOpen(false);
        }}
      >
        Abbrechen
      </Button>
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
          className={`w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-base hover:bg-muted ${error ? "border-destructive" : "border-input"}`}
        >
          <Camera className="w-8 h-8 text-muted-foreground" aria-hidden />
          <span className="font-medium">Foto aufnehmen oder auswählen</span>
          <span className="text-sm text-muted-foreground">Am Handy öffnet sich Kamera oder Galerie</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square rounded-md overflow-hidden border">
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
            <button type="button" onClick={() => inputRef.current?.click()} className="aspect-square rounded-md border-2 border-dashed border-input flex flex-col items-center justify-center gap-1 text-sm hover:bg-muted">
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
        <Button variant="outline" className="h-12 w-12 px-0 text-base sm:w-auto sm:px-4" disabled={disabled} aria-label="Exportieren">
          <Download className="w-5 h-5 sm:mr-2" aria-hidden />
          <span className="hidden sm:inline">Exportieren</span>
          <ChevronDown className="hidden sm:block w-4 h-4 ml-1" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
    <div role="group" aria-label="Ansicht" className="inline-flex rounded-md border border-input overflow-hidden divide-x divide-input shrink-0">
      {item("liste", "Als Liste", <List className="w-5 h-5" aria-hidden />)}
      {item("kacheln", "Als Kacheln", <LayoutGrid className="w-5 h-5" aria-hidden />)}
    </div>
  );
}

// Filter-Knopf am Handy. Die Zahl zeigt, wie viele Filter gerade greifen.
export function FilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button variant={count ? "secondary" : "outline"} className="relative h-12 w-12 px-0 shrink-0" aria-label={count ? `Filter, ${count} aktiv` : "Filter"} onClick={onClick}>
      <SlidersHorizontal className="w-5 h-5" aria-hidden />
      {count > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium leading-5 tabular-nums">{count}</span>}
    </Button>
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
      <DrawerContent lang="de" className="z-[99999]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl">Filter</DrawerTitle>
          <DrawerDescription className="text-base">Gilt sofort für die Liste.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 space-y-5">{children}</div>
        <DrawerFooter className="pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button className="h-12 text-base">{resultText}</Button>
          </DrawerClose>
          <Button variant="ghost" className="h-12 text-base" disabled={!canReset} onClick={onReset}>
            Filter zurücksetzen
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

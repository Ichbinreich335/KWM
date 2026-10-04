// Gemeinsame Bauteile. Jede Auswahl, jedes Feld, jedes Fenster sieht in allen Blöcken gleich aus.
// Radien: Bedienelemente (Feld, Knopf, Auswahl, Badge) rounded-md, Flächen (Liste, Bereich, Fenster) rounded-lg.
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Camera, Check, ChevronRight, ImageOff, Loader2, Plus, Search, X } from "lucide-react";
import { STATUS_BADGE, STATUS_DOT } from "../shared/konstanten";
import { type Attachment, type Opt, type ThumbSize, thumb } from "../shared/daten";

export const DIALOG_CLASS = "w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 [&>button:last-child]:hidden";
// md:text-base hebt das md:text-sm der shadcn-Felder auf, damit Eingabe und Auswahlliste gleich groß schreiben.
export const FIELD_CLASS = "h-12 rounded-md text-base md:text-base";
export const TEXTAREA_CLASS = "rounded-md text-base md:text-base";
export const INPUT_CLASS = "w-full h-12 rounded-md border border-input bg-background px-3 text-base";
export const PANEL_CLASS = "rounded-lg border bg-card";

const CHIP_BASE = "inline-flex items-center justify-center gap-2 min-h-11 px-3.5 rounded-md border text-base whitespace-nowrap transition-colors disabled:opacity-60";
const CHIP_IDLE = "bg-background hover:bg-muted border-input";
const CHIP_ACTIVE = "bg-primary text-primary-foreground border-primary";

export function StatusDot({ status }: { status: string }) {
  const color = STATUS_DOT[status];
  return color ? <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${color}`} aria-hidden /> : null;
}

// Ein einzelner Auswahl-Knopf für Formulare. Gewählt ist immer die Hauptfarbe mit Haken.
export function Chip({ active, onClick, children, disabled, role }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; role?: "radio" }) {
  const state = role === "radio" ? { "aria-checked": active } : { "aria-pressed": active };
  return (
    <button type="button" role={role} {...state} disabled={disabled} onClick={onClick} className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}>
      {active && <Check className="w-4 h-4" aria-hidden />}
      {children}
    </button>
  );
}

// Einfachauswahl als Knopfreihe, z. B. Status, Typ, Zustand. Wert ist das Label. withDots zeigt die Statusfarbe als Punkt.
export function ChoiceChips({ label, options, value, onChange, withDots, disabled }: { label: string; options: Opt[]; value: string; onChange: (label: string) => void; withDots?: boolean; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.id} role="radio" active={value === o.label} disabled={disabled} onClick={() => onChange(o.label)}>
          {withDots && value !== o.label && <StatusDot status={o.label} />}
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

// Umschalter zwischen Ansichten derselben Seite (Unikat/Editionsware, Im Haus/Außer Haus …). Am Handy seitlich wischbar.
export function Segmented<K extends string>({ label, options, value, onChange }: { label: string; options: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div role="tablist" aria-label={label} className="inline-flex gap-1 rounded-md border bg-muted p-1">
        {options.map((o) => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.key)}
              className={`inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-sm text-base whitespace-nowrap transition-colors ${
                active ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
              {o.count !== undefined && <span className="tabular-nums text-muted-foreground">{o.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Reiter für getrennte Bereiche einer Seite (Stammdaten). Unterstrichen, am Handy seitlich wischbar.
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
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium whitespace-nowrap ${STATUS_BADGE[text] ?? "bg-muted text-foreground border-border"}`}>
      <StatusDot status={text} />
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

export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`${FIELD_CLASS} pl-10`} />
    </div>
  );
}

const PICK_VISIBLE = 12;

// Durchsuchbare Auswahl aus einer wachsenden Liste (Glasuren). Gewählte stehen vorn, Suche filtert, Fehlendes lässt sich anlegen.
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
  const selected = options.filter((o) => value.includes(o.id));
  const matches = options.filter((o) => !value.includes(o.id) && (!term || o.label.toLowerCase().includes(term)));
  const shown = [...selected, ...matches.slice(0, Math.max(0, PICK_VISIBLE - selected.length))];
  const hidden = selected.length + matches.length - shown.length;
  const exact = options.some((o) => o.label.toLowerCase() === term);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : multiple ? [...value, id] : [id]);

  return (
    <div className="space-y-2">
      {options.length > PICK_VISIBLE / 2 && <SearchField label={`${label} suchen`} placeholder={`${label} suchen`} value={query} onChange={setQuery} />}
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {shown.map((o) => (
          <Chip key={o.id} active={value.includes(o.id)} onClick={() => toggle(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>
      {hidden > 0 && <p className="text-sm text-muted-foreground">{hidden} weitere über die Suche</p>}
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
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
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

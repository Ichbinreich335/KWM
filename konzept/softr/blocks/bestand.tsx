// Generiert von konzept/softr/build.mjs aus src/blocks/bestand.tsx und src/shared/. Nicht von Hand ändern.
import { useEffect, useMemo, useRef, useState } from "react";
import { datasource, q, useFieldOptions, useLinkedRecords, useRecords, useRecordUpdate, useUpload } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ArrowRight, Camera, Check, ChevronRight, Download, ImageOff, Loader2, Minus, Pencil, Plus, Search, Table2, X } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 100;
const VERFUEGBAR = "verfügbar";
const RESERVIERT = "reserviert";
const VERKAUFT = "verkauft";
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const ROHLING = "Rohling";
const GLASIERT = "glasiert";
const AUSSER_HAUS_ORT = "Außer Haus";
const isAusserHaus = (status: string) => status === KOMMISSION || status === AUSGESTELLT;

// Ruhige Variante für Badges in Listen und Tabellen.
const STATUS_BADGE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-100 text-emerald-800 border-emerald-200",
  [RESERVIERT]: "bg-amber-100 text-amber-900 border-amber-200",
  [VERKAUFT]: "bg-zinc-100 text-zinc-600 border-zinc-200",
  [KOMMISSION]: "bg-sky-100 text-sky-800 border-sky-200",
  [AUSGESTELLT]: "bg-violet-100 text-violet-800 border-violet-200",
  [ROHLING]: "bg-stone-100 text-stone-700 border-stone-200",
  [GLASIERT]: "bg-teal-50 text-teal-800 border-teal-200",
};

// Kräftige Variante für den gewählten Auswahl-Knopf.
const STATUS_ACTIVE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-600 text-white border-emerald-600",
  [RESERVIERT]: "bg-amber-400 text-amber-950 border-amber-400",
  [VERKAUFT]: "bg-zinc-500 text-white border-zinc-500",
  [KOMMISSION]: "bg-sky-600 text-white border-sky-600",
  [AUSGESTELLT]: "bg-violet-700 text-white border-violet-700",
};

type Opt = { id: string; label: string };
type Attachment = { id?: string; url: string; filename?: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };
type LinkedPages = { pages: { items: { id: string; title: string }[] }[] } | undefined;
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

function toOptions(data: LinkedPages): Opt[] {
  return (data?.pages.flatMap((p) => p.items) ?? []).map((o) => ({ id: o.id, label: o.title }));
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

const DIALOG_CLASS = "w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto [&>button:last-child]:hidden";
const INPUT_CLASS = "w-full h-12 rounded-md border border-input bg-background px-3 text-base";
const CHIP_BASE = "inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-full border text-base whitespace-nowrap transition-colors disabled:opacity-60";
const CHIP_IDLE = "bg-background hover:bg-muted border-input";
const CHIP_ACTIVE = "bg-primary text-primary-foreground border-primary";

// Ein einzelner Auswahl-Knopf. Grundlage für alle Auswahlen, Reiter und Filter.
function Chip({
  active,
  onClick,
  children,
  disabled,
  activeClass,
  role,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  activeClass?: string;
  role?: "radio" | "tab";
}) {
  const state = role ? (role === "tab" ? { "aria-selected": active } : { "aria-checked": active }) : { "aria-pressed": active };
  return (
    <button type="button" role={role} {...state} disabled={disabled} onClick={onClick} className={`${CHIP_BASE} ${active ? activeClass ?? CHIP_ACTIVE : CHIP_IDLE}`}>
      {active && <Check className="w-4 h-4" aria-hidden />}
      {children}
    </button>
  );
}

// Einfachauswahl als Knopfreihe, z. B. Status, Typ, Zustand. Wert ist das Label.
function ChoiceChips({
  label,
  options,
  value,
  onChange,
  activeClasses,
  disabled,
}: {
  label: string;
  options: Opt[];
  value: string;
  onChange: (label: string) => void;
  activeClasses?: Record<string, string>;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.id} role="radio" active={value === o.label} activeClass={activeClasses?.[o.label]} disabled={disabled} onClick={() => onChange(o.label)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

// Reiter als Knopfreihe, am Handy seitlich wischbar.
function TabChips<K extends string>({ label, tabs, value, onChange }: { label: string; tabs: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {tabs.map((t) => (
        <Chip key={t.key} role="tab" active={value === t.key} onClick={() => onChange(t.key)}>
          {t.label}
          {t.count !== undefined && <span className={value === t.key ? "opacity-80" : "text-muted-foreground"}>{t.count}</span>}
        </Chip>
      ))}
    </div>
  );
}

function StatusBadge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap ${STATUS_BADGE[text] ?? "bg-muted text-foreground border-border"}`}>
      {text}
    </span>
  );
}

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
      {required && <span className="text-destructive"> *</span>}
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

// Auswahlliste für verknüpfte Datensätze. Wert ist die Datensatz-ID.
function OptionSelect({ id, value, onChange, options, placeholder, disabled }: { id: string; value: string; onChange: (id: string) => void; options: Opt[]; placeholder: string; disabled?: boolean }) {
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

function Thumb({ fotos, size = "small", className = "w-12 h-12 rounded-md" }: { fotos: Attachment[]; size?: ThumbSize; className?: string }) {
  const first = fotos[0];
  if (!first) {
    return (
      <span className={`${className} shrink-0 bg-muted flex items-center justify-center text-muted-foreground`} aria-label="Kein Foto">
        <ImageOff className="w-5 h-5" aria-hidden />
      </span>
    );
  }
  return <img src={thumb(first, size)} alt="" loading="lazy" className={`${className} shrink-0 object-cover`} />;
}

function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
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
    <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-base">
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0" aria-hidden /> {text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed px-4 py-6 text-center text-base text-muted-foreground">{text}</p>;
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
        <Button variant="ghost" className="h-11 w-11 p-0 shrink-0" aria-label="Schließen">
          <X className="w-6 h-6" aria-hidden />
        </Button>
      </DialogClose>
    </DialogHeader>
  );
}

function DoneButton() {
  return (
    <DialogClose asChild>
      <Button variant="outline" className="w-full h-12 text-base">
        Fertig
      </Button>
    </DialogClose>
  );
}

// Foto aufnehmen oder auswählen, mit Vorschau und Entfernen.
function PhotoPicker({
  files,
  onChange,
  multiple,
  error,
}: {
  files: File[];
  onChange: (f: File[]) => void;
  multiple: boolean;
  error?: string;
}) {
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
          className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-base hover:bg-muted ${
            error ? "border-destructive" : "border-input"
          }`}
        >
          <Camera className="w-8 h-8 text-muted-foreground" aria-hidden />
          <span className="font-medium">Foto aufnehmen oder auswählen</span>
          <span className="text-sm text-muted-foreground">Am Handy öffnet sich Kamera oder Galerie</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square rounded-lg overflow-hidden border">
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label={`Foto ${i + 1} entfernen`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-11 h-11 rounded-full bg-background/90 flex items-center justify-center"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>
          ))}
          {multiple && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-input flex flex-col items-center justify-center gap-1 text-sm hover:bg-muted"
            >
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

const ds = datasource.define({ unikate: "unikate", edition: "edition" });

const unikatSelect = q.select({
  nummer: "T63YN",
  inv: "glG6V",
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  kuenstler: "oDNBh",
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
  seit: "Evxm2",
  rueckgabe: "ENQkk",
});
const unikatUpdateFields = q.select({
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  kuenstler: "oDNBh",
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
  seit: "Evxm2",
  rueckgabe: "ENQkk",
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
});
const editionUpdateFields = q.select({ anzahl: "Ciiwp", lagerort: "T5iQe", notiz: "lyJky" });

const LIST_STEP = 50;
const LOW_STOCK = 5;
const UNDO_MS = 10000;

type Unikat = {
  id: string;
  nummer: number;
  inv: string;
  name: string;
  typ: string;
  status: string;
  kuenstler: Opt | undefined;
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
  seit: string;
  rueckgabe: string;
};

type Edition = {
  id: string;
  modell: string;
  typ: string;
  glasur: string;
  zustand: string;
  anzahl: number;
  lagerort: Opt | undefined;
  fotos: Attachment[];
  notiz: string;
};

type TabKey = "imhaus" | "kommission" | "verkauft" | "alle" | "edition";
type SortKey = "neu" | "name" | "nummer" | "preis" | "lagerort";

// „kommission“ bleibt als Schlüssel, weil Links aus der Übersicht ihn verwenden.
const TABS: { key: TabKey; label: string; match?: (u: Unikat) => boolean }[] = [
  { key: "imhaus", label: "Im Haus", match: (u) => u.status === VERFUEGBAR || u.status === RESERVIERT },
  { key: "kommission", label: "Außer Haus", match: (u) => isAusserHaus(u.status) },
  { key: "verkauft", label: "Verkauft", match: (u) => u.status === VERKAUFT },
  { key: "alle", label: "Alle" },
  { key: "edition", label: "Editionsware" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "neu", label: "Neueste zuerst" },
  { key: "name", label: "Name A–Z" },
  { key: "nummer", label: "Inventarnummer" },
  { key: "preis", label: "Preis absteigend" },
  { key: "lagerort", label: "Lagerort" },
];

const ZUSTAND_FILTER: Opt[] = [
  { id: "", label: "Alle" },
  { id: ROHLING, label: "Rohlinge" },
  { id: GLASIERT, label: "Glasiert" },
];

function initialParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
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
    kuenstler: asOpts(f.kuenstler)[0],
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
    seit: str(f.seit),
    rueckgabe: str(f.rueckgabe),
  };
}

function toEdition(item: RawItem): Edition {
  const f = item.fields;
  return {
    id: item.id,
    modell: asOpts(f.modell)[0]?.label ?? "",
    typ: asOpts(f.typ)[0]?.label ?? "",
    glasur: asOpts(f.glasur)[0]?.label ?? "",
    zustand: asOpts(f.zustand)[0]?.label ?? "",
    anzahl: num(f.anzahl) ?? 0,
    lagerort: asOpts(f.lagerort)[0],
    fotos: asAttachments(f.foto),
    notiz: str(f.notiz),
  };
}

function ortVon(u: Unikat): string {
  return (isAusserHaus(u.status) && u.galerie ? u.galerie.label : u.lagerort?.label) ?? "";
}

function matchesSearch(u: Unikat, term: string): boolean {
  if (!term) return true;
  const hay = [u.name, u.inv, u.typ, u.status, u.kuenstler?.label, u.lagerort?.label, u.galerie?.label, u.notiz, u.masse, ...u.glasur.map((g) => g.label)].join(" ").toLowerCase();
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

function exportUnikate(list: Unikat[]) {
  downloadCsv(
    `unikate-${today()}.csv`,
    ["Inventarnummer", "Name", "Typ", "Status", "Künstler:in", "Jahr", "Glasur", "Maße", "Lagerort", "Partner", "Preis intern (€)", "Auf Website zeigen", "Notiz", "Erfasst am", "Verkauft am"],
    list.map((u) => [
      u.inv,
      u.name,
      u.typ,
      u.status,
      u.kuenstler?.label ?? "",
      u.jahr === null ? "" : String(u.jahr),
      u.glasur.map((g) => g.label).join(", "),
      u.masse,
      u.lagerort?.label ?? "",
      u.galerie?.label ?? "",
      u.preis === null ? "" : String(u.preis),
      u.website ? "ja" : "nein",
      u.notiz,
      formatDate(u.erfasstAm),
      formatDate(u.verkauftAm),
    ]),
  );
}

function exportEdition(list: Edition[]) {
  downloadCsv(
    `editionsbestand-${today()}.csv`,
    ["Modell", "Typ", "Zustand", "Glasur", "Anzahl", "Lagerort", "Notiz"],
    list.map((e) => [e.modell, e.typ, e.zustand, e.glasur, String(e.anzahl), e.lagerort?.label ?? "", e.notiz]),
  );
}

type EditForm = {
  name: string;
  typ: string;
  kuenstlerId: string;
  jahr: string;
  glasurIds: string[];
  masse: string;
  bildnachweis: string;
  preis: string;
  website: boolean;
  verkauftAm: string;
  notiz: string;
};

function UnikatDetail({
  u,
  onClose,
  onSaved,
  lagerorte,
  galerien,
  kuenstler,
  glasuren,
  typen,
  statusListe,
}: {
  u: Unikat;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  lagerorte: Opt[];
  galerien: Opt[];
  kuenstler: Opt[];
  glasuren: Opt[];
  typen: Opt[];
  statusListe: Opt[];
}) {
  const initial: EditForm = {
    name: u.name,
    typ: u.typ,
    kuenstlerId: u.kuenstler?.id ?? "",
    jahr: u.jahr !== null ? String(u.jahr) : "",
    glasurIds: u.glasur.map((g) => g.id),
    masse: u.masse,
    bildnachweis: u.bildnachweis,
    preis: u.preis !== null ? String(u.preis) : "",
    website: u.website,
    verkauftAm: u.verkauftAm.slice(0, 10),
    notiz: u.notiz,
  };
  const [editing, setEditing] = useState(false);
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
    setBusy(true);
    try {
      let fotos: { id?: string; url: string; filename?: string }[] | undefined;
      if (newFiles.length) {
        const results = await uploadAsync(newFiles);
        if (results.some((r) => r.status !== "completed")) throw new Error("Foto konnte nicht hochgeladen werden.");
        fotos = [...results.map((r) => ({ url: r.url as string, filename: r.file.name })), ...u.fotos.map((a) => ({ id: a.id, url: a.url, filename: a.filename }))];
      }
      await update.mutateAsync({
        recordId: u.id,
        fields: {
          name: form.name.trim(),
          typ: form.typ,
          kuenstler: link(form.kuenstlerId),
          jahr: parseNumber(form.jahr),
          glasur: form.glasurIds,
          masse: form.masse.trim(),
          bildnachweis: form.bildnachweis.trim(),
          preis,
          website: form.website,
          verkauftAm: form.verkauftAm || null,
          notiz: form.notiz.trim(),
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
    ["Künstler:in", u.kuenstler?.label ?? ""],
    ["Jahr", u.jahr !== null ? String(u.jahr) : ""],
    ["Glasur", u.glasur.map((g) => g.label).join(", ")],
    ["Maße", u.masse],
    ["Außer Haus seit", formatDate(u.seit)],
    ["Auf Website zeigen", u.website ? "ja" : "nein"],
    ["Verkauft am", formatDate(u.verkauftAm)],
    ["Bildnachweis", u.bildnachweis],
    ["Erfasst", [formatDate(u.erfasstAm), u.erfasstVon].filter(Boolean).join(", von ")],
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-3xl`}>
        <PanelHeader title={u.name || "Ohne Namen"} description={[u.inv, u.typ, u.preis !== null ? euro.format(u.preis) : ""].filter(Boolean).join(" · ")} />
        <div className="px-4 pb-8 space-y-6" lang="de">
          {!update.enabled && <StatusBadge text={u.status} />}
          {update.enabled && !editing && (
            <section className="rounded-xl border p-4 space-y-4" aria-labelledby="schnell-titel">
              <h3 id="schnell-titel" className="text-base font-semibold">
                Schnell ändern <span className="font-normal text-muted-foreground">· wird sofort gespeichert</span>
              </h3>
              <div>
                <FieldLabel>Status</FieldLabel>
                <ChoiceChips label="Status" options={statusListe} value={u.status} onChange={changeStatus} activeClasses={STATUS_ACTIVE} disabled={busy} />
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
                    <Input
                      id="d-rueckgabe"
                      type="date"
                      disabled={busy}
                      defaultValue={u.rueckgabe.slice(0, 10)}
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v === u.rueckgabe.slice(0, 10)) return;
                        quickSave({ rueckgabe: v || null }, `Rückgabe bis: ${v ? formatDate(v) : "offen"}`, { rueckgabe: u.rueckgabe ? u.rueckgabe.slice(0, 10) : null });
                      }}
                      className="h-12 text-base"
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
                  <Button
                    variant="outline"
                    className="h-11 text-base"
                    onClick={() => {
                      const fields = undo.fields;
                      setUndo(null);
                      quickSave(fields, "Rückgängig gemacht");
                    }}
                  >
                    Rückgängig
                  </Button>
                </div>
              )}
            </section>
          )}

          {!editing && (
            <>
              {photo ? (
                <div className="space-y-2">
                  <img src={thumb(photo, "large")} alt={u.name} className="w-full max-h-64 object-contain rounded-xl bg-muted" />
                  {u.fotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {u.fotos.map((a, i) => (
                        <button key={a.id ?? a.url} type="button" aria-label={`Foto ${i + 1} zeigen`} onClick={() => setPhotoIndex(i)} className={`shrink-0 rounded-md overflow-hidden border-2 ${i === photoIndex ? "border-primary" : "border-transparent"}`}>
                          <img src={thumb(a, "small")} alt="" className="w-16 h-16 object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-24 rounded-xl bg-muted flex items-center justify-center gap-2 text-muted-foreground">
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
              <div className="flex flex-col gap-3">
                {update.enabled && (
                  <Button className="h-12 text-base" onClick={() => setEditing(true)}>
                    <Pencil className="w-5 h-5 mr-2" aria-hidden /> Alle Angaben bearbeiten
                  </Button>
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
                <Input id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-12 text-base" aria-invalid={!!formError.name} />
                <ErrorText>{formError.name}</ErrorText>
              </div>
              <div>
                <FieldLabel>Typ</FieldLabel>
                <ChoiceChips label="Typ" options={typen} value={form.typ} onChange={(v) => set("typ", v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-preis">Preis intern (€)</FieldLabel>
                  <Input id="d-preis" inputMode="decimal" value={form.preis} onChange={(e) => set("preis", e.target.value)} placeholder="z. B. 480" className="h-12 text-base" aria-invalid={!!formError.preis} />
                  <ErrorText>{formError.preis}</ErrorText>
                </div>
                <label htmlFor="d-website" className="flex items-center justify-between gap-4 rounded-lg border p-4 min-h-12 cursor-pointer self-start sm:mt-8">
                  <span className="text-base font-medium">Auf Website zeigen</span>
                  <Switch id="d-website" className="scale-125 data-[state=unchecked]:bg-zinc-300" checked={form.website} onCheckedChange={(v) => set("website", v)} />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-kuenstler">Künstler:in</FieldLabel>
                  <OptionSelect id="d-kuenstler" value={form.kuenstlerId} onChange={(v) => set("kuenstlerId", v)} options={kuenstler} placeholder="Bitte wählen" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-jahr">Jahr</FieldLabel>
                  <Input id="d-jahr" inputMode="numeric" value={form.jahr} onChange={(e) => set("jahr", e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-12 text-base" />
                </div>
              </div>
              <div>
                <FieldLabel>Glasur</FieldLabel>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Glasur">
                  {glasuren.map((g) => {
                    const active = form.glasurIds.includes(g.id);
                    return (
                      <Chip key={g.id} active={active} onClick={() => set("glasurIds", active ? form.glasurIds.filter((x) => x !== g.id) : [...form.glasurIds, g.id])}>
                        {g.label}
                      </Chip>
                    );
                  })}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-masse">Maße</FieldLabel>
                  <Input id="d-masse" value={form.masse} onChange={(e) => set("masse", e.target.value)} placeholder="z. B. Ø 24 × H 8 cm" className="h-12 text-base" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-verkauft">Verkauft am</FieldLabel>
                  <input id="d-verkauft" type="date" value={form.verkauftAm} onChange={(e) => set("verkauftAm", e.target.value)} className={INPUT_CLASS} />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="d-bildnachweis">Bildnachweis</FieldLabel>
                <Input id="d-bildnachweis" value={form.bildnachweis} onChange={(e) => set("bildnachweis", e.target.value)} className="h-12 text-base" />
              </div>
              <div>
                <FieldLabel htmlFor="d-notiz">Notiz</FieldLabel>
                <Textarea id="d-notiz" rows={3} value={form.notiz} onChange={(e) => set("notiz", e.target.value)} className="text-base" />
              </div>
              <div>
                <FieldLabel htmlFor="foto-input">Fotos hinzufügen</FieldLabel>
                <PhotoPicker files={newFiles} onChange={setNewFiles} multiple />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-12 flex-1 text-base"
                  disabled={busy}
                  onClick={() => {
                    setForm(initial);
                    setFormError({});
                    setNewFiles([]);
                    setEditing(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button className="h-12 flex-1 text-base" disabled={busy} onClick={saveAll}>
                  {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : <Check className="w-5 h-5 mr-2" aria-hidden />}
                  Speichern
                </Button>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditionRow({ e, busy, canEdit, onAdjust, onOpen }: { e: Edition; busy: boolean; canEdit: boolean; onAdjust: (delta: number) => void; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 min-w-0">
        <ListRow fotos={e.fotos} title={e.modell} sub={[e.zustand, e.glasur, e.lagerort?.label ?? "Kein Lagerort"].filter(Boolean).join(" · ")} onClick={onOpen} />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {canEdit && (
          <Button variant="outline" className="h-11 w-11 p-0" aria-label={`${e.modell}: eins weniger`} disabled={busy || e.anzahl <= 0} onClick={() => onAdjust(-1)}>
            <Minus className="w-5 h-5" aria-hidden />
          </Button>
        )}
        <span className={`w-12 text-center text-lg font-semibold tabular-nums ${e.anzahl < LOW_STOCK ? "text-amber-800" : ""}`} aria-label={`Anzahl ${e.anzahl}`}>
          {e.anzahl}
        </span>
        {canEdit && (
          <Button variant="outline" className="h-11 w-11 p-0" aria-label={`${e.modell}: eins mehr`} disabled={busy} onClick={() => onAdjust(1)}>
            <Plus className="w-5 h-5" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

function EditionDetail({ e, onClose, onSave, lagerorte, canEdit }: { e: Edition; onClose: () => void; onSave: (fields: { anzahl: number; lagerort: string[]; notiz: string }) => Promise<void>; lagerorte: Opt[]; canEdit: boolean }) {
  const [anzahl, setAnzahl] = useState(String(e.anzahl));
  const [lagerortId, setLagerortId] = useState(e.lagerort?.id ?? "");
  const [notiz, setNotiz] = useState(e.notiz);
  const [busy, setBusy] = useState(false);
  const value = Number(anzahl) || 0;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-lg`}>
        <PanelHeader title={e.modell} description={[e.typ, e.zustand, e.glasur].filter(Boolean).join(" · ")} />
        <div className="px-4 pb-8 space-y-6">
          {e.fotos[0] && <img src={thumb(e.fotos[0], "large")} alt={e.modell} className="w-full max-h-72 object-contain rounded-xl bg-muted" />}
          <div>
            <FieldLabel htmlFor="ed-anzahl">Anzahl</FieldLabel>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-12 w-12" aria-label="Eins weniger" disabled={!canEdit} onClick={() => setAnzahl(String(Math.max(0, value - 1)))}>
                <Minus className="w-5 h-5" aria-hidden />
              </Button>
              <Input id="ed-anzahl" inputMode="numeric" disabled={!canEdit} value={anzahl} onChange={(ev) => setAnzahl(ev.target.value.replace(/\D/g, ""))} className="h-12 w-24 text-center text-lg" />
              <Button variant="outline" className="h-12 w-12" aria-label="Eins mehr" disabled={!canEdit} onClick={() => setAnzahl(String(value + 1))}>
                <Plus className="w-5 h-5" aria-hidden />
              </Button>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="ed-lagerort">Lagerort</FieldLabel>
            <OptionSelect id="ed-lagerort" value={lagerortId} disabled={!canEdit} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
          </div>
          <div>
            <FieldLabel htmlFor="ed-notiz">Notiz</FieldLabel>
            <Textarea id="ed-notiz" rows={3} disabled={!canEdit} value={notiz} onChange={(ev) => setNotiz(ev.target.value)} className="text-base" />
          </div>
          {canEdit && (
            <Button
              className="w-full h-12 text-base"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onSave({ anzahl: value, lagerort: link(lagerortId), notiz: notiz.trim() });
                setBusy(false);
              }}
            >
              {busy ? "Wird gespeichert …" : "Änderungen speichern"}
            </Button>
          )}
          <DoneButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Block() {
  const [tab, setTab] = useState<TabKey>(() => {
    const t = initialParam("tab");
    return TABS.some((x) => x.key === t) ? (t as TabKey) : "imhaus";
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("neu");
  const [typFilter, setTypFilter] = useState("");
  const [selectedId, setSelectedId] = useState(() => initialParam("id"));
  const [editionId, setEditionId] = useState("");
  const [zustandFilter, setZustandFilter] = useState("");
  const [limit, setLimit] = useState(LIST_STEP);
  const [pendingEdition, setPendingEdition] = useState("");

  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);

  const editionUpdate = useRecordUpdate({ from: ds.edition, fields: editionUpdateFields });
  const typen = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "typ" }).options as Opt[];
  const statusListe = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "status" }).options as Opt[];
  const lagerorte = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "lagerort", sortOrder: "ASC" }).data as LinkedPages);
  const galerien = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "galerie", sortOrder: "ASC" }).data as LinkedPages);
  const kuenstler = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "kuenstler", sortOrder: "ASC" }).data as LinkedPages);
  const glasuren = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "glasur", sortOrder: "ASC" }).data as LinkedPages);

  const unikate = useMemo(() => (unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toUnikat(i as RawItem)), [unikateQuery.data]);
  const editionen = useMemo(() => (editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toEdition(i as RawItem)), [editionQuery.data]);

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const term = search.trim();
  const visible = useMemo(
    () =>
      unikate
        .filter((u) => (activeTab.match ? activeTab.match(u) : true) && (!typFilter || u.typ === typFilter) && matchesSearch(u, term))
        .sort((a, b) => compare(a, b, sort)),
    [unikate, activeTab, typFilter, term, sort],
  );
  const visibleEdition = editionen
    .filter((e) => (zustandFilter ? (zustandFilter === ROHLING ? e.zustand === ROHLING : e.zustand !== ROHLING) : true))
    .filter((e) => !term || [e.modell, e.glasur, e.zustand, e.typ, e.lagerort?.label, e.notiz].join(" ").toLowerCase().includes(term.toLowerCase()))
    .sort((a, b) => a.modell.localeCompare(b.modell, "de") || a.zustand.localeCompare(b.zustand, "de"));

  const tabs = useMemo(
    () => TABS.map((t) => ({ key: t.key, label: t.label, count: t.key === "edition" ? editionen.length : unikate.filter((u) => (t.match ? t.match(u) : true)).length })),
    [unikate, editionen],
  );

  const selected = unikate.find((u) => u.id === selectedId);
  const selectedEdition = editionen.find((e) => e.id === editionId);
  const isEdition = tab === "edition";
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const stueckGesamt = visibleEdition.reduce((n, e) => n + e.anzahl, 0);

  async function adjustEdition(e: Edition, delta: number) {
    setPendingEdition(e.id);
    const neu = Math.max(0, e.anzahl + delta);
    try {
      await editionUpdate.mutateAsync({ recordId: e.id, fields: { anzahl: neu } } as never);
      await editionQuery.refetch();
      toast.success(`${e.modell}${e.glasur ? ` · ${e.glasur}` : ""}: ${e.anzahl} → ${neu}`, {
        duration: 6000,
        action: {
          label: "Rückgängig",
          onClick: async () => {
            await editionUpdate.mutateAsync({ recordId: e.id, fields: { anzahl: e.anzahl } } as never);
            await editionQuery.refetch();
          },
        },
      });
    } catch {
      toast.error("Anzahl konnte nicht gespeichert werden.");
    } finally {
      setPendingEdition("");
    }
  }

  async function saveEdition(e: Edition, fields: { anzahl: number; lagerort: string[]; notiz: string }) {
    try {
      await editionUpdate.mutateAsync({ recordId: e.id, fields } as never);
      await editionQuery.refetch();
      toast.success("Änderungen gespeichert.");
      setEditionId("");
    } catch {
      toast.error("Speichern hat nicht geklappt.");
    }
  }

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-5" lang="de">
        <PageHeader
          title="Bestand"
          description={isEdition ? `${zahl.format(visibleEdition.length)} Zeilen · ${zahl.format(stueckGesamt)} Stück` : `${zahl.format(visible.length)} von ${zahl.format(unikate.length)} Unikaten`}
          actions={
            <>
              <Button asChild variant="ghost" className="h-11 text-base">
                <a href="/tabelle">
                  <Table2 className="w-5 h-5 mr-2" aria-hidden /> Alles als Tabelle <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
                </a>
              </Button>
              <Button variant="outline" className="h-11 text-base" onClick={() => (isEdition ? exportEdition(visibleEdition) : exportUnikate(visible))} disabled={isEdition ? visibleEdition.length === 0 : visible.length === 0}>
                <Download className="w-5 h-5 mr-2" aria-hidden /> CSV-Export
              </Button>
            </>
          }
        />

        <TabChips
          label="Bestand"
          tabs={tabs}
          value={tab}
          onChange={(key) => {
            setTab(key);
            setLimit(LIST_STEP);
          }}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" aria-label="Suche" placeholder={isEdition ? "Suchen: Modell, Glasur" : "Suchen: Name, Nummer, Glasur, Ort"} value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-10 text-base" />
          </div>
          {isEdition ? (
            <ChoiceChips label="Zustand" options={ZUSTAND_FILTER} value={ZUSTAND_FILTER.find((z) => z.id === zustandFilter)?.label ?? "Alle"} onChange={(label) => setZustandFilter(ZUSTAND_FILTER.find((z) => z.label === label)?.id ?? "")} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <select aria-label="Typ" value={typFilter} onChange={(e) => setTypFilter(e.target.value)} className={`${INPUT_CLASS} sm:w-40`}>
                <option value="">Alle Typen</option>
                {typen.map((t) => (
                  <option key={t.id} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select aria-label="Sortierung" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${INPUT_CLASS} sm:w-48`}>
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {failed ? (
          <ErrorState text="Der Bestand konnte nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Bestand wird geladen …" />
        ) : isEdition ? (
          visibleEdition.length === 0 ? (
            <EmptyState text="Keine Editionsware gefunden." />
          ) : (
            <div className="rounded-xl border bg-card px-3 divide-y">
              {visibleEdition.map((e) => (
                <EditionRow key={e.id} e={e} busy={pendingEdition === e.id} canEdit={editionUpdate.enabled} onAdjust={(d) => adjustEdition(e, d)} onOpen={() => setEditionId(e.id)} />
              ))}
            </div>
          )
        ) : visible.length === 0 ? (
          <div className="space-y-3 text-center">
            <EmptyState text="Keine Stücke gefunden." />
            {(search || typFilter) && (
              <Button
                variant="outline"
                className="h-11 text-base"
                onClick={() => {
                  setSearch("");
                  setTypFilter("");
                }}
              >
                Suche und Filter zurücksetzen
              </Button>
            )}
          </div>
        ) : (
          <>
            <ul className="rounded-xl border bg-card px-3 divide-y">
              {visible.slice(0, limit).map((u) => (
                <li key={u.id}>
                  <ListRow
                    fotos={u.fotos}
                    title={u.name || "Ohne Namen"}
                    sub={[u.inv, u.typ, ortVon(u) || "Kein Lagerort"].filter(Boolean).join(" · ")}
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
            {visible.length > limit && (
              <div className="flex justify-center">
                <Button variant="outline" className="h-12 text-base" onClick={() => setLimit((l) => l + LIST_STEP)}>
                  Weitere {Math.min(LIST_STEP, visible.length - limit)} anzeigen
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <UnikatDetail
          key={selected.id}
          u={selected}
          onClose={() => setSelectedId("")}
          onSaved={() => unikateQuery.refetch()}
          lagerorte={lagerorte}
          galerien={galerien}
          kuenstler={kuenstler}
          glasuren={glasuren}
          typen={typen}
          statusListe={statusListe}
        />
      )}
      {selectedEdition && <EditionDetail key={selectedEdition.id} e={selectedEdition} canEdit={editionUpdate.enabled} onClose={() => setEditionId("")} onSave={(fields) => saveEdition(selectedEdition, fields)} lagerorte={lagerorte} />}
    </div>
  );
}

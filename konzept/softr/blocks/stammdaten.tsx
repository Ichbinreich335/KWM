// Generiert von konzept/softr/build.mjs aus src/blocks/stammdaten.tsx und src/shared/. Nicht von Hand ändern.
import { useEffect, useMemo, useRef, useState } from "react";
import { datasource, q, useFieldOptions, useRecordCreate, useRecordDelete, useRecords, useRecordUpdate, useUpload } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Archive, ArchiveRestore, Camera, Check, ChevronDown, ChevronRight, ImageOff, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 100;
const VERFUEGBAR = "verfügbar";
const RESERVIERT = "reserviert";
const VERKAUFT = "verkauft";
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const AUSSER_HAUS_ORT = "Außer Haus";

// Farbpunkt je Status, in Auswahlknöpfen, Badges und Tabellenköpfen dieselbe Farbe.
const STATUS_DOT: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-600",
  [RESERVIERT]: "bg-amber-500",
  [VERKAUFT]: "bg-zinc-400",
  [KOMMISSION]: "bg-sky-600",
  [AUSGESTELLT]: "bg-violet-600",
};

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

function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

const DIALOG_CLASS = "w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 [&>button:last-child]:hidden";

// md:text-base hebt das md:text-sm der shadcn-Felder auf, damit Eingabe und Auswahlliste gleich groß schreiben.
const FIELD_CLASS = "h-12 rounded-md text-base md:text-base";

const TEXTAREA_CLASS = "rounded-md text-base md:text-base";
const PANEL_CLASS = "rounded-lg border bg-card";
const CHIP_BASE = "inline-flex items-center justify-center gap-2 min-h-11 px-3.5 rounded-md border text-base whitespace-nowrap transition-colors disabled:opacity-60";
const CHIP_IDLE = "bg-background hover:bg-muted border-input";
const CHIP_ACTIVE = "bg-primary text-primary-foreground border-primary";

function StatusDot({ status }: { status: string }) {
  const color = STATUS_DOT[status];
  return color ? <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${color}`} aria-hidden /> : null;
}

// Ein einzelner Auswahl-Knopf für Formulare. Gewählt ist immer die Hauptfarbe mit Haken.
function Chip({ active, onClick, children, disabled, role }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; role?: "radio" }) {
  const state = role === "radio" ? { "aria-checked": active } : { "aria-pressed": active };
  return (
    <button type="button" role={role} {...state} disabled={disabled} onClick={onClick} className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}>
      {active && <Check className="w-4 h-4" aria-hidden />}
      {children}
    </button>
  );
}

// Einfachauswahl als Knopfreihe, z. B. Status, Typ, Zustand. Wert ist das Label. withDots zeigt die Statusfarbe als Punkt.
function ChoiceChips({ label, options, value, onChange, withDots, disabled }: { label: string; options: Opt[]; value: string; onChange: (label: string) => void; withDots?: boolean; disabled?: boolean }) {
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

// Reiter für getrennte Bereiche einer Seite (Stammdaten). Unterstrichen, am Handy seitlich wischbar.
function Tabs<K extends string>({ label, tabs, value, onChange }: { label: string; tabs: { key: K; label: string; count?: number }[]; value: K; onChange: (key: K) => void }) {
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

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
      {required && <span className="text-destructive"> *</span>}
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
      <Input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`${FIELD_CLASS} pl-10`} />
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

function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
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
        <Button variant="ghost" className="h-11 w-11 p-0 shrink-0" aria-label="Schließen">
          <X className="w-6 h-6" aria-hidden />
        </Button>
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

const ds = datasource.define({
  kuenstler: "kuenstler",
  glasuren: "glasuren",
  modelle: "modelle",
  partner: "partner",
  lagerorte: "lagerorte",
  unikate: "unikate",
  edition: "edition",
});

const kuenstlerSelect = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const glasurSelect = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const modellSelect = q.select({ name: "eXo5w", typ: "gCX7K", masse: "h65qx", foto: "GbUfa", archiviert: "3tlrw" });
const partnerSelect = q.select({ name: "a4yfc", art: "ZS9HU", ort: "RQRec", kontakt: "lnhez", zusammenarbeit: "uEfkz", notiz: "8pLh8", archiviert: "24Tn9" });
const lagerortSelect = q.select({ name: "AoOjs", bereich: "5h1mS", archiviert: "kMBsy" });
const unikatLinks = q.select({ kuenstler: "oDNBh", glasur: "ByeH3", lagerort: "EkVC3", galerie: "NfsXv" });
const editionLinks = q.select({ modell: "jxN6x", glasur: "pbGEk", lagerort: "T5iQe" });

const SEARCH_FROM = 10;

type KatKey = "kuenstler" | "glasuren" | "modelle" | "partner" | "lagerorte";
type FieldDef = { key: string; label: string; kind: "text" | "textarea" | "chips"; required?: boolean; placeholder?: string; options?: Opt[] };
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
  locked?: (e: Entry) => string | undefined;
  save: (id: string | null, values: Values, fotos: Attachment[] | undefined) => Promise<void>;
  archive: (id: string, archiviert: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

function toEntry(item: RawItem, keys: string[], sub: (v: Values) => string, fotoKey?: string): Entry {
  const f = item.fields;
  const values: Values = {};
  keys.forEach((k) => (values[k] = asOpts(f[k]).length ? firstLabel(f[k]) : str(f[k])));
  return { id: item.id, name: values.name ?? "", values, fotos: fotoKey ? asAttachments(f[fotoKey]) : [], sub: sub(values), archiviert: f.archiviert === true };
}

function countLinks(items: RawItem[], keys: string[]): Map<string, number> {
  const map = new Map<string, number>();
  items.forEach((i) => keys.forEach((k) => asOpts(i.fields[k]).forEach((o) => map.set(`${k}:${o.id}`, (map.get(`${k}:${o.id}`) ?? 0) + 1))));
  return map;
}

function EntryDialog({ kat, entry, onClose }: { kat: Kategorie; entry: Entry | null; onClose: () => void }) {
  const [values, setValues] = useState<Values>(() => Object.fromEntries(kat.fields.map((f) => [f.key, entry?.values[f.key] ?? ""])));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
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
    } catch {
      toast.error("Das hat nicht geklappt. Bitte erneut versuchen.");
      setBusy(false);
    }
  }
  const name = (values.name ?? "").trim();
  const duplicate = kat.entries.find((e) => e.id !== entry?.id && e.name.trim().toLowerCase() === name.toLowerCase());

  async function save() {
    if (!name) {
      setError("Bitte einen Namen eingeben.");
      return;
    }
    if (duplicate) {
      setError(`„${duplicate.name}“ gibt es schon.`);
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
        <div className="px-4 pb-8 space-y-5" lang="de">
          {kat.fields.map((f) => (
            <div key={f.key}>
              <FieldLabel htmlFor={`f-${f.key}`} required={f.required}>
                {f.label}
              </FieldLabel>
              {f.kind === "chips" ? (
                <ChoiceChips label={f.label} options={f.options ?? []} value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: s[f.key] === v ? "" : v }))} />
              ) : f.kind === "textarea" ? (
                <Textarea id={`f-${f.key}`} rows={3} value={values[f.key]} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))} className={TEXTAREA_CLASS} />
              ) : (
                <Input
                  id={`f-${f.key}`}
                  value={values[f.key]}
                  disabled={f.key === "name" && !!lockedReason}
                  placeholder={f.placeholder}
                  onChange={(e) => {
                    setValues((s) => ({ ...s, [f.key]: e.target.value }));
                    setError("");
                  }}
                  className={FIELD_CLASS}
                />
              )}
              {f.key === "name" && lockedReason && <Hint>{lockedReason}</Hint>}
              {f.key === "name" && <ErrorText>{error}</ErrorText>}
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
            <Button variant="outline" className="h-12 flex-1 text-base" disabled={busy} onClick={onClose}>
              Abbrechen
            </Button>
            <Button className="h-12 flex-1 text-base" disabled={busy || !name} onClick={save}>
              {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : <Check className="w-5 h-5 mr-2" aria-hidden />}
              {entry ? "Speichern" : "Anlegen"}
            </Button>
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
                    <Button variant="destructive" className="h-11 text-base" disabled={busy} onClick={() => act(() => kat.remove(entry.id), `„${entry.name}“ gelöscht.`)}>
                      Endgültig löschen
                    </Button>
                    <Button variant="ghost" className="h-11 text-base" disabled={busy} onClick={() => setConfirmDelete(false)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="h-11 text-base"
                    disabled={busy}
                    onClick={() => act(() => kat.archive(entry.id, !entry.archiviert), entry.archiviert ? `„${entry.name}“ wiederhergestellt.` : `„${entry.name}“ archiviert.`)}
                  >
                    {entry.archiviert ? <ArchiveRestore className="w-5 h-5 mr-2" aria-hidden /> : <Archive className="w-5 h-5 mr-2" aria-hidden />}
                    {entry.archiviert ? "Wiederherstellen" : "Archivieren"}
                  </Button>
                  {inUse === 0 && (
                    <Button variant="ghost" className="h-11 text-base text-destructive hover:text-destructive" disabled={busy} onClick={() => setConfirmDelete(true)}>
                      <Trash2 className="w-5 h-5 mr-2" aria-hidden /> Löschen
                    </Button>
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
  const partnerArten = useFieldOptions({ from: ds.partner, select: partnerSelect, field: "art" }).options as Opt[];
  const zusammenarbeit = useFieldOptions({ from: ds.partner, select: partnerSelect, field: "zusammenarbeit" }).options as Opt[];
  const bereiche = useFieldOptions({ from: ds.lagerorte, select: lagerortSelect, field: "bereich" }).options as Opt[];

  const items = (query: { data?: { pages: { items: unknown[] }[] } }) => (query.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[];
  const usage = useMemo(() => {
    const u = countLinks((unikatQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[], ["kuenstler", "glasur", "lagerort", "galerie"]);
    const e = countLinks((editionQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[], ["modell", "glasur", "lagerort"]);
    return (key: string, id: string, source: "u" | "e") => (source === "u" ? u : e).get(`${key}:${id}`) ?? 0;
  }, [unikatQuery.data, editionQuery.data]);

  const stueck = (n: number, eins: string, mehrere: string) => (n === 0 ? `noch bei keinem ${eins}` : `bei ${zahl.format(n)} ${n === 1 ? eins : mehrere}`);

  async function run<T>(mutation: { mutateAsync: (v: never) => Promise<T> }, payload: unknown, refetch: () => unknown) {
    await mutation.mutateAsync(payload as never);
    await refetch();
  }
  const archiveVia = (mutation: { mutateAsync: (v: never) => Promise<unknown> }, refetch: () => unknown) => (id: string, archiviert: boolean) => run(mutation, { recordId: id, fields: { archiviert } }, refetch);
  const removeVia = (mutation: { mutateAsync: (v: never) => Promise<unknown> }, refetch: () => unknown) => (id: string) => run(mutation, id, refetch);

  const kategorien: Kategorie[] = [
    {
      key: "kuenstler",
      label: "Künstler:innen",
      singular: "Künstler:in",
      hint: "Wer ein Unikat gefertigt hat. Erscheint als Auswahl beim Erfassen.",
      fields: [{ key: "name", label: "Name", kind: "text", required: true, placeholder: "Vor- und Nachname" }],
      entries: items(kuenstlerQuery).map((i) => toEntry(i, ["name"], () => "")),
      usage: (id) => `${stueck(usage("kuenstler", id, "u"), "Unikat", "Unikaten")}`,
      usageCount: (id) => usage("kuenstler", id, "u"),
      archive: archiveVia(kuenstlerUpdate, kuenstlerQuery.refetch),
      remove: removeVia(kuenstlerDelete, kuenstlerQuery.refetch),
      save: (id, v) => run(id ? kuenstlerUpdate : kuenstlerCreate, id ? { recordId: id, fields: { name: v.name } } : { name: v.name }, kuenstlerQuery.refetch),
    },
    {
      key: "glasuren",
      label: "Glasuren",
      singular: "Glasur",
      hint: "Glasurname für Unikate und Editionsware.",
      fields: [{ key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Seladon Nebel" }],
      entries: items(glasurQuery).map((i) => toEntry(i, ["name"], () => "")),
      usage: (id) => `${stueck(usage("glasur", id, "u"), "Unikat", "Unikaten")} · ${stueck(usage("glasur", id, "e"), "Editionsposten", "Editionsposten")}`,
      usageCount: (id) => usage("glasur", id, "u") + usage("glasur", id, "e"),
      archive: archiveVia(glasurUpdate, glasurQuery.refetch),
      remove: removeVia(glasurDelete, glasurQuery.refetch),
      save: (id, v) => run(id ? glasurUpdate : glasurCreate, id ? { recordId: id, fields: { name: v.name } } : { name: v.name }, glasurQuery.refetch),
    },
    {
      key: "modelle",
      label: "Modelle",
      singular: "Modell",
      hint: "Formen der Editionsware. Erscheinen als Auswahl beim Erfassen von Editionsware.",
      fields: [
        { key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Becher „Salbei“ 300 ml" },
        { key: "typ", label: "Typ", kind: "chips", options: modellTypen },
        { key: "masse", label: "Maße", kind: "text", placeholder: "z. B. Ø 8 × H 10 cm" },
      ],
      foto: true,
      entries: items(modellQuery).map((i) => toEntry(i, ["name", "typ", "masse"], (v) => [v.typ, v.masse].filter(Boolean).join(" · "), "foto")),
      usage: (id) => stueck(usage("modell", id, "e"), "Editionsposten", "Editionsposten"),
      usageCount: (id) => usage("modell", id, "e"),
      archive: archiveVia(modellUpdate, modellQuery.refetch),
      remove: removeVia(modellDelete, modellQuery.refetch),
      save: (id, v, fotos) => {
        const fields = { name: v.name, typ: v.typ || null, masse: v.masse.trim(), ...(fotos ? { foto: fotos } : {}) };
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
      usage: (id) => `zurzeit ${stueck(usage("galerie", id, "u"), "Unikat", "Unikaten")}`,
      usageCount: (id) => usage("galerie", id, "u"),
      archive: archiveVia(partnerUpdate, partnerQuery.refetch),
      remove: removeVia(partnerDelete, partnerQuery.refetch),
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
      remove: removeVia(lagerortDelete, lagerortQuery.refetch),
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
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
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
    <div className="container pt-6 pb-28 sm:pb-8">
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
          <Button className="h-11 text-base" onClick={() => setDialog({ entry: null })}>
            <Plus className="w-5 h-5 mr-2" aria-hidden /> {kat.singular} anlegen
          </Button>
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
                <Button variant="ghost" className="h-11 px-2 text-base text-muted-foreground" aria-expanded={showArchived} onClick={() => setShowArchived((v) => !v)}>
                  <ChevronDown className={`w-5 h-5 mr-1 transition-transform ${showArchived ? "rotate-180" : ""}`} aria-hidden />
                  Archiviert ({zahl.format(archiviert.length)})
                </Button>
                {showArchived && rows(archiviert)}
              </div>
            )}
          </>
        )}
      </div>
      {dialog && <EntryDialog key={dialog.entry?.id ?? "neu"} kat={kat} entry={dialog.entry} onClose={() => setDialog(null)} />}
    </div>
  );
}

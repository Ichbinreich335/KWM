// Generiert von konzept/softr/build.mjs aus src/blocks/stammdaten.tsx und src/shared/. Nicht von Hand ändern.
import { useEffect, useMemo, useRef, useState } from "react";
import { datasource, q, useFieldOptions, useRecordCreate, useRecords, useRecordUpdate, useUpload } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Camera, Check, ChevronRight, ImageOff, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 100;
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

function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

const DIALOG_CLASS = "w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto [&>button:last-child]:hidden";
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

const ds = datasource.define({
  kuenstler: "kuenstler",
  glasuren: "glasuren",
  modelle: "modelle",
  partner: "partner",
  lagerorte: "lagerorte",
  unikate: "unikate",
  edition: "edition",
});

const kuenstlerSelect = q.select({ name: "vqD0c" });
const glasurSelect = q.select({ name: "OuhBi" });
const modellSelect = q.select({ name: "eXo5w", typ: "gCX7K", masse: "h65qx", foto: "GbUfa" });
const partnerSelect = q.select({ name: "a4yfc", art: "ZS9HU", ort: "RQRec", kontakt: "lnhez", zusammenarbeit: "uEfkz", notiz: "8pLh8" });
const lagerortSelect = q.select({ name: "AoOjs", bereich: "5h1mS" });
const unikatLinks = q.select({ kuenstler: "oDNBh", glasur: "ByeH3", lagerort: "EkVC3", galerie: "NfsXv" });
const editionLinks = q.select({ modell: "jxN6x", glasur: "pbGEk", lagerort: "T5iQe" });

const SEARCH_FROM = 10;

type KatKey = "kuenstler" | "glasuren" | "modelle" | "partner" | "lagerorte";
type FieldDef = { key: string; label: string; kind: "text" | "textarea" | "chips"; required?: boolean; placeholder?: string; options?: Opt[] };
type Entry = { id: string; name: string; values: Record<string, string>; fotos: Attachment[]; sub: string };
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
  locked?: (e: Entry) => string | undefined;
  save: (id: string | null, values: Values, fotos: Attachment[] | undefined) => Promise<void>;
};

function toEntry(item: RawItem, keys: string[], sub: (v: Values) => string, fotoKey?: string): Entry {
  const f = item.fields;
  const values: Values = {};
  keys.forEach((k) => (values[k] = asOpts(f[k]).length ? firstLabel(f[k]) : str(f[k])));
  return { id: item.id, name: values.name ?? "", values, fotos: fotoKey ? asAttachments(f[fotoKey]) : [], sub: sub(values) };
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
  const { uploadAsync } = useUpload();
  const lockedReason = entry ? kat.locked?.(entry) : undefined;
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
                <Textarea id={`f-${f.key}`} rows={3} value={values[f.key]} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))} className="text-base" />
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
                  className="h-12 text-base"
                />
              )}
              {f.key === "name" && lockedReason && <Hint>{lockedReason}</Hint>}
              {f.key === "name" && <ErrorText>{error}</ErrorText>}
            </div>
          ))}
          {kat.foto && (
            <div>
              <FieldLabel htmlFor="foto-input">{entry?.fotos.length ? "Foto ersetzen" : "Foto"}</FieldLabel>
              {entry?.fotos[0] && files.length === 0 && <img src={entry.fotos[0].url} alt={entry.name} className="w-full max-h-48 object-contain rounded-xl bg-muted mb-3" />}
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
          <p className="text-sm text-muted-foreground">Löschen ist nicht vorgesehen, damit bestehende Stücke ihre Angaben behalten.</p>
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

  const stueck = (n: number, wort: string) => (n === 0 ? `noch bei keinem ${wort}` : `bei ${zahl.format(n)} ${wort}${n === 1 ? "" : "en"}`);

  async function run<T>(mutation: { mutateAsync: (v: never) => Promise<T> }, payload: unknown, refetch: () => unknown) {
    await mutation.mutateAsync(payload as never);
    await refetch();
  }

  const kategorien: Kategorie[] = [
    {
      key: "kuenstler",
      label: "Künstler:innen",
      singular: "Künstler:in",
      hint: "Wer ein Unikat gefertigt hat. Erscheint als Auswahl beim Erfassen.",
      fields: [{ key: "name", label: "Name", kind: "text", required: true, placeholder: "Vor- und Nachname" }],
      entries: items(kuenstlerQuery).map((i) => toEntry(i, ["name"], () => "")),
      usage: (id) => `${stueck(usage("kuenstler", id, "u"), "Unikat")}`,
      save: (id, v) => run(id ? kuenstlerUpdate : kuenstlerCreate, id ? { recordId: id, fields: { name: v.name } } : { name: v.name }, kuenstlerQuery.refetch),
    },
    {
      key: "glasuren",
      label: "Glasuren",
      singular: "Glasur",
      hint: "Glasurname für Unikate und Editionsware.",
      fields: [{ key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Seladon Nebel" }],
      entries: items(glasurQuery).map((i) => toEntry(i, ["name"], () => "")),
      usage: (id) => `${stueck(usage("glasur", id, "u"), "Unikat")} · ${stueck(usage("glasur", id, "e"), "Editionsposten")}`,
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
      usage: (id) => stueck(usage("modell", id, "e"), "Editionsposten"),
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
      usage: (id) => `zurzeit ${stueck(usage("galerie", id, "u"), "Unikat")}`,
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
      usage: (id) => `${stueck(usage("lagerort", id, "u"), "Unikat")} · ${stueck(usage("lagerort", id, "e"), "Editionsposten")}`,
      locked: (e) => (e.name === AUSSER_HAUS_ORT ? "Diesen Namen setzen die Regeln für Stücke außer Haus. Er bleibt fest." : undefined),
      save: (id, v) => run(id ? lagerortUpdate : lagerortCreate, id ? { recordId: id, fields: { name: v.name, bereich: v.bereich || null } } : { name: v.name, bereich: v.bereich || null }, lagerortQuery.refetch),
    },
  ];

  const kat = kategorien.find((k) => k.key === tab) ?? kategorien[0];
  const queries = [kuenstlerQuery, glasurQuery, modellQuery, partnerQuery, lagerortQuery];
  const loading = queries.some((qq) => qq.status === "pending");
  const failed = queries.some((qq) => qq.status === "error");
  const term = search.trim().toLowerCase();
  const visible = kat.entries
    .filter((e) => !term || [e.name, e.sub].join(" ").toLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-5" lang="de">
        <PageHeader
          title="Stammdaten"
          description="Die Auswahllisten für Erfassen und Bestand. Neue Einträge hier anlegen, Namen hier korrigieren."
          actions={
            <Button className="h-11 text-base" onClick={() => setDialog({ entry: null })}>
              <Plus className="w-5 h-5 mr-2" aria-hidden /> {kat.singular} anlegen
            </Button>
          }
        />
        <TabChips
          label="Stammdaten"
          tabs={kategorien.map((k) => ({ key: k.key, label: k.label, count: k.entries.length }))}
          value={tab}
          onChange={(key) => {
            setTab(key);
            setSearch("");
          }}
        />
        <p className="text-base text-muted-foreground">{kat.hint}</p>
        {kat.entries.length > SEARCH_FROM && (
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" aria-label="Suche" placeholder={`${kat.label} durchsuchen`} value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-10 text-base" />
          </div>
        )}
        {failed ? (
          <ErrorState text="Die Stammdaten konnten nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Stammdaten werden geladen …" />
        ) : visible.length === 0 ? (
          <EmptyState text={term ? "Nichts gefunden." : `Noch keine ${kat.label}. Mit „${kat.singular} anlegen“ beginnen.`} />
        ) : (
          <ul className="rounded-xl border bg-card px-3 divide-y">
            {visible.map((e) => (
              <li key={e.id}>
                <ListRow
                  fotos={kat.foto ? e.fotos : undefined}
                  title={e.name || "Ohne Namen"}
                  sub={[e.sub, kat.usage(e.id)].filter(Boolean).join(" · ")}
                  onClick={() => setDialog({ entry: e })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      {dialog && <EntryDialog key={dialog.entry?.id ?? "neu"} kat={kat} entry={dialog.entry} onClose={() => setDialog(null)} />}
    </div>
  );
}

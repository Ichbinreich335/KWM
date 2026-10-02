import { useEffect, useMemo, useState } from "react";
import { datasource, q, useFieldOptions, useLinkedRecords, useRecordUpdate, useRecords, useUpload } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowRight, Check, Download, ImageOff, Loader2, Minus, Pencil, Plus, Search, Table2, X } from "lucide-react";
import { toast } from "sonner";

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
  geaendertAm: "aGhiL",
  verkauftAm: "48BXo",
  seit: "Evxm2",
  rueckgabe: "ENQkk",
});
const unikatWerkstattFields = q.select({
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
const userProperties = { role: "z0b2k" };

const PAGE_SIZE = 100;
const CARD_STEP = 48;
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const AUSSER_HAUS_ORT = "Außer Haus";
const isAusserHaus = (status: string) => status === KOMMISSION || status === AUSGESTELLT;
const VERKAUFT = "verkauft";
const ROHLING = "Rohling";
const EVENT_ADMIN_EDIT = "kwm:unikat-admin-bearbeiten";
const EVENT_UNIKAT_CHANGED = "kwm:unikat-geaendert";

const STATUS_STYLE: Record<string, string> = {
  verfügbar: "bg-emerald-100 text-emerald-800 border-emerald-200",
  reserviert: "bg-amber-100 text-amber-900 border-amber-200",
  [VERKAUFT]: "bg-zinc-100 text-zinc-600 border-zinc-200",
  [KOMMISSION]: "bg-sky-100 text-sky-800 border-sky-200",
  [AUSGESTELLT]: "bg-violet-100 text-violet-800 border-violet-200",
  [ROHLING]: "bg-stone-100 text-stone-700 border-stone-200",
  glasiert: "bg-teal-50 text-teal-800 border-teal-200",
};

const STATUS_ACTIVE: Record<string, string> = {
  verfügbar: "bg-emerald-600 text-white border-emerald-600",
  reserviert: "bg-amber-400 text-amber-950 border-amber-400",
  [VERKAUFT]: "bg-zinc-500 text-white border-zinc-500",
  [KOMMISSION]: "bg-sky-600 text-white border-sky-600",
  [AUSGESTELLT]: "bg-violet-700 text-white border-violet-700",
};
const UNDO_MS = 10000;
const SHEET_CLASS = "w-full overflow-y-auto [&>button:last-child]:hidden";

type Opt = { id: string; label: string };
type Attachment = { id?: string; url: string; filename?: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };
type LinkedPages = { pages: { items: { id: string; title: string }[] }[] } | undefined;

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
  foto: Attachment[];
  notiz: string;
};

type TabKey = "alle" | "verfuegbar" | "schalen" | "vasen" | "teller" | "kommission" | "edition";
type SortKey = "neu" | "name" | "nummer" | "preis" | "lagerort";

const TABS: { key: TabKey; label: string; match?: (u: Unikat) => boolean }[] = [
  { key: "alle", label: "Alle" },
  { key: "verfuegbar", label: "Verfügbar", match: (u) => u.status === "verfügbar" },
  { key: "schalen", label: "Schalen", match: (u) => u.typ === "Schale" },
  { key: "vasen", label: "Vasen", match: (u) => u.typ === "Vase" },
  { key: "teller", label: "Teller", match: (u) => u.typ === "Teller" },
  { key: "kommission", label: "Außer Haus", match: (u) => isAusserHaus(u.status) },
  { key: "edition", label: "Editionsware" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "neu", label: "Neueste zuerst" },
  { key: "name", label: "Name A–Z" },
  { key: "nummer", label: "Inventarnummer" },
  { key: "preis", label: "Preis absteigend" },
  { key: "lagerort", label: "Lagerort" },
];

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

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
function thumb(a: Attachment, size: "small" | "medium" | "large"): string {
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
function link(id: string | undefined) {
  return id ? [id] : [];
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
}
function parseNumber(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
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
    foto: asAttachments(f.foto),
    notiz: str(f.notiz),
  };
}

function matchesSearch(u: Unikat, term: string): boolean {
  if (!term) return true;
  const hay = [u.name, u.inv, u.typ, u.status, u.kuenstler?.label, u.lagerort?.label, u.galerie?.label, u.notiz, u.masse, ...u.glasur.map((g) => g.label)]
    .join(" ")
    .toLowerCase();
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
      return (a.lagerort?.label ?? "~").localeCompare(b.lagerort?.label ?? "~", "de");
    default:
      return b.erfasstAm.localeCompare(a.erfasstAm);
  }
}

function csvCell(v: string): string {
  return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function exportUnikate(list: Unikat[]) {
  downloadCsv(
    `unikate-${today()}.csv`,
    ["Inventarnummer", "Name", "Typ", "Status", "Künstler:in", "Jahr", "Glasur", "Maße", "Lagerort", "Galerie", "Preis intern (€)", "Auf Website zeigen", "Notiz", "Erfasst am", "Verkauft am"],
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

function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

function Badge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap ${STATUS_STYLE[text] ?? "bg-muted text-foreground border-border"}`}>
      {text}
    </span>
  );
}

function Thumb({ fotos, size, className }: { fotos: Attachment[]; size: "small" | "medium"; className: string }) {
  const first = fotos[0];
  if (!first) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center text-muted-foreground`} aria-label="Kein Foto">
        <ImageOff className="w-5 h-5" aria-hidden />
      </div>
    );
  }
  return <img src={thumb(first, size)} alt="" loading="lazy" className={`${className} object-cover`} />;
}

function Chip({ active, onClick, children, disabled, activeClass }: { active: boolean; onClick: () => void; children: string; disabled?: boolean; activeClass?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full border text-base disabled:opacity-60 ${active ? activeClass ?? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"}`}
    >
      {active && <Check className="w-4 h-4" aria-hidden />}
      {children}
    </button>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <SheetHeader className="flex-row items-start justify-between gap-3 space-y-0">
      <div className="min-w-0">
        <SheetTitle className="text-xl break-words hyphens-auto">{title}</SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </div>
      <SheetClose asChild>
        <Button variant="ghost" className="h-11 w-11 p-0 shrink-0" aria-label="Schließen">
          <X className="w-6 h-6" aria-hidden />
        </Button>
      </SheetClose>
    </SheetHeader>
  );
}

function DoneButton() {
  return (
    <SheetClose asChild>
      <Button variant="outline" className="w-full h-12 text-base">
        Fertig
      </Button>
    </SheetClose>
  );
}

function OptionSelect({ id, value, onChange, options, placeholder, disabled }: { id: string; value: string; onChange: (v: string) => void; options: Opt[]; placeholder: string; disabled?: boolean }) {
  return (
    <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="w-full h-12 rounded-md border border-input bg-background px-3 text-base">
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Label({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
    </label>
  );
}

function UnikatCard({ u, onOpen }: { u: Unikat; onOpen: () => void }) {
  const ort = isAusserHaus(u.status) && u.galerie ? u.galerie.label : u.lagerort?.label;
  return (
    <button type="button" onClick={onOpen} className="w-full text-left flex gap-3 rounded-xl border bg-card p-3 min-w-0 hover:border-primary/50 hover:shadow-sm transition">
      <Thumb fotos={u.fotos} size="medium" className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-semibold text-base leading-snug hyphens-auto">{u.name || "Ohne Namen"}</p>
        <p className="text-sm text-muted-foreground">
          {u.inv} · {u.typ}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge text={u.status} />
          {u.preis !== null && <span className="text-sm font-medium">{euro.format(u.preis)}</span>}
        </div>
        <p className="text-sm text-muted-foreground truncate">{ort ?? "Kein Lagerort"}</p>
      </div>
    </button>
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
  notiz: string;
};

function UnikatDetail({
  u,
  isAdmin,
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
  isAdmin: boolean;
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
    notiz: u.notiz,
  };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>(initial);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState<{ text: string; fields: Record<string, unknown> } | null>(null);
  const { uploadAsync } = useUpload();
  const update = useRecordUpdate({ from: ds.unikate, fields: unikatWerkstattFields });
  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [undo]);
  const set = <K extends keyof EditForm>(k: K, v: EditForm[K]) => setForm((s) => ({ ...s, [k]: v }));
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
    if (!form.name.trim()) {
      toast.error("Bitte einen Namen eingeben.");
      return;
    }
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
    ["Künstler:in", u.kuenstler?.label ?? ""],
    ["Jahr", u.jahr !== null ? String(u.jahr) : ""],
    ["Glasur", u.glasur.map((g) => g.label).join(", ")],
    ["Maße", u.masse],
    ["Partner", u.galerie?.label ?? ""],
    ["Außer Haus seit", formatDate(u.seit)],
    ["Rückgabe bis", formatDate(u.rueckgabe)],
    ["Auf Website zeigen", u.website ? "ja" : "nein"],
    ["Bildnachweis", u.bildnachweis],
    ["Erfasst", [formatDate(u.erfasstAm), u.erfasstVon].filter(Boolean).join(", von ")],
    ["Verkauft am", formatDate(u.verkauftAm)],
  ];

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className={`${SHEET_CLASS} sm:max-w-xl`}>
        <PanelHeader title={u.name || "Ohne Namen"} description={[u.inv, u.typ, u.preis !== null ? euro.format(u.preis) : ""].filter(Boolean).join(" · ")} />
        <div className="px-4 pb-8 space-y-6" lang="de">
          {!update.enabled && <Badge text={u.status} />}
          {update.enabled && (
            <section className="rounded-xl border p-4 space-y-4" aria-labelledby="schnell-titel">
              <h3 id="schnell-titel" className="text-base font-semibold">
                Schnell ändern <span className="font-normal text-muted-foreground">· wird sofort gespeichert</span>
              </h3>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusListe.map((s) => (
                    <Chip key={s.id} active={u.status === s.label} activeClass={STATUS_ACTIVE[s.label]} disabled={busy} onClick={() => changeStatus(s.label)}>
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="d-lagerort" className="block text-sm text-muted-foreground mb-2">
                  Lagerort
                </label>
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
                    <label htmlFor="d-galerie" className="block text-sm text-muted-foreground mb-2">
                      Partner (Galerie, Museum …)
                    </label>
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
                    <label htmlFor="d-rueckgabe" className="block text-sm text-muted-foreground mb-2">
                      Rückgabe bis
                    </label>
                    <Input
                      id="d-rueckgabe"
                      type="date"
                      disabled={busy}
                      value={u.rueckgabe.slice(0, 10)}
                      onChange={(e) => quickSave({ rueckgabe: e.target.value || null }, `Rückgabe bis: ${e.target.value ? formatDate(e.target.value) : "offen"}`, { rueckgabe: u.rueckgabe ? u.rueckgabe.slice(0, 10) : null })}
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
          {photo ? (
            <div className="space-y-2">
              <img src={thumb(photo, "large")} alt={u.name} className="w-full max-h-56 object-contain rounded-xl bg-muted" />
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

          {!editing ? (
            <>
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
                  <Button variant="outline" className="h-12 text-base" onClick={() => setEditing(true)}>
                    <Pencil className="w-5 h-5 mr-2" aria-hidden /> Alle Angaben bearbeiten
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="h-12 text-base"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent(EVENT_ADMIN_EDIT, { detail: { id: u.id } }));
                      onClose();
                    }}
                  >
                    Preis und Website ändern (Admin)
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">Löschen ist nicht vorgesehen. Verkaufte Stücke bitte auf „verkauft“ setzen.</p>
                <DoneButton />
              </div>
            </>
          ) : (
            <section className="space-y-5" aria-label="Alle Angaben bearbeiten">
              <div>
                <Label htmlFor="d-name">Name</Label>
                <Input id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-12 text-base" />
              </div>
              <div>
                <p className="text-base font-medium mb-2">Typ</p>
                <div className="flex flex-wrap gap-2">
                  {typen.map((t) => (
                    <Chip key={t.id} active={form.typ === t.label} onClick={() => set("typ", t.label)}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="d-kuenstler">Künstler:in</Label>
                  <OptionSelect id="d-kuenstler" value={form.kuenstlerId} onChange={(v) => set("kuenstlerId", v)} options={kuenstler} placeholder="Bitte wählen" />
                </div>
                <div>
                  <Label htmlFor="d-jahr">Jahr</Label>
                  <Input id="d-jahr" inputMode="numeric" value={form.jahr} onChange={(e) => set("jahr", e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-12 text-base" />
                </div>
              </div>
              <div>
                <p className="text-base font-medium mb-2">Glasur</p>
                <div className="flex flex-wrap gap-2">
                  {glasuren.map((g) => (
                    <Chip key={g.id} active={form.glasurIds.includes(g.id)} onClick={() => set("glasurIds", form.glasurIds.includes(g.id) ? form.glasurIds.filter((x) => x !== g.id) : [...form.glasurIds, g.id])}>
                      {g.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="d-masse">Maße</Label>
                  <Input id="d-masse" value={form.masse} onChange={(e) => set("masse", e.target.value)} placeholder="z. B. Ø 24 × H 8 cm" className="h-12 text-base" />
                </div>
                <div>
                  <Label htmlFor="d-bildnachweis">Bildnachweis</Label>
                  <Input id="d-bildnachweis" value={form.bildnachweis} onChange={(e) => set("bildnachweis", e.target.value)} className="h-12 text-base" />
                </div>
              </div>
              <div>
                <Label htmlFor="d-notiz">Notiz</Label>
                <Textarea id="d-notiz" rows={3} value={form.notiz} onChange={(e) => set("notiz", e.target.value)} className="text-base" />
              </div>
              <div>
                <Label htmlFor="d-foto">Foto hinzufügen</Label>
                <input
                  id="d-foto"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
                  className="block w-full text-base file:mr-3 file:h-11 file:px-4 file:rounded-md file:border-0 file:bg-muted file:text-foreground"
                />
                {newFiles.length > 0 && <p className="text-sm text-muted-foreground mt-1.5">{newFiles.length} Foto(s) ausgewählt</p>}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="h-12 flex-1 text-base" disabled={busy} onClick={() => { setForm(initial); setNewFiles([]); setEditing(false); }}>
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
      </SheetContent>
    </Sheet>
  );
}

function EditionRow({ e, busy, canEdit, onAdjust, onOpen }: { e: Edition; busy: boolean; canEdit: boolean; onAdjust: (delta: number) => void; onOpen: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border bg-card p-3 min-w-0">
      <button type="button" onClick={onOpen} className="flex items-center gap-3 min-w-0 flex-1 text-left">
        <Thumb fotos={e.foto} size="small" className="w-14 h-14 shrink-0 rounded-lg" />
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-base leading-snug hyphens-auto">{e.modell}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge text={e.zustand} />
            {e.glasur && <span className="text-sm">{e.glasur}</span>}
          </div>
          <p className="text-sm text-muted-foreground">{e.lagerort?.label ?? "Kein Lagerort"}</p>
        </div>
      </button>
      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
        {canEdit && (
          <Button variant="outline" className="h-11 w-11 p-0" aria-label={`${e.modell}: eins weniger`} disabled={busy || e.anzahl <= 0} onClick={() => onAdjust(-1)}>
            <Minus className="w-5 h-5" aria-hidden />
          </Button>
        )}
        <span className={`w-12 text-center text-lg font-semibold tabular-nums ${e.anzahl < 5 ? "text-amber-700" : ""}`} aria-label={`Anzahl ${e.anzahl}`}>
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
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className={`${SHEET_CLASS} sm:max-w-md`}>
        <PanelHeader title={e.modell} description={[e.typ, e.zustand, e.glasur].filter(Boolean).join(" · ")} />
        <div className="px-4 pb-8 space-y-6">
          {e.foto[0] && <img src={thumb(e.foto[0], "large")} alt={e.modell} className="w-full max-h-72 object-contain rounded-xl bg-muted" />}
          <div>
            <Label htmlFor="ed-anzahl">Anzahl</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-14 w-14" aria-label="Eins weniger" disabled={!canEdit} onClick={() => setAnzahl(String(Math.max(0, value - 1)))}>
                <Minus className="w-6 h-6" aria-hidden />
              </Button>
              <Input id="ed-anzahl" inputMode="numeric" disabled={!canEdit} value={anzahl} onChange={(ev) => setAnzahl(ev.target.value.replace(/\D/g, ""))} className="h-14 w-28 text-center text-2xl" />
              <Button variant="outline" className="h-14 w-14" aria-label="Eins mehr" disabled={!canEdit} onClick={() => setAnzahl(String(value + 1))}>
                <Plus className="w-6 h-6" aria-hidden />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="ed-lagerort">Lagerort</Label>
            <OptionSelect id="ed-lagerort" value={lagerortId} disabled={!canEdit} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
          </div>
          <div>
            <Label htmlFor="ed-notiz">Notiz</Label>
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
      </SheetContent>
    </Sheet>
  );
}

export default function Block() {
  const user = useCurrentUser({ properties: userProperties });
  const isAdmin = asOpts((user?.properties as { role?: unknown } | undefined)?.role).some((r) => r.label === "Admin");

  const [tab, setTab] = useState<TabKey>(() => {
    const t = initialParam("tab");
    return TABS.some((x) => x.key === t) ? (t as TabKey) : "alle";
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("neu");
  const [selectedId, setSelectedId] = useState(() => initialParam("id"));
  const [editionId, setEditionId] = useState("");
  const [zustandFilter, setZustandFilter] = useState("");
  const [limit, setLimit] = useState(CARD_STEP);
  const [pendingEdition, setPendingEdition] = useState("");

  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  const refetchUnikate = unikateQuery.refetch;
  useEffect(() => {
    const onChanged = () => refetchUnikate();
    window.addEventListener(EVENT_UNIKAT_CHANGED, onChanged);
    return () => window.removeEventListener(EVENT_UNIKAT_CHANGED, onChanged);
  }, [refetchUnikate]);

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
    () => unikate.filter((u) => (activeTab.match ? activeTab.match(u) : true) && matchesSearch(u, term)).sort((a, b) => compare(a, b, sort)),
    [unikate, activeTab, term, sort],
  );
  const visibleEdition = editionen
    .filter((e) => (zustandFilter ? e.zustand === zustandFilter : true))
    .filter((e) => !term || [e.modell, e.glasur, e.zustand, e.typ, e.lagerort?.label, e.notiz].join(" ").toLowerCase().includes(term.toLowerCase()))
    .sort((a, b) => a.modell.localeCompare(b.modell, "de") || a.zustand.localeCompare(b.zustand, "de"));

  const counts = useMemo(() => {
    const out = {} as Record<TabKey, number>;
    TABS.forEach((t) => (out[t.key] = t.key === "edition" ? editionen.length : unikate.filter((u) => (t.match ? t.match(u) : true)).length));
    return out;
  }, [unikate, editionen]);

  const selected = unikate.find((u) => u.id === selectedId);
  const selectedEdition = editionen.find((e) => e.id === editionId);
  const isEdition = tab === "edition";
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const rohlinge = editionen.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0);
  const glasiert = editionen.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl, 0);

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
      <div className="content space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Bestand</h1>
            <p className="text-base text-muted-foreground">
              {isEdition ? `${visibleEdition.length} Zeilen · ${rohlinge} Rohlinge · ${glasiert} glasiert` : `${visible.length} von ${unikate.length} Unikaten`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost" className="h-11 text-base">
              <a href="/tabelle">
                <Table2 className="w-5 h-5 mr-2" aria-hidden /> Alles als Tabelle <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
              </a>
            </Button>
            <Button variant="outline" className="h-11 text-base" onClick={() => (isEdition ? exportEdition(visibleEdition) : exportUnikate(visible))} disabled={isEdition ? visibleEdition.length === 0 : visible.length === 0}>
              <Download className="w-5 h-5 mr-2" aria-hidden /> CSV-Export
            </Button>
          </div>
        </div>

        <div role="tablist" aria-label="Schnellauswahl" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => {
                setTab(t.key);
                setLimit(CARD_STEP);
              }}
              className={`shrink-0 min-h-11 px-4 rounded-full border text-base whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"}`}
            >
              {t.label} <span className={tab === t.key ? "opacity-80" : "text-muted-foreground"}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              aria-label="Suche"
              placeholder={isEdition ? "Suchen: Modell, Glasur" : "Suchen: Name, Nummer, Glasur"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          {isEdition ? (
            <div className="flex gap-2">
              {(
                [
                  ["", "Alle"],
                  [ROHLING, "Rohlinge"],
                  ["glasiert", "Glasiert"],
                ] as const
              ).map(([v, label]) => (
                <Chip key={label} active={zustandFilter === v} onClick={() => setZustandFilter(v)}>
                  {label}
                </Chip>
              ))}
            </div>
          ) : (
            <select aria-label="Sortierung" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-12 rounded-md border border-input bg-background px-3 text-base">
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {failed ? (
          <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-base">
            Der Bestand konnte nicht geladen werden. Bitte die Seite neu laden.
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-base text-muted-foreground py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Bestand wird geladen …
          </div>
        ) : isEdition ? (
          visibleEdition.length === 0 ? (
            <p className="rounded-xl border p-6 text-base text-muted-foreground text-center">Keine Editionsware gefunden.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-3" lang="de">
              {visibleEdition.map((e) => (
                <EditionRow key={e.id} e={e} busy={pendingEdition === e.id} canEdit={editionUpdate.enabled} onAdjust={(d) => adjustEdition(e, d)} onOpen={() => setEditionId(e.id)} />
              ))}
            </div>
          )
        ) : visible.length === 0 ? (
          <div className="rounded-xl border p-6 text-center space-y-3">
            <p className="text-base">Keine Stücke gefunden.</p>
            {search && (
              <Button variant="outline" className="h-11 text-base" onClick={() => setSearch("")}>
                Suche zurücksetzen
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))] gap-3" lang="de">
              {visible.slice(0, limit).map((u) => (
                <UnikatCard key={u.id} u={u} onOpen={() => setSelectedId(u.id)} />
              ))}
            </div>
            {visible.length > limit && (
              <div className="flex justify-center">
                <Button variant="outline" className="h-12 text-base" onClick={() => setLimit((l) => l + CARD_STEP)}>
                  Weitere {Math.min(CARD_STEP, visible.length - limit)} anzeigen
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
          isAdmin={isAdmin}
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
      {selectedEdition && (
        <EditionDetail key={selectedEdition.id} e={selectedEdition} canEdit={editionUpdate.enabled} onClose={() => setEditionId("")} onSave={(fields) => saveEdition(selectedEdition, fields)} lagerorte={lagerorte} />
      )}
    </div>
  );
}

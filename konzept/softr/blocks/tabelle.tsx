import { useEffect, useMemo, useState } from "react";
import { datasource, q, useRecordCreate, useRecordDelete, useRecords } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDown, ArrowUp, Bookmark, Columns3, Download, ImageOff, Loader2, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({ unikate: "unikate", edition: "edition", ansichten: "ansichten" });

const unikatSelect = q.select({
  inv: "glG6V",
  nummer: "T63YN",
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
});
const ansichtSelect = q.select({ name: "8s5KL", definition: "rWGS9", von: "uPraE" });

const PAGE_SIZE = 100;
const VIEW_VERSION = 2;
const UNIKAT = "Unikat";
const EDITION = "Editionsware";

const STATUS_STYLE: Record<string, string> = {
  verfügbar: "bg-emerald-100 text-emerald-800 border-emerald-200",
  reserviert: "bg-amber-100 text-amber-900 border-amber-200",
  verkauft: "bg-zinc-100 text-zinc-600 border-zinc-200",
  "in Kommission": "bg-sky-100 text-sky-800 border-sky-200",
  Rohling: "bg-stone-100 text-stone-700 border-stone-200",
  glasiert: "bg-teal-50 text-teal-800 border-teal-200",
};

type Attachment = { url: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };

type Row = {
  id: string;
  art: string;
  inv: string;
  nummer: number;
  name: string;
  typ: string;
  status: string;
  anzahl: number;
  kuenstler: string;
  glasur: string[];
  jahr: number | null;
  masse: string;
  lagerort: string;
  galerie: string;
  preis: number | null;
  website: boolean | null;
  bildnachweis: string;
  notiz: string;
  erfasstVon: string;
  erfasstAm: string;
  geaendertAm: string;
  verkauftAm: string;
  foto: Attachment | undefined;
};

type FieldType = "text" | "number" | "select" | "multi" | "bool" | "date";
type ColKey =
  | "art"
  | "inv"
  | "name"
  | "typ"
  | "status"
  | "anzahl"
  | "kuenstler"
  | "glasur"
  | "jahr"
  | "masse"
  | "lagerort"
  | "galerie"
  | "preis"
  | "website"
  | "notiz"
  | "erfasstAm"
  | "geaendertAm"
  | "verkauftAm";
type CellValue = string | number | boolean | string[] | null;
type Col = { key: ColKey; label: string; type: FieldType; get: (r: Row) => CellValue; visible: boolean; align?: "right" };

const COLUMNS: Col[] = [
  { key: "art", label: "Art", type: "select", get: (r) => r.art, visible: true },
  { key: "inv", label: "Inv.-Nr.", type: "text", get: (r) => r.inv || null, visible: true },
  { key: "name", label: "Name / Modell", type: "text", get: (r) => r.name, visible: true },
  { key: "typ", label: "Typ", type: "select", get: (r) => r.typ || null, visible: true },
  { key: "status", label: "Status / Zustand", type: "select", get: (r) => r.status || null, visible: true },
  { key: "anzahl", label: "Anzahl", type: "number", get: (r) => r.anzahl, visible: true, align: "right" },
  { key: "glasur", label: "Glasur", type: "multi", get: (r) => r.glasur, visible: true },
  { key: "lagerort", label: "Lagerort", type: "select", get: (r) => r.lagerort || null, visible: true },
  { key: "preis", label: "Preis intern", type: "number", get: (r) => r.preis, visible: true, align: "right" },
  { key: "kuenstler", label: "Künstler:in", type: "select", get: (r) => r.kuenstler || null, visible: false },
  { key: "jahr", label: "Jahr", type: "number", get: (r) => r.jahr, visible: false, align: "right" },
  { key: "masse", label: "Maße", type: "text", get: (r) => r.masse || null, visible: false },
  { key: "galerie", label: "Galerie", type: "select", get: (r) => r.galerie || null, visible: false },
  { key: "website", label: "Auf Website", type: "bool", get: (r) => r.website, visible: false },
  { key: "notiz", label: "Notiz", type: "text", get: (r) => r.notiz || null, visible: false },
  { key: "erfasstAm", label: "Erfasst am", type: "date", get: (r) => r.erfasstAm.slice(0, 10) || null, visible: false },
  { key: "geaendertAm", label: "Geändert am", type: "date", get: (r) => r.geaendertAm.slice(0, 10) || null, visible: false },
  { key: "verkauftAm", label: "Verkauft am", type: "date", get: (r) => r.verkauftAm.slice(0, 10) || null, visible: false },
];
const COL = Object.fromEntries(COLUMNS.map((c) => [c.key, c])) as Record<ColKey, Col>;
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
    { op: "eq", label: "=" },
    { op: "neq", label: "≠" },
    { op: "gt", label: ">" },
    { op: "gte", label: "≥" },
    { op: "lt", label: "<" },
    { op: "lte", label: "≤" },
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
type ViewDef = { v: number; conditions: Condition[]; conj: Conj; columns: ColKey[]; sort: Sort; search: string };

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const zahl = new Intl.NumberFormat("de-DE");

function labels(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(labels);
  if (typeof v === "object" && "label" in (v as object)) return [String((v as { label: unknown }).label ?? "")];
  return [];
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function numOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function firstAttachment(v: unknown): Attachment | undefined {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  return list.find((a): a is Attachment => !!a && typeof a === "object" && "url" in a);
}
function thumb(a: Attachment, size: "small" | "large"): string {
  return a.thumbnails?.find((t) => t.size === size)?.url ?? a.url;
}
function parseNumber(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
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
    nummer: numOrNull(f.nummer) ?? 0,
    name: str(f.name),
    typ: labels(f.typ)[0] ?? "",
    status: labels(f.status)[0] ?? "",
    anzahl: 1,
    kuenstler: labels(f.kuenstler)[0] ?? "",
    glasur: labels(f.glasur),
    jahr: numOrNull(f.jahr),
    masse: str(f.masse),
    lagerort: labels(f.lagerort)[0] ?? "",
    galerie: labels(f.galerie)[0] ?? "",
    preis: numOrNull(f.preis),
    website: f.website === true,
    bildnachweis: str(f.bildnachweis),
    notiz: str(f.notiz),
    erfasstVon: str(f.erfasstVon),
    erfasstAm: str(f.erfasstAm),
    geaendertAm: str(f.geaendertAm),
    verkauftAm: str(f.verkauftAm),
    foto: firstAttachment(f.fotos),
  };
}

function toEditionRow(i: RawItem): Row {
  const f = i.fields;
  return {
    id: i.id,
    art: EDITION,
    inv: "",
    nummer: 0,
    name: labels(f.modell)[0] ?? "",
    typ: labels(f.typ)[0] ?? "",
    status: labels(f.zustand)[0] ?? "",
    anzahl: numOrNull(f.anzahl) ?? 0,
    kuenstler: "",
    glasur: labels(f.glasur),
    jahr: null,
    masse: "",
    lagerort: labels(f.lagerort)[0] ?? "",
    galerie: "",
    preis: null,
    website: null,
    bildnachweis: "",
    notiz: str(f.notiz),
    erfasstVon: "",
    erfasstAm: str(f.erfasstAm),
    geaendertAm: str(f.geaendertAm),
    verkauftAm: "",
    foto: firstAttachment(f.foto),
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
  const hay = [r.art, r.inv, r.name, r.typ, r.status, r.kuenstler, r.lagerort, r.galerie, r.masse, r.notiz, ...r.glasur].join(" ").toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .every((t) => hay.includes(t));
}

function compareRows(a: Row, b: Row, sort: NonNullable<Sort>): number {
  const col = COL[sort.key];
  const va = sort.key === "inv" ? (a.nummer || null) : col.get(a);
  const vb = sort.key === "inv" ? (b.nummer || null) : col.get(b);
  if (isEmpty(va) && isEmpty(vb)) return 0;
  if (isEmpty(va)) return 1;
  if (isEmpty(vb)) return -1;
  const r =
    typeof va === "number" && typeof vb === "number"
      ? va - vb
      : String(Array.isArray(va) ? va.join(", ") : va).localeCompare(String(Array.isArray(vb) ? vb.join(", ") : vb), "de");
  return sort.dir === "asc" ? r : -r;
}

function formatCell(col: Col, r: Row): string {
  const v = col.get(r);
  if (isEmpty(v)) return "";
  if (col.key === "preis" && typeof v === "number") return euro.format(v);
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

function csvCell(v: string): string {
  return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function downloadCsv(rows: Row[]) {
  const header = ["Art", "Inventarnummer", "Name / Modell", "Typ", "Status / Zustand", "Anzahl", "Künstler:in", "Glasur", "Jahr", "Maße", "Lagerort", "Galerie", "Preis intern (€)", "Auf Website", "Notiz", "Erfasst am", "Verkauft am"];
  const body = rows.map((r) =>
    [
      r.art,
      r.inv,
      r.name,
      r.typ,
      r.status,
      String(r.anzahl),
      r.kuenstler,
      r.glasur.join(", "),
      r.jahr === null ? "" : String(r.jahr),
      r.masse,
      r.lagerort,
      r.galerie,
      r.preis === null ? "" : String(r.preis),
      r.website === null ? "" : r.website ? "ja" : "nein",
      r.notiz,
      formatDate(r.erfasstAm),
      formatDate(r.verkauftAm),
    ].map(csvCell),
  );
  const csv = "﻿" + [header.map(csvCell), ...body].map((l) => l.join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `kwm-tabelle-${new Date().toISOString().slice(0, 10)}.csv`;
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

function initialConditions(): Condition[] {
  const params = new URLSearchParams(window.location.search);
  const out: Condition[] = [];
  const status = params.get("status");
  const art = params.get("art");
  if (status) out.push({ id: newId(), field: "status", op: "anyOf", value: [status] });
  if (art) out.push({ id: newId(), field: "art", op: "anyOf", value: [art] });
  return out;
}

const selectClass = "h-11 rounded-md border border-input bg-background px-2 text-base";

function MultiPick({ options, value, onChange, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  const text = value.length === 0 ? "Wert wählen" : value.length <= 2 ? value.join(", ") : `${value.length} ausgewählt`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 justify-start text-base font-normal min-w-40 max-w-full truncate" aria-label={`${label}: Werte wählen`}>
          <span className="truncate">{text}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 max-h-80 overflow-y-auto p-2">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">Keine Werte vorhanden.</p>
        ) : (
          options.map((o) => {
            const checked = value.includes(o);
            return (
              <label key={o} className="flex items-center gap-3 min-h-11 px-2 rounded-md hover:bg-muted cursor-pointer">
                <Checkbox checked={checked} onCheckedChange={() => onChange(checked ? value.filter((x) => x !== o) : [...value, o])} />
                <span className="text-base">{o}</span>
              </label>
            );
          })
        )}
      </PopoverContent>
    </Popover>
  );
}

function ConditionRow({
  c,
  index,
  conj,
  onConj,
  onChange,
  onRemove,
  optionsFor,
}: {
  c: Condition;
  index: number;
  conj: Conj;
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
          <span className="text-base text-muted-foreground">Wo</span>
        ) : index === 1 ? (
          <select aria-label="Verknüpfung" value={conj} onChange={(e) => onConj(e.target.value as Conj)} className={`${selectClass} w-20`}>
            <option value="und">und</option>
            <option value="oder">oder</option>
          </select>
        ) : (
          <span className="text-base text-muted-foreground">{conj}</span>
        )}
      </div>
      <select
        aria-label="Feld"
        value={c.field}
        onChange={(e) => {
          const field = e.target.value as ColKey;
          onChange({ ...c, field, op: OPS[COL[field].type][0].op, value: COL[field].type === "select" || COL[field].type === "multi" ? [] : "" });
        }}
        className={selectClass}
      >
        {COLUMNS.map((x) => (
          <option key={x.key} value={x.key}>
            {x.label}
          </option>
        ))}
      </select>
      <select aria-label="Bedingung" value={c.op} onChange={(e) => onChange({ ...c, op: e.target.value as Op })} className={selectClass}>
        {ops.map((o) => (
          <option key={o.op} value={o.op}>
            {o.label}
          </option>
        ))}
      </select>
      {!NO_VALUE.includes(c.op) &&
        (col.type === "select" || col.type === "multi" ? (
          <MultiPick label={col.label} options={optionsFor(c.field)} value={Array.isArray(c.value) ? c.value : []} onChange={(value) => onChange({ ...c, value })} />
        ) : (
          <Input
            aria-label="Wert"
            type={col.type === "date" ? "date" : "text"}
            inputMode={col.type === "number" ? "decimal" : undefined}
            value={typeof c.value === "string" ? c.value : ""}
            onChange={(e) => onChange({ ...c, value: e.target.value })}
            placeholder="Wert"
            className="h-11 text-base w-44"
          />
        ))}
      <Button variant="ghost" className="h-11 w-11 p-0" aria-label="Bedingung entfernen" onClick={onRemove}>
        <X className="w-5 h-5" aria-hidden />
      </Button>
    </div>
  );
}

function Detail({ r, onClose }: { r: Row; onClose: () => void }) {
  const fields: [string, string][] = COLUMNS.filter((c) => c.key !== "name").map((c) => [c.label, formatCell(c, r)]);
  if (r.art === UNIKAT) fields.push(["Bildnachweis", r.bildnachweis], ["Erfasst von", r.erfasstVon]);
  const href = r.art === UNIKAT ? `/bestand?id=${r.id}` : "/bestand?tab=edition";
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto [&>button:last-child]:hidden">
        <SheetHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <SheetTitle className="text-xl break-words hyphens-auto">{r.name || "Ohne Namen"}</SheetTitle>
            <SheetDescription>{[r.art, r.inv, r.typ].filter(Boolean).join(" · ")}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" className="h-11 w-11 p-0 shrink-0" aria-label="Schließen">
              <X className="w-6 h-6" aria-hidden />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="px-4 pb-8 space-y-5">
          {r.foto ? (
            <img src={thumb(r.foto, "large")} alt={r.name} className="w-full max-h-80 object-contain rounded-xl bg-muted" />
          ) : (
            <div className="h-32 rounded-xl bg-muted flex items-center justify-center gap-2 text-muted-foreground">
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
          <Button asChild className="w-full h-12 text-base">
            <a href={href}>Im Bestand bearbeiten</a>
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full h-12 text-base">
              Fertig
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SaveViewDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ansicht speichern</DialogTitle>
        </DialogHeader>
        <label htmlFor="view-name" className="text-base font-medium">
          Name der Ansicht
        </label>
        <Input id="view-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Seladon im Schauraum" className="h-12 text-base" />
        <p className="text-sm text-muted-foreground">Gespeichert werden Filter, Spalten, Sortierung und Suche. Alle Mitarbeitenden sehen die Ansicht.</p>
        <DialogFooter>
          <Button
            className="h-12 text-base"
            disabled={!name.trim() || busy}
            onClick={async () => {
              setBusy(true);
              await onSave(name.trim());
              setBusy(false);
              setName("");
            }}
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Block() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);
  const [conj, setConj] = useState<Conj>("und");
  const [filterOpen, setFilterOpen] = useState(() => initialConditions().length > 0);
  const [columns, setColumns] = useState<ColKey[]>(DEFAULT_VISIBLE);
  const [sort, setSort] = useState<Sort>(null);
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

  const optionsFor = (key: ColKey): string[] => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const v = COL[key].get(r);
      (Array.isArray(v) ? v : v === null ? [] : [String(v)]).forEach((x) => x && set.add(x));
    });
    return [...set].sort((a, b) => a.localeCompare(b, "de"));
  };

  const activeConditions = conditions.filter((c) => NO_VALUE.includes(c.op) || (Array.isArray(c.value) ? c.value.length > 0 : c.value.trim() !== ""));
  const visibleRows = useMemo(() => {
    const out = rows.filter(
      (r) =>
        matchesSearch(r, search.trim()) &&
        (activeConditions.length === 0 || (conj === "und" ? activeConditions.every((c) => matches(r, c)) : activeConditions.some((c) => matches(r, c)))),
    );
    return sort ? out.sort((a, b) => compareRows(a, b, sort)) : out.sort((a, b) => b.erfasstAm.localeCompare(a.erfasstAm));
  }, [rows, search, activeConditions, conj, sort]);

  const shown = COLUMNS.filter((c) => columns.includes(c.key));
  const summeAnzahl = visibleRows.reduce((n, r) => n + r.anzahl, 0);
  const summePreis = visibleRows.reduce((n, r) => n + (r.preis ?? 0), 0);
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";

  function addCondition() {
    setConditions((cs) => [...cs, { id: newId(), field: "typ", op: "anyOf", value: [] }]);
    setFilterOpen(true);
    setViewId("");
  }

  function toggleSort(key: ColKey) {
    setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));
  }

  function applyView(id: string) {
    setViewId(id);
    const view = ansichten.find((v) => v.id === id);
    if (!view) return;
    try {
      const def = JSON.parse(view.definition) as Partial<ViewDef> & Record<string, unknown>;
      if (def.v === VIEW_VERSION) {
        setConditions(def.conditions ?? []);
        setConj(def.conj ?? "und");
        setColumns(def.columns?.length ? def.columns : DEFAULT_VISIBLE);
        setSort(def.sort ?? null);
      } else {
        setConditions(legacyToConditions(def));
        setConj("und");
        setColumns(DEFAULT_VISIBLE);
        setSort(null);
      }
      setSearch(typeof def.search === "string" ? def.search : "");
      setFilterOpen(true);
    } catch {
      toast.error("Diese Ansicht ist beschädigt.");
    }
  }

  async function saveView(name: string) {
    const def: ViewDef = { v: VIEW_VERSION, conditions, conj, columns, sort, search };
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
    if (!view) return;
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
    setConditions([]);
    setSearch("");
    setSort(null);
    setColumns(DEFAULT_VISIBLE);
    setViewId("");
  }

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Tabelle</h1>
            <p className="text-base text-muted-foreground">
              {zahl.format(visibleRows.length)} von {zahl.format(rows.length)} Einträgen · Unikate und Editionsware
            </p>
          </div>
          <Button variant="outline" className="h-11 text-base" onClick={() => downloadCsv(visibleRows)} disabled={visibleRows.length === 0}>
            <Download className="w-5 h-5 mr-2" aria-hidden />
            CSV-Export
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-56">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" aria-label="Suche" placeholder="In allen Feldern suchen" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 pl-10 text-base" />
          </div>
          <Button variant={activeConditions.length ? "default" : "outline"} className="h-11 text-base" onClick={() => (conditions.length ? setFilterOpen((o) => !o) : addCondition())} aria-expanded={filterOpen}>
            <SlidersHorizontal className="w-5 h-5 mr-2" aria-hidden />
            Filter{activeConditions.length ? ` (${activeConditions.length})` : ""}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-11 text-base">
                <Columns3 className="w-5 h-5 mr-2" aria-hidden />
                Spalten
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 max-h-96 overflow-y-auto p-2">
              {COLUMNS.map((c) => {
                const checked = columns.includes(c.key);
                return (
                  <label key={c.key} className="flex items-center gap-3 min-h-11 px-2 rounded-md hover:bg-muted cursor-pointer">
                    <Checkbox checked={checked} onCheckedChange={() => setColumns((cols) => (checked ? cols.filter((k) => k !== c.key) : COLUMNS.map((x) => x.key).filter((k) => k === c.key || cols.includes(k))))} />
                    <span className="text-base">{c.label}</span>
                  </label>
                );
              })}
              <Button variant="ghost" className="w-full h-11 text-base mt-1" onClick={() => setColumns(DEFAULT_VISIBLE)}>
                Standardspalten
              </Button>
            </PopoverContent>
          </Popover>
          <select aria-label="Gespeicherte Ansicht" value={viewId} onChange={(e) => (e.target.value ? applyView(e.target.value) : setViewId(""))} className={`${selectClass} max-w-60`}>
            <option value="">Gespeicherte Ansichten</option>
            {ansichten.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <Button variant="outline" className="h-11 text-base" onClick={() => setSaveOpen(true)}>
            <Bookmark className="w-5 h-5 mr-2" aria-hidden />
            Ansicht speichern
          </Button>
          {viewId && deleteView.enabled && (
            <Button variant="ghost" className="h-11 text-base" onClick={removeView}>
              <Trash2 className="w-4 h-4 mr-1" aria-hidden />
              Ansicht entfernen
            </Button>
          )}
        </div>

        {filterOpen && (
          <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
            {conditions.length === 0 ? (
              <p className="text-base text-muted-foreground">Noch keine Filter. Mit „Bedingung hinzufügen“ eingrenzen.</p>
            ) : (
              conditions.map((c, i) => (
                <ConditionRow
                  key={c.id}
                  c={c}
                  index={i}
                  conj={conj}
                  onConj={setConj}
                  optionsFor={optionsFor}
                  onChange={(next) => {
                    setConditions((cs) => cs.map((x) => (x.id === c.id ? next : x)));
                    setViewId("");
                  }}
                  onRemove={() => setConditions((cs) => cs.filter((x) => x.id !== c.id))}
                />
              ))
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="h-11 text-base" onClick={addCondition}>
                <Plus className="w-5 h-5 mr-1" aria-hidden />
                Bedingung hinzufügen
              </Button>
              {(conditions.length > 0 || search || sort) && (
                <Button variant="ghost" className="h-11 text-base" onClick={reset}>
                  Alles zurücksetzen
                </Button>
              )}
            </div>
          </div>
        )}

        {failed ? (
          <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-base">
            Die Daten konnten nicht geladen werden. Bitte die Seite neu laden.
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-base text-muted-foreground py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Tabelle wird geladen …
          </div>
        ) : (
          <div className="rounded-xl border overflow-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-2.5 py-1 w-14">
                    <span className="sr-only">Foto</span>
                  </th>
                  {shown.map((c) => {
                    const active = sort?.key === c.key;
                    return (
                      <th key={c.key} scope="col" className={`px-2.5 py-1 font-medium whitespace-nowrap ${c.align === "right" ? "text-right" : "text-left"}`} aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : "none"}>
                        <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 min-h-11 min-w-11 hover:text-foreground">
                          {c.label}
                          {active && (sort?.dir === "asc" ? <ArrowUp className="w-4 h-4" aria-hidden /> : <ArrowDown className="w-4 h-4" aria-hidden />)}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={shown.length + 1} className="px-4 py-10 text-center text-base">
                      Keine Einträge gefunden.{" "}
                      <button type="button" className="underline min-h-11" onClick={reset}>
                        Filter zurücksetzen
                      </button>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((r) => (
                    <tr key={`${r.art}-${r.id}`} onClick={() => setSelected(r)} className="border-t cursor-pointer hover:bg-muted/40">
                      <td className="px-2.5 py-1.5">
                        {r.foto ? (
                          <img src={thumb(r.foto, "small")} alt="" loading="lazy" className="w-9 h-9 rounded object-cover" />
                        ) : (
                          <span className="w-9 h-9 rounded bg-muted flex items-center justify-center text-muted-foreground" aria-label="Kein Foto">
                            <ImageOff className="w-4 h-4" aria-hidden />
                          </span>
                        )}
                      </td>
                      {shown.map((c) => (
                        <td key={c.key} className={`px-2.5 py-1.5 ${c.align === "right" ? "text-right tabular-nums whitespace-nowrap" : ""} ${c.key === "name" ? "font-medium min-w-44" : c.key === "notiz" ? "min-w-56" : "whitespace-nowrap"}`}>
                          {c.key === "status" && r.status ? (
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-sm ${STATUS_STYLE[r.status] ?? "bg-muted border-border"}`}>{r.status}</span>
                          ) : c.key === "name" ? (
                            <button type="button" className="text-left hover:underline min-h-11" onClick={() => setSelected(r)}>
                              {r.name || "Ohne Namen"}
                            </button>
                          ) : (
                            formatCell(c, r)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              {visibleRows.length > 0 && (
                <tfoot className="bg-muted/60 sticky bottom-0">
                  <tr className="border-t font-medium">
                    <td className="px-2.5 py-2" />
                    {shown.map((c, i) => (
                      <td key={c.key} className={`px-2.5 py-2 whitespace-nowrap ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                        {c.key === "anzahl" ? `${zahl.format(summeAnzahl)} Stück` : c.key === "preis" ? euro.format(summePreis) : i === 0 ? "Summe" : ""}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Tipp: Spaltenkopf antippen zum Sortieren. Zeile antippen für alle Angaben. Bearbeitet wird im Bestand.
        </p>
      </div>
      <SaveViewDialog open={saveOpen} onOpenChange={setSaveOpen} onSave={saveView} />
      {selected && <Detail r={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

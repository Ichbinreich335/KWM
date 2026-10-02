import { useEffect, useMemo, useState } from "react";
import {
  datasource,
  q,
  useLinkedRecords,
  useRecordCreate,
  useRecordDelete,
  useRecordUpdate,
  useRecords,
  useUpload,
} from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Download,
  ImageOff,
  Loader2,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({
  unikate: "unikate",
  edition: "edition",
  ansichten: "ansichten",
});

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
});
const unikatBasicFields = q.select({
  status: "SEUyZ",
  lagerort: "EkVC3",
  galerie: "NfsXv",
  notiz: "Ku4py",
  verkauftAm: "48BXo",
  fotos: "rqreT",
});
const editionSelect = q.select({
  bez: "LFUIR",
  modell: "jxN6x",
  typ: "8Vs2H",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  lagerort: "T5iQe",
  foto: "nibt5",
  notiz: "lyJky",
  geaendertAm: "JZyKO",
});
const editionUpdateFields = q.select({ anzahl: "Ciiwp", lagerort: "T5iQe", notiz: "lyJky" });
const ansichtSelect = q.select({ name: "8s5KL", definition: "rWGS9", von: "uPraE" });
const userProperties = { role: "z0b2k" };

const PAGE_SIZE = 100;
const CARD_STEP = 48;
const KOMMISSION = "in Kommission";
const VERKAUFT = "verkauft";
const ROHLING = "Rohling";
const STATUS_LIST = ["verfügbar", "reserviert", VERKAUFT, KOMMISSION];
const TYP_LIST = ["Teller", "Schale", "Becher", "Vase", "Karaffe", "Obertopf"];
const EVENT_ADMIN_EDIT = "kwm:unikat-admin-bearbeiten";
const EVENT_UNIKAT_CHANGED = "kwm:unikat-geaendert";

const STATUS_STYLE: Record<string, string> = {
  verfügbar: "bg-emerald-100 text-emerald-800 border-emerald-200",
  reserviert: "bg-amber-100 text-amber-900 border-amber-200",
  [VERKAUFT]: "bg-zinc-100 text-zinc-600 border-zinc-200",
  [KOMMISSION]: "bg-sky-100 text-sky-800 border-sky-200",
};
const ZUSTAND_STYLE: Record<string, string> = {
  [ROHLING]: "bg-stone-100 text-stone-700 border-stone-200",
  glasiert: "bg-teal-50 text-teal-800 border-teal-200",
};

type Opt = { id: string; label: string };
type Attachment = { id?: string; url: string; filename?: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };

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
};

type Edition = {
  id: string;
  bez: string;
  modell: string;
  typ: string;
  glasur: string;
  zustand: string;
  anzahl: number;
  lagerort: Opt | undefined;
  foto: Attachment[];
  notiz: string;
};

type ListKey = "typ" | "status" | "kuenstler" | "glasur" | "lagerort" | "galerie";
type Filters = Record<ListKey, string[]> & {
  website: "" | "ja" | "nein";
  jahrVon: string;
  jahrBis: string;
  preisVon: string;
  preisBis: string;
};
type SortKey = "nummer" | "name" | "typ" | "status" | "kuenstler" | "jahr" | "lagerort" | "preis" | "erfasstAm";
type Sort = { key: SortKey; dir: "asc" | "desc" };
type TabKey = "alle" | "verfuegbar" | "schalen" | "vasen" | "teller" | "kommission" | "edition" | "tabelle";

const NO_FILTERS: Filters = {
  typ: [],
  status: [],
  kuenstler: [],
  glasur: [],
  lagerort: [],
  galerie: [],
  website: "",
  jahrVon: "",
  jahrBis: "",
  preisVon: "",
  preisBis: "",
};
const DEFAULT_SORT: Sort = { key: "erfasstAm", dir: "desc" };

const TABS: { key: TabKey; label: string; preset?: Partial<Filters> }[] = [
  { key: "alle", label: "Alle" },
  { key: "verfuegbar", label: "Verfügbar", preset: { status: ["verfügbar"] } },
  { key: "schalen", label: "Schalen", preset: { typ: ["Schale"] } },
  { key: "vasen", label: "Vasen", preset: { typ: ["Vase"] } },
  { key: "teller", label: "Teller", preset: { typ: ["Teller"] } },
  { key: "kommission", label: "In Kommission", preset: { status: [KOMMISSION] } },
  { key: "edition", label: "Editionsware" },
  { key: "tabelle", label: "Alle Stücke (Tabelle)" },
];

const LIST_FILTERS: { key: ListKey; label: string }[] = [
  { key: "typ", label: "Typ" },
  { key: "status", label: "Status" },
  { key: "kuenstler", label: "Künstler:in" },
  { key: "glasur", label: "Glasur" },
  { key: "lagerort", label: "Lagerort" },
  { key: "galerie", label: "Galerie" },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "erfasstAm:desc", label: "Neueste zuerst" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "nummer:asc", label: "Inventarnummer" },
  { value: "preis:desc", label: "Preis absteigend" },
  { value: "lagerort:asc", label: "Lagerort" },
];

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function asOpts(v: unknown): Opt[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(asOpts);
  if (typeof v === "object" && "id" in (v as object)) {
    const o = v as { id: string; label?: string; title?: string };
    return [{ id: o.id, label: o.label ?? o.title ?? "" }];
  }
  if (typeof v === "string") return [{ id: v, label: v }];
  return [];
}

function asAttachments(v: unknown): Attachment[] {
  if (!v) return [];
  const list = Array.isArray(v) ? v : [v];
  return list.filter((a): a is Attachment => !!a && typeof a === "object" && "url" in a);
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
  };
}

function toEdition(item: RawItem): Edition {
  const f = item.fields;
  return {
    id: item.id,
    bez: str(f.bez),
    modell: asOpts(f.modell)[0]?.label ?? str(f.bez),
    typ: asOpts(f.typ)[0]?.label ?? "",
    glasur: asOpts(f.glasur)[0]?.label ?? "",
    zustand: asOpts(f.zustand)[0]?.label ?? "",
    anzahl: num(f.anzahl) ?? 0,
    lagerort: asOpts(f.lagerort)[0],
    foto: asAttachments(f.foto),
    notiz: str(f.notiz),
  };
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function link(id: string | undefined) {
  return id ? [id] : [];
}

function parseNumber(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function filterValues(u: Unikat, key: ListKey): string[] {
  switch (key) {
    case "typ":
      return [u.typ];
    case "status":
      return [u.status];
    case "kuenstler":
      return u.kuenstler ? [u.kuenstler.label] : [];
    case "glasur":
      return u.glasur.map((g) => g.label);
    case "lagerort":
      return u.lagerort ? [u.lagerort.label] : [];
    case "galerie":
      return u.galerie ? [u.galerie.label] : [];
  }
}

function matchesFilters(u: Unikat, f: Filters): boolean {
  for (const { key } of LIST_FILTERS) {
    const wanted = f[key];
    if (wanted.length && !filterValues(u, key).some((v) => wanted.includes(v))) return false;
  }
  if (f.website === "ja" && !u.website) return false;
  if (f.website === "nein" && u.website) return false;
  const jahrVon = parseNumber(f.jahrVon);
  const jahrBis = parseNumber(f.jahrBis);
  if (jahrVon !== null && (u.jahr === null || u.jahr < jahrVon)) return false;
  if (jahrBis !== null && (u.jahr === null || u.jahr > jahrBis)) return false;
  const preisVon = parseNumber(f.preisVon);
  const preisBis = parseNumber(f.preisBis);
  if (preisVon !== null && (u.preis === null || u.preis < preisVon)) return false;
  if (preisBis !== null && (u.preis === null || u.preis > preisBis)) return false;
  return true;
}

function matchesSearch(u: Unikat, term: string): boolean {
  if (!term) return true;
  const hay = [u.name, u.inv, u.typ, u.status, u.kuenstler?.label, u.lagerort?.label, u.galerie?.label, u.notiz, u.masse]
    .concat(u.glasur.map((g) => g.label))
    .join(" ")
    .toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .every((t) => hay.includes(t));
}

function sortValue(u: Unikat, key: SortKey): string | number | null {
  switch (key) {
    case "kuenstler":
      return u.kuenstler?.label ?? null;
    case "lagerort":
      return u.lagerort?.label ?? null;
    case "jahr":
      return u.jahr;
    case "preis":
      return u.preis;
    case "nummer":
      return u.nummer;
    default:
      return u[key] || null;
  }
}

function compare(a: Unikat, b: Unikat, sort: Sort): number {
  const va = sortValue(a, sort.key);
  const vb = sortValue(b, sort.key);
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "de");
  return sort.dir === "asc" ? r : -r;
}

function countActive(f: Filters): number {
  return (
    LIST_FILTERS.reduce((n, { key }) => n + (f[key].length ? 1 : 0), 0) +
    (f.website ? 1 : 0) +
    (f.jahrVon || f.jahrBis ? 1 : 0) +
    (f.preisVon || f.preisBis ? 1 : 0)
  );
}

function csvCell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(";"));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
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
    [
      "Inventarnummer",
      "Name",
      "Typ",
      "Status",
      "Künstler:in",
      "Jahr",
      "Glasur",
      "Maße",
      "Lagerort",
      "Galerie",
      "Preis intern (€)",
      "Auf Website zeigen",
      "Notiz",
      "Erfasst am",
      "Verkauft am",
    ],
    list.map((u) => [
      u.inv,
      u.name,
      u.typ,
      u.status,
      u.kuenstler?.label,
      u.jahr,
      u.glasur.map((g) => g.label).join(", "),
      u.masse,
      u.lagerort?.label,
      u.galerie?.label,
      u.preis,
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
    list.map((e) => [e.modell, e.typ, e.zustand, e.glasur, e.anzahl, e.lagerort?.label, e.notiz]),
  );
}

type LinkedPages = { pages: { items: { id: string; title: string }[] }[] } | undefined;

function toOptions(data: LinkedPages): Opt[] {
  return (data?.pages.flatMap((p) => p.items) ?? []).map((o) => ({ id: o.id, label: o.title }));
}

function useAllPages(query: {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage: () => unknown;
}) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

function Badge({ text, styles }: { text: string; styles: Record<string, string> }) {
  if (!text) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap ${
        styles[text] ?? "bg-muted text-foreground border-border"
      }`}
    >
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

function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 rounded-md border border-input bg-background px-3 text-base"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ChipToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 px-4 rounded-full border text-base ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
      }`}
    >
      {children}
    </button>
  );
}

function UnikatCard({ u, onOpen }: { u: Unikat; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left flex gap-3 rounded-xl border bg-card p-3 hover:border-primary/50 hover:shadow-sm transition"
    >
      <Thumb fotos={u.fotos} size="medium" className="w-24 h-24 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-semibold text-base leading-snug break-words">{u.name || "Ohne Namen"}</p>
        <p className="text-sm text-muted-foreground">
          {u.inv} · {u.typ}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge text={u.status} styles={STATUS_STYLE} />
          {u.preis !== null && <span className="text-sm font-medium">{euro.format(u.preis)}</span>}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {u.status === KOMMISSION && u.galerie ? u.galerie.label : u.lagerort?.label ?? "Kein Lagerort"}
        </p>
      </div>
    </button>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onSort: (s: Sort) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === sortKey;
  const nextDir = active && sort.dir === "asc" ? "desc" : "asc";
  return (
    <th scope="col" className={`px-3 py-2 font-medium text-${align}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort({ key: sortKey, dir: nextDir })}
        className="inline-flex items-center gap-1 min-h-11 min-w-11 hover:text-foreground"
      >
        {label}
        {active && (sort.dir === "asc" ? <ArrowUp className="w-4 h-4" aria-hidden /> : <ArrowDown className="w-4 h-4" aria-hidden />)}
      </button>
    </th>
  );
}

function UnikatTable({ list, sort, onSort, onOpen }: { list: Unikat[]; sort: Sort; onSort: (s: Sort) => void; onOpen: (id: string) => void }) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-muted-foreground">
          <tr>
            <th scope="col" className="px-2.5 py-2 w-14">
              <span className="sr-only">Foto</span>
            </th>
            <SortHeader label="Inv.-Nr." sortKey="nummer" sort={sort} onSort={onSort} />
            <SortHeader label="Name" sortKey="name" sort={sort} onSort={onSort} />
            <SortHeader label="Typ" sortKey="typ" sort={sort} onSort={onSort} />
            <SortHeader label="Status" sortKey="status" sort={sort} onSort={onSort} />
            <SortHeader label="Künstler:in" sortKey="kuenstler" sort={sort} onSort={onSort} />
            <th scope="col" className="px-2.5 py-2 font-medium text-left">
              Glasur
            </th>
            <SortHeader label="Jahr" sortKey="jahr" sort={sort} onSort={onSort} />
            <SortHeader label="Lagerort" sortKey="lagerort" sort={sort} onSort={onSort} />
            <SortHeader label="Preis" sortKey="preis" sort={sort} onSort={onSort} align="right" />
            <th scope="col" className="hidden 2xl:table-cell px-2.5 py-2 font-medium text-left">
              Website
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id} onClick={() => onOpen(u.id)} className="border-t cursor-pointer hover:bg-muted/40">
              <td className="px-2.5 py-2">
                <Thumb fotos={u.fotos} size="small" className="w-10 h-10 rounded-md" />
              </td>
              <td className="px-2.5 py-2 whitespace-nowrap">{u.inv}</td>
              <td className="px-2.5 py-2 min-w-40">
                <button type="button" className="text-left font-medium hover:underline min-h-11" onClick={() => onOpen(u.id)}>
                  {u.name || "Ohne Namen"}
                </button>
              </td>
              <td className="px-2.5 py-2">{u.typ}</td>
              <td className="px-2.5 py-2">
                <Badge text={u.status} styles={STATUS_STYLE} />
              </td>
              <td className="px-2.5 py-2 whitespace-nowrap">{u.kuenstler?.label}</td>
              <td className="px-2.5 py-2 min-w-28">{u.glasur.map((g) => g.label).join(", ")}</td>
              <td className="px-2.5 py-2">{u.jahr ?? ""}</td>
              <td className="px-2.5 py-2 whitespace-nowrap">
                {u.status === KOMMISSION && u.galerie ? u.galerie.label : u.lagerort?.label}
              </td>
              <td className="px-2.5 py-2 text-right whitespace-nowrap">{u.preis !== null ? euro.format(u.preis) : ""}</td>
              <td className="hidden 2xl:table-cell px-2.5 py-2">{u.website ? "ja" : "nein"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  values,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  values: Record<ListKey, string[]>;
}) {
  const toggle = (key: ListKey, v: string) => {
    const cur = filters[key];
    onChange({ ...filters, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
          <SheetDescription>Alle gewählten Filter gelten gleichzeitig. Innerhalb einer Gruppe reicht ein Treffer.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-6">
          {LIST_FILTERS.map(({ key, label }) => (
            <fieldset key={key}>
              <legend className="text-base font-medium mb-2">{label}</legend>
              {values[key].length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Werte vorhanden.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {values[key].map((v) => (
                    <ChipToggle key={v} active={filters[key].includes(v)} onClick={() => toggle(key, v)}>
                      {v}
                    </ChipToggle>
                  ))}
                </div>
              )}
            </fieldset>
          ))}
          <fieldset>
            <legend className="text-base font-medium mb-2">Auf Website zeigen</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["", "egal"],
                  ["ja", "ja"],
                  ["nein", "nein"],
                ] as const
              ).map(([v, label]) => (
                <ChipToggle key={label} active={filters.website === v} onClick={() => onChange({ ...filters, website: v })}>
                  {label}
                </ChipToggle>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-base font-medium mb-2">Jahr</legend>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Jahr von"
                inputMode="numeric"
                placeholder="von"
                value={filters.jahrVon}
                onChange={(e) => onChange({ ...filters, jahrVon: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                className="h-12 text-base"
              />
              <span aria-hidden>–</span>
              <Input
                aria-label="Jahr bis"
                inputMode="numeric"
                placeholder="bis"
                value={filters.jahrBis}
                onChange={(e) => onChange({ ...filters, jahrBis: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                className="h-12 text-base"
              />
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-base font-medium mb-2">Preis intern (€)</legend>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Preis von"
                inputMode="decimal"
                placeholder="von"
                value={filters.preisVon}
                onChange={(e) => onChange({ ...filters, preisVon: e.target.value })}
                className="h-12 text-base"
              />
              <span aria-hidden>–</span>
              <Input
                aria-label="Preis bis"
                inputMode="decimal"
                placeholder="bis"
                value={filters.preisBis}
                onChange={(e) => onChange({ ...filters, preisBis: e.target.value })}
                className="h-12 text-base"
              />
            </div>
          </fieldset>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="h-12 flex-1 text-base" onClick={() => onChange(NO_FILTERS)}>
              Alle Filter löschen
            </Button>
            <Button className="h-12 flex-1 text-base" onClick={() => onOpenChange(false)}>
              Fertig
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActiveFilterChips({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const chips: { label: string; clear: () => void }[] = [];
  for (const { key, label } of LIST_FILTERS) {
    if (filters[key].length) chips.push({ label: `${label}: ${filters[key].join(", ")}`, clear: () => onChange({ ...filters, [key]: [] }) });
  }
  if (filters.website) chips.push({ label: `Website: ${filters.website}`, clear: () => onChange({ ...filters, website: "" }) });
  if (filters.jahrVon || filters.jahrBis)
    chips.push({
      label: `Jahr: ${filters.jahrVon || "…"}–${filters.jahrBis || "…"}`,
      clear: () => onChange({ ...filters, jahrVon: "", jahrBis: "" }),
    });
  if (filters.preisVon || filters.preisBis)
    chips.push({
      label: `Preis: ${filters.preisVon || "…"}–${filters.preisBis || "…"} €`,
      clear: () => onChange({ ...filters, preisVon: "", preisBis: "" }),
    });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-foreground pl-3 text-sm">
          {c.label}
          <button type="button" onClick={c.clear} aria-label={`${c.label} entfernen`} className="w-11 h-11 inline-flex items-center justify-center">
            <X className="w-4 h-4" aria-hidden />
          </button>
        </span>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base break-words">{value || "–"}</dd>
    </div>
  );
}

type EditForm = {
  status: string;
  lagerortId: string;
  galerieId: string;
  notiz: string;
};

function UnikatDetail({
  u,
  isAdmin,
  onClose,
  onSaved,
  lagerorte,
  galerien,
}: {
  u: Unikat;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  lagerorte: Opt[];
  galerien: Opt[];
}) {
  const [form, setForm] = useState<EditForm>(() => ({
    status: u.status,
    lagerortId: u.lagerort?.id ?? "",
    galerieId: u.galerie?.id ?? "",
    notiz: u.notiz,
  }));
  const [photoIndex, setPhotoIndex] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const { uploadAsync } = useUpload();
  const basicUpdate = useRecordUpdate({ from: ds.unikate, fields: unikatBasicFields });
  const set = <K extends keyof EditForm>(k: K, v: EditForm[K]) => setForm((s) => ({ ...s, [k]: v }));
  const photo = u.fotos[Math.min(photoIndex, u.fotos.length - 1)];
  const canEdit = basicUpdate.enabled;

  async function save() {
    setBusy(true);
    try {
      let fotos: { id?: string; url: string; filename?: string }[] | undefined;
      if (newFiles.length) {
        const results = await uploadAsync(newFiles);
        if (results.some((r) => r.status !== "completed")) throw new Error("Foto konnte nicht hochgeladen werden.");
        fotos = [
          ...results.map((r) => ({ url: r.url as string, filename: r.file.name })),
          ...u.fotos.map((a) => ({ id: a.id, url: a.url, filename: a.filename })),
        ];
      }
      const becameSold = form.status === VERKAUFT && u.status !== VERKAUFT;
      const common = {
        status: form.status,
        lagerort: link(form.lagerortId),
        galerie: form.status === KOMMISSION ? link(form.galerieId) : [],
        notiz: form.notiz.trim(),
        ...(becameSold ? { verkauftAm: today() } : {}),
        ...(fotos ? { fotos } : {}),
      };
      await basicUpdate.mutateAsync({ recordId: u.id, fields: common } as never);
      await onSaved();
      setNewFiles([]);
      toast.success("Änderungen gespeichert.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{u.name || "Ohne Namen"}</SheetTitle>
          <SheetDescription>
            {u.inv} · {u.typ}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8 space-y-6">
          {photo ? (
            <div className="space-y-2">
              <img src={thumb(photo, "large")} alt={u.name} className="w-full max-h-96 object-contain rounded-xl bg-muted" />
              {u.fotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {u.fotos.map((a, i) => (
                    <button
                      key={a.id ?? a.url}
                      type="button"
                      aria-label={`Foto ${i + 1} zeigen`}
                      onClick={() => setPhotoIndex(i)}
                      className={`shrink-0 rounded-md overflow-hidden border-2 ${i === photoIndex ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={thumb(a, "small")} alt="" className="w-16 h-16 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-40 rounded-xl bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ImageOff className="w-6 h-6" aria-hidden />
              Noch kein Foto
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Badge text={u.status} styles={STATUS_STYLE} />
            {u.preis !== null && <span className="text-lg font-semibold">{euro.format(u.preis)}</span>}
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <Field label="Künstler:in" value={u.kuenstler?.label ?? ""} />
            <Field label="Jahr" value={u.jahr !== null ? String(u.jahr) : ""} />
            <Field label="Glasur" value={u.glasur.map((g) => g.label).join(", ")} />
            <Field label="Maße" value={u.masse} />
            <Field label="Lagerort" value={u.lagerort?.label ?? ""} />
            <Field label="Galerie" value={u.galerie?.label ?? ""} />
            <Field label="Auf Website zeigen" value={u.website ? "ja" : "nein"} />
            <Field label="Bildnachweis" value={u.bildnachweis} />
            <Field label="Erfasst" value={[formatDate(u.erfasstAm), u.erfasstVon].filter(Boolean).join(", von ")} />
            <Field label="Verkauft am" value={formatDate(u.verkauftAm)} />
          </dl>
          {u.notiz && <Field label="Notiz" value={u.notiz} />}

          {canEdit && (
            <section className="rounded-xl border p-4 space-y-5" aria-labelledby="bearbeiten-titel">
              <h3 id="bearbeiten-titel" className="text-lg font-semibold">
                Bearbeiten
              </h3>
              <div>
                <p className="text-base font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_LIST.map((s) => (
                    <ChipToggle key={s} active={form.status === s} onClick={() => set("status", s)}>
                      {s}
                    </ChipToggle>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="d-lagerort" className="block text-base font-medium mb-2">
                  Lagerort
                </label>
                <OptionSelect id="d-lagerort" value={form.lagerortId} onChange={(v) => set("lagerortId", v)} options={lagerorte} placeholder="Kein Lagerort" />
              </div>
              {form.status === KOMMISSION && (
                <div>
                  <label htmlFor="d-galerie" className="block text-base font-medium mb-2">
                    Galerie
                  </label>
                  <OptionSelect id="d-galerie" value={form.galerieId} onChange={(v) => set("galerieId", v)} options={galerien} placeholder="Galerie wählen" />
                </div>
              )}
              <div>
                <label htmlFor="d-notiz" className="block text-base font-medium mb-2">
                  Notiz
                </label>
                <Textarea id="d-notiz" rows={3} value={form.notiz} onChange={(e) => set("notiz", e.target.value)} className="text-base" />
              </div>
              <div>
                <label htmlFor="d-foto" className="block text-base font-medium mb-2">
                  Foto hinzufügen
                </label>
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

              <Button className="w-full h-12 text-base" onClick={save} disabled={busy}>
                {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
                {busy ? "Wird gespeichert …" : "Änderungen speichern"}
              </Button>
              <p className="text-sm text-muted-foreground">Löschen ist nicht vorgesehen. Verkaufte Stücke bitte auf „verkauft“ setzen.</p>
            </section>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={() => {
                window.dispatchEvent(new CustomEvent(EVENT_ADMIN_EDIT, { detail: { id: u.id } }));
                onClose();
              }}
            >
              Alle Felder bearbeiten (Admin)
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EditionRow({
  e,
  busy,
  onAdjust,
  onOpen,
  canEdit,
}: {
  e: Edition;
  busy: boolean;
  onAdjust: (delta: number) => void;
  onOpen: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 min-w-0">
      <button type="button" onClick={onOpen} className="flex items-center gap-3 min-w-0 flex-1 text-left">
        <Thumb fotos={e.foto} size="small" className="w-14 h-14 shrink-0 rounded-lg" />
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-base leading-snug break-words">{e.modell}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge text={e.zustand} styles={ZUSTAND_STYLE} />
            {e.glasur && <span className="text-sm">{e.glasur}</span>}
          </div>
          <p className="text-sm text-muted-foreground truncate">{e.lagerort?.label ?? "Kein Lagerort"}</p>
        </div>
      </button>
      <div className="flex items-center gap-1 shrink-0">
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

function EditionDetail({
  e,
  onClose,
  onSave,
  lagerorte,
}: {
  e: Edition;
  onClose: () => void;
  onSave: (fields: { anzahl: number; lagerort: string[]; notiz: string }) => Promise<void>;
  lagerorte: Opt[];
}) {
  const [anzahl, setAnzahl] = useState(String(e.anzahl));
  const [lagerortId, setLagerortId] = useState(e.lagerort?.id ?? "");
  const [notiz, setNotiz] = useState(e.notiz);
  const [busy, setBusy] = useState(false);
  const value = Number(anzahl) || 0;
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{e.modell}</SheetTitle>
          <SheetDescription>
            {[e.typ, e.zustand, e.glasur].filter(Boolean).join(" · ")}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8 space-y-6">
          {e.foto[0] && <img src={thumb(e.foto[0], "large")} alt={e.modell} className="w-full max-h-72 object-contain rounded-xl bg-muted" />}
          <div>
            <label htmlFor="ed-anzahl" className="block text-base font-medium mb-2">
              Anzahl
            </label>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-14 w-14" aria-label="Eins weniger" onClick={() => setAnzahl(String(Math.max(0, value - 1)))}>
                <Minus className="w-6 h-6" aria-hidden />
              </Button>
              <Input id="ed-anzahl" inputMode="numeric" value={anzahl} onChange={(ev) => setAnzahl(ev.target.value.replace(/\D/g, ""))} className="h-14 w-28 text-center text-2xl" />
              <Button variant="outline" className="h-14 w-14" aria-label="Eins mehr" onClick={() => setAnzahl(String(value + 1))}>
                <Plus className="w-6 h-6" aria-hidden />
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="ed-lagerort" className="block text-base font-medium mb-2">
              Lagerort
            </label>
            <OptionSelect id="ed-lagerort" value={lagerortId} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
          </div>
          <div>
            <label htmlFor="ed-notiz" className="block text-base font-medium mb-2">
              Notiz
            </label>
            <Textarea id="ed-notiz" rows={3} value={notiz} onChange={(ev) => setNotiz(ev.target.value)} className="text-base" />
          </div>
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
        <Input id="view-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Vasen Seladon verfügbar" className="h-12 text-base" />
        <p className="text-sm text-muted-foreground">Gespeichert werden Filter, Suche und Sortierung. Alle Mitarbeitenden sehen die Ansicht.</p>
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

function initialParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export default function Block() {
  const user = useCurrentUser({ properties: userProperties });
  const roles = asOpts((user?.properties as { role?: unknown } | undefined)?.role).map((r) => r.label);
  const isAdmin = roles.includes("Admin");

  const [tab, setTab] = useState<TabKey>(() => {
    const t = initialParam("tab");
    return TABS.some((x) => x.key === t) ? (t as TabKey) : "alle";
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);
  const [filters, setFilters] = useState<Filters>(() => {
    const status = initialParam("status");
    return STATUS_LIST.includes(status) ? { ...NO_FILTERS, status: [status] } : NO_FILTERS;
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [viewId, setViewId] = useState("");
  const [selectedId, setSelectedId] = useState(() => initialParam("id"));
  const [editionId, setEditionId] = useState("");
  const [zustandFilter, setZustandFilter] = useState<"" | "Rohling" | "glasiert">("");
  const [limit, setLimit] = useState(CARD_STEP);
  const [pendingEdition, setPendingEdition] = useState("");

  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const ansichtenQuery = useRecords({ from: ds.ansichten, select: ansichtSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  const refetchUnikate = unikateQuery.refetch;
  useEffect(() => {
    const onChanged = () => refetchUnikate();
    window.addEventListener(EVENT_UNIKAT_CHANGED, onChanged);
    return () => window.removeEventListener(EVENT_UNIKAT_CHANGED, onChanged);
  }, [refetchUnikate]);

  const editionUpdate = useRecordUpdate({ from: ds.edition, fields: editionUpdateFields });
  const createView = useRecordCreate({ from: ds.ansichten, fields: ansichtSelect });
  const deleteView = useRecordDelete({ from: ds.ansichten });

  const lagerorte = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "lagerort", sortOrder: "ASC" }).data as LinkedPages);
  const galerien = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "galerie", sortOrder: "ASC" }).data as LinkedPages);
  const kuenstler = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "kuenstler", sortOrder: "ASC" }).data as LinkedPages);
  const glasuren = toOptions(useLinkedRecords({ from: ds.unikate, select: unikatSelect, field: "glasur", sortOrder: "ASC" }).data as LinkedPages);

  const unikate = useMemo(
    () => (unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toUnikat(i as RawItem)),
    [unikateQuery.data],
  );
  const editionen = useMemo(
    () => (editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toEdition(i as RawItem)),
    [editionQuery.data],
  );
  const ansichten = (ansichtenQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
    const f = (i as RawItem).fields;
    return { id: i.id, name: str(f.name), definition: str(f.definition) };
  });

  const filterOptionValues = useMemo(() => {
    const out = {} as Record<ListKey, string[]>;
    for (const { key } of LIST_FILTERS) {
      const master: Record<ListKey, string[]> = {
        typ: TYP_LIST,
        status: STATUS_LIST,
        kuenstler: kuenstler.map((o) => o.label),
        glasur: glasuren.map((o) => o.label),
        lagerort: lagerorte.map((o) => o.label),
        galerie: galerien.map((o) => o.label),
      };
      const set = new Set<string>(master[key]);
      unikate.forEach((u) => filterValues(u, key).forEach((v) => v && set.add(v)));
      out[key] = [...set].sort((a, b) =>
        key === "typ" || key === "status" ? 0 : a.localeCompare(b, "de"),
      );
    }
    return out;
  }, [unikate, kuenstler, glasuren, lagerorte, galerien]);

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const effectiveFilters: Filters = tab === "tabelle" ? filters : { ...NO_FILTERS, ...activeTab.preset };
  const visible = useMemo(
    () => unikate.filter((u) => matchesFilters(u, effectiveFilters) && matchesSearch(u, search.trim())).sort((a, b) => compare(a, b, sort)),
    [unikate, effectiveFilters, search, sort],
  );
  const visibleEdition = editionen
    .filter((e) => (zustandFilter ? e.zustand === zustandFilter : true))
    .filter((e) => {
      const t = search.trim().toLowerCase();
      return !t || [e.modell, e.glasur, e.zustand, e.typ, e.lagerort?.label, e.notiz].join(" ").toLowerCase().includes(t);
    })
    .sort((a, b) => a.modell.localeCompare(b.modell, "de") || a.zustand.localeCompare(b.zustand, "de"));

  const selected = unikate.find((u) => u.id === selectedId);
  const selectedEdition = editionen.find((e) => e.id === editionId);
  const loading = unikateQuery.status === "pending" || (tab === "edition" && editionQuery.status === "pending");
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const stillLoadingPages = !!unikateQuery.hasNextPage || !!editionQuery.hasNextPage;

  function changeTab(t: TabKey) {
    setTab(t);
    setLimit(CARD_STEP);
  }

  async function adjustEdition(e: Edition, delta: number) {
    setPendingEdition(e.id);
    try {
      await editionUpdate.mutateAsync({ recordId: e.id, fields: { anzahl: Math.max(0, e.anzahl + delta) } } as never);
      await editionQuery.refetch();
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

  async function saveView(name: string) {
    try {
      const created = await createView.mutateAsync({
        name,
        definition: JSON.stringify({ filters, sort, search }),
        von: user?.fullName || user?.email || "",
      } as never);
      await ansichtenQuery.refetch();
      setViewId((created as { id: string }).id);
      setSaveOpen(false);
      toast.success(`Ansicht „${name}“ gespeichert.`);
    } catch {
      toast.error("Ansicht konnte nicht gespeichert werden.");
    }
  }

  function applyView(id: string) {
    setViewId(id);
    const view = ansichten.find((v) => v.id === id);
    if (!view) return;
    try {
      const def = JSON.parse(view.definition) as { filters?: Partial<Filters>; sort?: Sort; search?: string };
      setFilters({ ...NO_FILTERS, ...def.filters });
      setSort(def.sort ?? DEFAULT_SORT);
      setSearch(def.search ?? "");
    } catch {
      toast.error("Diese Ansicht ist beschädigt.");
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

  const rohlingeGesamt = editionen.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0);
  const glasiertGesamt = editionen.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl, 0);
  const filterCount = countActive(filters);

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Bestand</h1>
            <p className="text-base text-muted-foreground">
              {tab === "edition"
                ? `${visibleEdition.length} Zeilen · ${rohlingeGesamt} Rohlinge · ${glasiertGesamt} glasiert`
                : `${visible.length} von ${unikate.length} Unikaten`}
              {stillLoadingPages ? " · lädt weitere …" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            className="h-11 text-base"
            onClick={() => (tab === "edition" ? exportEdition(visibleEdition) : exportUnikate(visible))}
            disabled={tab === "edition" ? visibleEdition.length === 0 : visible.length === 0}
          >
            <Download className="w-5 h-5 mr-2" aria-hidden />
            CSV-Export
          </Button>
        </div>

        <div role="tablist" aria-label="Ansichten" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => changeTab(t.key)}
              className={`shrink-0 min-h-11 px-4 rounded-full border text-base whitespace-nowrap ${
                tab === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              aria-label="Suche"
              placeholder={tab === "edition" ? "Modell oder Glasur suchen" : "Name, Inventarnummer, Glasur … suchen"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          {tab === "edition" ? (
            <div className="flex gap-2">
              {(
                [
                  ["", "Alle"],
                  ["Rohling", "Rohlinge"],
                  ["glasiert", "Glasiert"],
                ] as const
              ).map(([v, label]) => (
                <ChipToggle key={label} active={zustandFilter === v} onClick={() => setZustandFilter(v)}>
                  {label}
                </ChipToggle>
              ))}
            </div>
          ) : tab === "tabelle" ? (
            <div className="flex flex-wrap gap-2">
              <Button variant={filterCount ? "default" : "outline"} className="h-12 text-base" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal className="w-5 h-5 mr-2" aria-hidden />
                Filter{filterCount ? ` (${filterCount})` : ""}
              </Button>
              <Button variant="outline" className="h-12 text-base" onClick={() => setSaveOpen(true)}>
                <Bookmark className="w-5 h-5 mr-2" aria-hidden />
                Ansicht speichern
              </Button>
            </div>
          ) : (
            <select
              aria-label="Sortierung"
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":");
                setSort({ key: key as SortKey, dir: dir as Sort["dir"] });
              }}
              className="h-12 rounded-md border border-input bg-background px-3 text-base"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {tab === "tabelle" && (
          <div className="space-y-3">
            {ansichten.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="saved-view" className="text-base">
                  Gespeicherte Ansicht:
                </label>
                <select
                  id="saved-view"
                  value={viewId}
                  onChange={(e) => (e.target.value ? applyView(e.target.value) : setViewId(""))}
                  className="h-11 rounded-md border border-input bg-background px-3 text-base"
                >
                  <option value="">Bitte wählen</option>
                  {ansichten.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                {viewId && deleteView.enabled && (
                  <Button variant="ghost" className="h-11 text-base" onClick={removeView}>
                    <Trash2 className="w-4 h-4 mr-1" aria-hidden />
                    Ansicht entfernen
                  </Button>
                )}
              </div>
            )}
            <ActiveFilterChips filters={filters} onChange={setFilters} />
          </div>
        )}

        {failed ? (
          <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-base">
            Der Bestand konnte nicht geladen werden. Bitte die Seite neu laden.
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-base text-muted-foreground py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Bestand wird geladen …
          </div>
        ) : tab === "edition" ? (
          visibleEdition.length === 0 ? (
            <p className="rounded-xl border p-6 text-base text-muted-foreground text-center">Keine Editionsware gefunden.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {visibleEdition.map((e) => (
                <EditionRow
                  key={e.id}
                  e={e}
                  busy={pendingEdition === e.id}
                  canEdit={editionUpdate.enabled}
                  onAdjust={(d) => adjustEdition(e, d)}
                  onOpen={() => setEditionId(e.id)}
                />
              ))}
            </div>
          )
        ) : visible.length === 0 ? (
          <div className="rounded-xl border p-6 text-center space-y-3">
            <p className="text-base">Keine Stücke gefunden.</p>
            {(search || (tab === "tabelle" && filterCount > 0)) && (
              <Button
                variant="outline"
                className="h-11 text-base"
                onClick={() => {
                  setSearch("");
                  setFilters(NO_FILTERS);
                  setViewId("");
                }}
              >
                Suche und Filter zurücksetzen
              </Button>
            )}
          </div>
        ) : tab === "tabelle" ? (
          <UnikatTable list={visible} sort={sort} onSort={setSort} onOpen={setSelectedId} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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

      <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onChange={(f) => { setFilters(f); setViewId(""); }} values={filterOptionValues} />
      <SaveViewDialog open={saveOpen} onOpenChange={setSaveOpen} onSave={saveView} />
      {selected && (
        <UnikatDetail
          key={selected.id}
          u={selected}
          isAdmin={isAdmin}
          onClose={() => setSelectedId("")}
          onSaved={() => unikateQuery.refetch()}
          lagerorte={lagerorte}
          galerien={galerien}
        />
      )}
      {selectedEdition && (
        <EditionDetail
          key={selectedEdition.id}
          e={selectedEdition}
          onClose={() => setEditionId("")}
          onSave={(fields) => saveEdition(selectedEdition, fields)}
          lagerorte={lagerorte}
        />
      )}
    </div>
  );
}

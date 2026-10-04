// Datentypen, Umwandlung der Softr-Feldwerte, Formate und CSV. Einzige Quelle für alle Blöcke.
import { useEffect } from "react";

export type Opt = { id: string; label: string };
export type Attachment = { id?: string; url: string; filename?: string; thumbnails?: { url: string; size: string }[] };
export type RawItem = { id: string; fields: Record<string, unknown> };
export type LinkedPages = { pages: { items: { id: string; title: string }[] }[] } | undefined;
export type ThumbSize = "small" | "medium" | "large";

export const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const zahl = new Intl.NumberFormat("de-DE");

export function asOpts(v: unknown): Opt[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(asOpts);
  if (typeof v === "object" && "id" in (v as object)) {
    const o = v as { id: string; label?: string; title?: string };
    return [{ id: o.id, label: o.label ?? o.title ?? "" }];
  }
  return [];
}

export function firstLabel(v: unknown): string {
  return asOpts(v)[0]?.label ?? "";
}

export function asAttachments(v: unknown): Attachment[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).filter((a): a is Attachment => !!a && typeof a === "object" && "url" in a);
}

export function thumb(a: Attachment, size: ThumbSize): string {
  return a.thumbnails?.find((t) => t.size === size)?.url ?? a.url;
}

export function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

export function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function toOptions(data: LinkedPages): Opt[] {
  return (data?.pages.flatMap((p) => p.items) ?? []).map((o) => ({ id: o.id, label: o.title }));
}

// Auswahlliste aus einer Stammdaten-Tabelle (Felder name, archiviert). Archivierte fallen weg,
// außer sie sind am Datensatz schon gewählt, damit bestehende Angaben sichtbar bleiben.
export function activeOptions(data: { pages: { items: unknown[] }[] } | undefined, keep: string[] = []): Opt[] {
  return ((data?.pages.flatMap((p) => p.items) ?? []) as RawItem[])
    .filter((i) => i.fields.archiviert !== true || keep.includes(i.id))
    .map((i) => ({ id: i.id, label: str(i.fields.name) }))
    .sort((a, b) => a.label.localeCompare(b.label, "de"));
}

// Nachschlagefelder liefern je nach Feld einen Wert oder eine Liste mit einem Wert.
export function lookupValue(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}

// Artikelnummern wie 2, 6a, 10, 2018a in natürlicher Reihenfolge.
export function compareNr(a: string, b: string): number {
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  return a.localeCompare(b, "de", { numeric: true });
}

export function modellLabel(nr: string, name: string): string {
  return nr ? `${nr} · ${name}` : name;
}

// Lädt eine Liste frisch vom Server, z. B. direkt vor dem Speichern. So rechnet die App nie mit veralteten Zahlen,
// auch wenn auf einem zweiten Gerät gleichzeitig gearbeitet wird. null heißt: Laden fehlgeschlagen.
export async function freshItems(query: { refetch: () => Promise<unknown> }): Promise<RawItem[] | null> {
  const result = (await query.refetch()) as { data?: { pages: { items: unknown[] }[] }; status?: string } | undefined;
  if (!result?.data || result.status === "error") return null;
  return result.data.pages.flatMap((p) => p.items) as RawItem[];
}

export function link(id: string | undefined): string[] {
  return id ? [id] : [];
}

// Heutiges Datum in Ortszeit als JJJJ-MM-TT (nicht UTC, sonst springt das Datum nachts).
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
}

export function formatDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Deutsche Zahleneingabe: „1.200“ = 1200, „12,50“ = 12.5.
export function parseNumber(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}


function csvCell(v: string): string {
  return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function downloadCsv(filename: string, header: string[], rows: string[][]) {
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

export function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

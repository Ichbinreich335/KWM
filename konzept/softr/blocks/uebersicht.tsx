// Generiert von konzept/softr/build.mjs aus src/blocks/uebersicht.tsx und src/shared/. Nicht von Hand ändern.
import { useEffect, useMemo } from "react";
import { datasource, q, useRecords } from "@/lib/datasource";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, ChevronRight, ImageOff, Loader2 } from "lucide-react";

const PAGE_SIZE = 100;
const VERFUEGBAR = "verfügbar";
const RESERVIERT = "reserviert";
const VERKAUFT = "verkauft";
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const ROHLING = "Rohling";
const isAusserHaus = (status: string) => status === KOMMISSION || status === AUSGESTELLT;
type Opt = { id: string; label: string };
type Attachment = { id?: string; url: string; filename?: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };
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

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
}

function formatDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
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

function Section({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 min-w-0">
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

function Tile({ label, value, sub, warn, href }: { label: string; value: string; sub?: string; warn?: string; href: string }) {
  return (
    <a href={href} className="group block rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition min-h-28">
      <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        {label}
        <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100" aria-hidden />
      </p>
      <p className="text-3xl font-semibold mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
      {warn && <p className="text-sm text-red-800 mt-1">{warn}</p>}
    </a>
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

const ds = datasource.define({ unikate: "unikate", edition: "edition", partner: "partner" });

const unikatSelect = q.select({
  inv: "glG6V",
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  fotos: "rqreT",
  lagerort: "EkVC3",
  galerie: "NfsXv",
  preis: "N9yfT",
  erfasstAm: "p4ha0",
  geaendertAm: "aGhiL",
  verkauftAm: "48BXo",
  rueckgabe: "ENQkk",
});
const partnerSelect = q.select({ name: "a4yfc", art: "ZS9HU", ort: "RQRec" });
const editionSelect = q.select({
  modell: "jxN6x",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  lagerort: "T5iQe",
  foto: "nibt5",
  erfasstAm: "0x7rU",
  geaendertAm: "JZyKO",
});

const RECENT_COUNT = 6;
const LOW_STOCK = 5;
const SOON_DAYS = 14;
const AUSSER_HAUS_MAX = 8;
const DAY_MS = 86400000;
const TYP_ORDER = ["Teller", "Schale", "Becher", "Vase", "Karaffe", "Obertopf"];

// Geprüft mit dem dataviz-Validator (hell): alle harten Prüfungen bestanden, Zahlen stehen zusätzlich als Text.
const STOCK_SERIES = [
  { key: VERFUEGBAR, label: "verfügbar", color: "#1baf7a" },
  { key: RESERVIERT, label: "reserviert", color: "#eda100" },
  { key: KOMMISSION, label: "in Kommission", color: "#2a78d6" },
  { key: AUSGESTELLT, label: "ausgestellt", color: "#4a3aa7" },
] as const;
const EDITION_SERIES = [
  { key: ROHLING, label: "Rohlinge", color: "#eb6834" },
  { key: "glasiert", label: "glasiert", color: "#2a78d6" },
] as const;

type Unikat = {
  id: string;
  inv: string;
  name: string;
  typ: string;
  status: string;
  fotos: Attachment[];
  lagerort: string;
  galerie: string;
  galerieId: string;
  rueckgabe: string;
  preis: number;
  erfasstAm: string;
  geaendertAm: string;
  verkauftAm: string;
};
type Edition = {
  id: string;
  modell: string;
  glasur: string;
  zustand: string;
  anzahl: number;
  lagerort: string;
  fotos: Attachment[];
  erfasstAm: string;
  geaendertAm: string;
};
type BarRow = { label: string; values: { key: string; label: string; color: string; value: number }[]; total: number };

function fristStatus(iso: string): "ueberfaellig" | "bald" | "ok" | "" {
  if (!iso) return "";
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const tage = (new Date(`${iso.slice(0, 10)}T00:00:00`).getTime() - heute.getTime()) / DAY_MS;
  return tage < 0 ? "ueberfaellig" : tage <= SOON_DAYS ? "bald" : "ok";
}

function latest(...dates: string[]): string {
  return dates.filter(Boolean).sort().at(-1) ?? "";
}

function tabelleLink(params: Record<string, string>): string {
  return `/tabelle?${new URLSearchParams(params).toString()}`;
}

const AUSSER_HAUS_LINK = tabelleLink({ status: `${KOMMISSION},${AUSGESTELLT}` });

function Legend({ series }: { series: readonly { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground" aria-label="Legende">
      {series.map((s) => (
        <li key={s.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: s.color }} aria-hidden />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

function StackedBars({ rows, unit, max }: { rows: BarRow[]; unit: string; max: number }) {
  if (rows.length === 0) return <EmptyState text="Noch keine Daten." />;
  return (
    <TooltipProvider delayDuration={100}>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium break-words">{r.label}</span>
              <span className="tabular-nums shrink-0">
                {zahl.format(r.total)} {unit}
              </span>
            </div>
            <div className="flex h-3 w-full gap-0.5" role="img" aria-label={`${r.label}: ${r.values.map((v) => `${v.value} ${v.label}`).join(", ")}`}>
              {r.values
                .filter((v) => v.value > 0)
                .map((v, i, arr) => (
                  <Tooltip key={v.key}>
                    <TooltipTrigger asChild>
                      <span
                        className={`h-full ${i === 0 ? "rounded-l" : ""} ${i === arr.length - 1 ? "rounded-r" : ""}`}
                        style={{ width: `${(v.value / max) * 100}%`, background: v.color }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {r.label}: {zahl.format(v.value)} {v.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {r.values
                .filter((v) => v.value > 0)
                .map((v) => `${zahl.format(v.value)} ${v.label}`)
                .join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
}

function FristBadge({ iso }: { iso: string }) {
  if (!iso) return null;
  const frist = fristStatus(iso);
  return (
    <span className={`inline-block text-sm rounded-full px-2 py-0.5 mt-0.5 ${frist === "ueberfaellig" ? "bg-red-100 text-red-800" : frist === "bald" ? "bg-amber-100 text-amber-900" : "text-muted-foreground"}`}>
      {frist === "ueberfaellig" ? "überfällig seit " : "zurück bis "}
      {formatDate(iso)}
    </span>
  );
}

export default function Block() {
  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);

  const unikate = useMemo<Unikat[]>(
    () =>
      (unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
        const f = (i as RawItem).fields;
        return {
          id: i.id,
          inv: str(f.inv),
          name: str(f.name),
          typ: firstLabel(f.typ),
          status: firstLabel(f.status),
          fotos: asAttachments(f.fotos),
          lagerort: firstLabel(f.lagerort),
          galerie: firstLabel(f.galerie),
          galerieId: asOpts(f.galerie)[0]?.id ?? "",
          rueckgabe: str(f.rueckgabe),
          preis: num(f.preis) ?? 0,
          erfasstAm: str(f.erfasstAm),
          geaendertAm: str(f.geaendertAm),
          verkauftAm: str(f.verkauftAm),
        };
      }),
    [unikateQuery.data],
  );
  const editionen = useMemo<Edition[]>(
    () =>
      (editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
        const f = (i as RawItem).fields;
        return {
          id: i.id,
          modell: firstLabel(f.modell),
          glasur: firstLabel(f.glasur),
          zustand: firstLabel(f.zustand),
          anzahl: num(f.anzahl) ?? 0,
          lagerort: firstLabel(f.lagerort),
          fotos: asAttachments(f.foto),
          erfasstAm: str(f.erfasstAm),
          geaendertAm: str(f.geaendertAm),
        };
      }),
    [editionQuery.data],
  );
  const partnerInfo = useMemo(
    () =>
      new Map<string, { art: string; ort: string }>(
        (partnerQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
          const f = (i as RawItem).fields;
          return [i.id, { art: firstLabel(f.art), ort: str(f.ort) }];
        }),
      ),
    [partnerQuery.data],
  );

  const jahr = new Date().getFullYear();
  const stats = useMemo(() => {
    const by = (s: string) => unikate.filter((u) => u.status === s);
    const verfuegbar = by(VERFUEGBAR);
    const ausserHaus = unikate.filter((u) => isAusserHaus(u.status));
    const verkauftJahr = by(VERKAUFT).filter((u) => u.verkauftAm.startsWith(String(jahr)));
    const sum = (list: Unikat[]) => list.reduce((n, u) => n + u.preis, 0);
    return {
      verfuegbar: verfuegbar.length,
      verfuegbarWert: sum(verfuegbar),
      reserviert: by(RESERVIERT).length,
      ausserHaus: ausserHaus.length,
      partner: new Set(ausserHaus.map((u) => u.galerie).filter(Boolean)).size,
      ueberfaellig: ausserHaus.filter((u) => fristStatus(u.rueckgabe) === "ueberfaellig").length,
      verkauftJahr: verkauftJahr.length,
      umsatzJahr: sum(verkauftJahr),
      verkauftOhneDatum: by(VERKAUFT).filter((u) => !u.verkauftAm).length,
      rohlinge: editionen.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0),
      glasiert: editionen.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl, 0),
    };
  }, [unikate, editionen, jahr]);

  const typRows = useMemo<BarRow[]>(() => {
    const typen = [...TYP_ORDER, ...new Set(unikate.map((u) => u.typ).filter((t) => t && !TYP_ORDER.includes(t)))];
    return typen
      .map((typ) => {
        const values = STOCK_SERIES.map((s) => ({ ...s, value: unikate.filter((u) => u.typ === typ && u.status === s.key).length }));
        return { label: typ, values, total: values.reduce((n, v) => n + v.value, 0) };
      })
      .filter((r) => r.total > 0);
  }, [unikate]);

  const modellRows = useMemo<BarRow[]>(() => {
    const modelle = [...new Set(editionen.map((e) => e.modell).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
    return modelle.map((modell) => {
      const values = EDITION_SERIES.map((s) => ({
        ...s,
        value: editionen.filter((e) => e.modell === modell && (s.key === ROHLING ? e.zustand === ROHLING : e.zustand !== ROHLING)).reduce((n, e) => n + e.anzahl, 0),
      }));
      return { label: modell, values, total: values.reduce((n, v) => n + v.value, 0) };
    });
  }, [editionen]);

  const ausserHausGruppen = useMemo(() => {
    const groups = new Map<string, { key: string; name: string; art: string; ort: string; anzahl: number; naechste: string }>();
    unikate
      .filter((u) => isAusserHaus(u.status))
      .forEach((u) => {
        const key = u.galerieId || "ohne";
        const info = partnerInfo.get(u.galerieId);
        const g = groups.get(key) ?? { key, name: u.galerie || "Ohne Partner", art: info?.art ?? "", ort: info?.ort ?? "", anzahl: 0, naechste: "" };
        g.anzahl += 1;
        const frist = u.rueckgabe.slice(0, 10);
        if (frist && (!g.naechste || frist < g.naechste)) g.naechste = frist;
        groups.set(key, g);
      });
    return [...groups.values()].sort((a, b) => (a.naechste || "9").localeCompare(b.naechste || "9"));
  }, [unikate, partnerInfo]);

  const zuletzt = useMemo(() => {
    const items = [
      ...unikate.map((u) => ({
        key: `u-${u.id}`,
        href: `/bestand?id=${u.id}`,
        titel: u.name || "Ohne Namen",
        zeile: `${u.inv} · ${u.status}${u.lagerort ? ` · ${u.lagerort}` : ""}`,
        fotos: u.fotos,
        zeit: latest(u.erfasstAm, u.geaendertAm),
      })),
      ...editionen.map((e) => ({
        key: `e-${e.id}`,
        href: "/bestand?tab=edition",
        titel: e.modell,
        zeile: `${e.zustand}${e.glasur ? ` · ${e.glasur}` : ""} · ${zahl.format(e.anzahl)} Stück`,
        fotos: e.fotos,
        zeit: latest(e.erfasstAm, e.geaendertAm),
      })),
    ];
    return items.sort((a, b) => b.zeit.localeCompare(a.zeit)).slice(0, RECENT_COUNT);
  }, [unikate, editionen]);

  const knapp = editionen.filter((e) => e.anzahl < LOW_STOCK).sort((a, b) => a.anzahl - b.anzahl);
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const typMax = Math.max(1, ...typRows.map((r) => r.total));
  const modellMax = Math.max(1, ...modellRows.map((r) => r.total));

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-6" lang="de">
        <PageHeader
          title="Übersicht"
          description={`Stand ${new Date().toLocaleDateString("de-DE")} · ${zahl.format(unikate.length)} Unikate · ${zahl.format(stats.rohlinge + stats.glasiert)} Stück Editionsware`}
        />

        {failed ? (
          <ErrorState text="Die Übersicht konnte nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Übersicht wird geladen …" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <Tile label="Verfügbar" value={zahl.format(stats.verfuegbar)} sub={`Wert ${euro.format(stats.verfuegbarWert)}`} href="/bestand?tab=verfuegbar" />
              <Tile label="Reserviert" value={zahl.format(stats.reserviert)} href={tabelleLink({ status: RESERVIERT })} />
              <Tile
                label="Außer Haus"
                value={zahl.format(stats.ausserHaus)}
                sub={stats.partner === 1 ? "bei 1 Partner" : `bei ${stats.partner} Partnern`}
                warn={stats.ueberfaellig > 0 ? `${stats.ueberfaellig} Rückgabe überfällig` : undefined}
                href={AUSSER_HAUS_LINK}
              />
              <Tile label={`Verkauft ${jahr}`} value={zahl.format(stats.verkauftJahr)} sub={`Umsatz ${euro.format(stats.umsatzJahr)}`} href={tabelleLink({ status: VERKAUFT, verkauftJahr: String(jahr) })} />
              <Tile label="Editionsware" value={zahl.format(stats.rohlinge + stats.glasiert)} sub={`davon ${zahl.format(stats.rohlinge)} Rohlinge`} href="/bestand?tab=edition" />
            </div>
            {stats.verkauftOhneDatum > 0 && (
              <p className="text-sm text-muted-foreground">
                {stats.verkauftOhneDatum} verkaufte Stücke haben kein Verkaufsdatum und zählen nicht zu „Verkauft {jahr}“.
              </p>
            )}

            <Section
              title="Außer Haus nach Partner"
              description="Galerien, Museen und Ausstellungen, früheste Rückgabe zuerst."
              actions={
                ausserHausGruppen.length > 0 && (
                  <a href={AUSSER_HAUS_LINK} className="inline-flex items-center min-h-11 text-base font-medium text-primary hover:underline">
                    Alle {zahl.format(stats.ausserHaus)} Stück als Tabelle
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </a>
                )
              }
            >
              {ausserHausGruppen.length === 0 ? (
                <EmptyState text="Zurzeit ist nichts außer Haus." />
              ) : (
                <ul className="divide-y">
                  {ausserHausGruppen.slice(0, AUSSER_HAUS_MAX).map((g) => (
                    <li key={g.key}>
                      <ListRow
                        title={g.name}
                        sub={[g.art, g.ort].filter(Boolean).join(" · ")}
                        meta={
                          <>
                            <span className="block tabular-nums">{zahl.format(g.anzahl)} Stück</span>
                            <FristBadge iso={g.naechste} />
                          </>
                        }
                        href={g.key === "ohne" ? AUSSER_HAUS_LINK : tabelleLink({ status: `${KOMMISSION},${AUSGESTELLT}`, partner: g.name })}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {ausserHausGruppen.length > AUSSER_HAUS_MAX && <p className="text-sm text-muted-foreground">und {ausserHausGruppen.length - AUSSER_HAUS_MAX} weitere Partner in der Tabelle</p>}
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Section title="Unikate im Bestand nach Typ" description="Ohne verkaufte Stücke">
                <Legend series={STOCK_SERIES} />
                <StackedBars rows={typRows} unit="Stück" max={typMax} />
              </Section>
              <Section title="Editionsware je Modell" description="Rohlinge und glasierte Ware">
                <Legend series={EDITION_SERIES} />
                <StackedBars rows={modellRows} unit="Stück" max={modellMax} />
              </Section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Section title="Zuletzt erfasst oder geändert" description={`Die ${RECENT_COUNT} neuesten Einträge`}>
                <ul className="divide-y">
                  {zuletzt.map((z) => (
                    <li key={z.key}>
                      <ListRow fotos={z.fotos} title={z.titel} sub={`${z.zeile} · ${formatDateTime(z.zeit)}`} href={z.href} />
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="Nachschub nötig" description={`Editionsware mit weniger als ${LOW_STOCK} Stück`}>
                {knapp.length === 0 ? (
                  <EmptyState text="Alles ausreichend vorrätig." />
                ) : (
                  <ul className="divide-y">
                    {knapp.map((e) => (
                      <li key={e.id}>
                        <ListRow
                          fotos={e.fotos}
                          title={e.modell}
                          sub={[e.zustand, e.glasur, e.lagerort].filter(Boolean).join(" · ")}
                          meta={<span className="text-lg font-semibold tabular-nums text-amber-800">{zahl.format(e.anzahl)}</span>}
                          href="/bestand?tab=edition"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

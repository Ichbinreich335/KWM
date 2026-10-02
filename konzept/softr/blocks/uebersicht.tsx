import { useEffect, useMemo } from "react";
import { datasource, q, useRecords } from "@/lib/datasource";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, ImageOff, Loader2 } from "lucide-react";

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
  seit: "Evxm2",
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

const PAGE_SIZE = 100;
const RECENT_COUNT = 10;
const LOW_STOCK = 5;
const VERFUEGBAR = "verfügbar";
const RESERVIERT = "reserviert";
const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const SOON_DAYS = 14;
const AUFGABEN_MAX = 4;
const DAY_MS = 86400000;
const VERKAUFT = "verkauft";
const ROHLING = "Rohling";
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

type Opt = { id: string; label: string };
type Attachment = { url: string; thumbnails?: { url: string; size: string }[] };
type RawItem = { id: string; fields: Record<string, unknown> };

type Unikat = {
  id: string;
  inv: string;
  name: string;
  typ: string;
  status: string;
  foto: Attachment | undefined;
  lagerort: string;
  galerie: string;
  galerieId: string;
  seit: string;
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
  foto: Attachment | undefined;
  erfasstAm: string;
  geaendertAm: string;
};

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const zahl = new Intl.NumberFormat("de-DE");

function asOpts(v: unknown): Opt[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(asOpts);
  if (typeof v === "object" && "id" in (v as object)) {
    const o = v as { id: string; label?: string };
    return [{ id: o.id, label: o.label ?? "" }];
  }
  return [];
}

function firstLabel(v: unknown): string {
  return asOpts(v)[0]?.label ?? "";
}

function firstAttachment(v: unknown): Attachment | undefined {
  const list = Array.isArray(v) ? v : v ? [v] : [];
  return list.find((a): a is Attachment => !!a && typeof a === "object" && "url" in a);
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function thumb(a: Attachment): string {
  return a.thumbnails?.find((t) => t.size === "small")?.url ?? a.url;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE");
}

function fristStatus(iso: string): "ueberfaellig" | "bald" | "ok" | "" {
  if (!iso) return "";
  const heute = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const tage = (new Date(iso.slice(0, 10)).getTime() - heute) / DAY_MS;
  return tage < 0 ? "ueberfaellig" : tage <= SOON_DAYS ? "bald" : "ok";
}

function latest(...dates: string[]): string {
  return dates.filter(Boolean).sort().at(-1) ?? "";
}

function formatDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function useAllPages(query: { hasNextPage?: boolean; isFetchingNextPage?: boolean; fetchNextPage: () => unknown }) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
}

function Tile({ label, value, sub, href }: { label: string; value: string; sub?: string; href: string }) {
  return (
    <a href={href} className="block rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition min-h-28">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </a>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 min-w-0">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

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

type BarRow = { label: string; values: { key: string; label: string; color: string; value: number }[]; total: number };

function StackedBars({ rows, unit, max }: { rows: BarRow[]; unit: string; max: number }) {
  if (rows.length === 0) return <p className="text-base text-muted-foreground">Noch keine Daten.</p>;
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

function Thumb({ foto }: { foto: Attachment | undefined }) {
  return foto ? (
    <img src={thumb(foto)} alt="" loading="lazy" className="w-12 h-12 rounded-md object-cover shrink-0" />
  ) : (
    <span className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0" aria-label="Kein Foto">
      <ImageOff className="w-4 h-4" aria-hidden />
    </span>
  );
}

export default function Block() {
  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
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
          foto: firstAttachment(f.fotos),
          lagerort: firstLabel(f.lagerort),
          galerie: firstLabel(f.galerie),
          galerieId: asOpts(f.galerie)[0]?.id ?? "",
          seit: str(f.seit),
          rueckgabe: str(f.rueckgabe),
          preis: num(f.preis),
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
          anzahl: num(f.anzahl),
          lagerort: firstLabel(f.lagerort),
          foto: firstAttachment(f.foto),
          erfasstAm: str(f.erfasstAm),
          geaendertAm: str(f.geaendertAm),
        };
      }),
    [editionQuery.data],
  );

  const jahr = new Date().getFullYear();
  const stats = useMemo(() => {
    const by = (s: string) => unikate.filter((u) => u.status === s);
    const verfuegbar = by(VERFUEGBAR);
    const kommission = unikate.filter((u) => u.status === KOMMISSION || u.status === AUSGESTELLT);
    const verkauftJahr = by(VERKAUFT).filter((u) => u.verkauftAm.startsWith(String(jahr)));
    const sum = (list: Unikat[]) => list.reduce((n, u) => n + u.preis, 0);
    return {
      verfuegbar: verfuegbar.length,
      verfuegbarWert: sum(verfuegbar),
      reserviert: by(RESERVIERT).length,
      kommission: kommission.length,
      galerien: new Set(kommission.map((u) => u.galerie).filter(Boolean)).size,
      verkauftJahr: verkauftJahr.length,
      umsatzJahr: sum(verkauftJahr),
      rohlinge: editionen.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0),
      glasiert: editionen.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl, 0),
      verkauftOhneDatum: by(VERKAUFT).filter((u) => !u.verkauftAm).length,
    };
  }, [unikate, editionen, jahr]);

  const typRows = useMemo<BarRow[]>(() => {
    const typen = [...TYP_ORDER, ...new Set(unikate.map((u) => u.typ).filter((t) => t && !TYP_ORDER.includes(t)))];
    return typen
      .map((typ) => {
        const values = STOCK_SERIES.map((s) => ({
          ...s,
          value: unikate.filter((u) => u.typ === typ && u.status === s.key).length,
        }));
        return { label: typ, values, total: values.reduce((n, v) => n + v.value, 0) };
      })
      .filter((r) => r.total > 0);
  }, [unikate]);

  const modellRows = useMemo<BarRow[]>(() => {
    const modelle = [...new Set(editionen.map((e) => e.modell).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
    return modelle.map((modell) => {
      const values = EDITION_SERIES.map((s) => ({
        ...s,
        value: editionen
          .filter((e) => e.modell === modell && (s.key === ROHLING ? e.zustand === ROHLING : e.zustand !== ROHLING))
          .reduce((n, e) => n + e.anzahl, 0),
      }));
      return { label: modell, values, total: values.reduce((n, v) => n + v.value, 0) };
    });
  }, [editionen]);

  const aufgaben = useMemo(() => {
    const imHaus = (u: Unikat) => u.status !== VERKAUFT && u.status !== KOMMISSION && u.status !== AUSGESTELLT;
    return [
      { titel: "Ohne Foto", items: unikate.filter((u) => !u.foto && u.status !== VERKAUFT) },
      { titel: "Ohne Lagerort", items: unikate.filter((u) => imHaus(u) && !u.lagerort) },
      { titel: "Verkauft ohne Datum", items: unikate.filter((u) => u.status === VERKAUFT && !u.verkauftAm) },
      { titel: "Rückgabe überfällig", items: unikate.filter((u) => fristStatus(u.rueckgabe) === "ueberfaellig") },
    ].filter((a) => a.items.length > 0);
  }, [unikate]);

  const knapp = editionen.filter((e) => e.anzahl < LOW_STOCK).sort((a, b) => a.anzahl - b.anzahl);

  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  const partnerInfo = useMemo(
    () =>
      new Map(
        (partnerQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => {
          const f = (i as RawItem).fields;
          return [i.id, { art: firstLabel(f.art), ort: str(f.ort) }] as const;
        }),
      ),
    [partnerQuery.data],
  );
  const ausserHaus = useMemo(() => {
    const groups = new Map<string, { key: string; name: string; art: string; ort: string; wert: number; items: Unikat[] }>();
    unikate
      .filter((u) => u.status === KOMMISSION || u.status === AUSGESTELLT)
      .forEach((u) => {
        const key = u.galerieId || "ohne";
        const info = partnerInfo.get(u.galerieId);
        const g = groups.get(key) ?? { key, name: u.galerie || "Ohne Partner", art: info?.art ?? "", ort: info?.ort ?? "", wert: 0, items: [] };
        g.items.push(u);
        g.wert += u.preis;
        groups.set(key, g);
      });
    const byFrist = (a: Unikat, b: Unikat) => (a.rueckgabe || "9").localeCompare(b.rueckgabe || "9");
    return [...groups.values()]
      .map((g) => ({ ...g, items: [...g.items].sort(byFrist) }))
      .sort((a, b) => byFrist(a.items[0], b.items[0]));
  }, [unikate, partnerInfo]);

  const zuletzt = useMemo(() => {
    const items = [
      ...unikate.map((u) => ({
        key: `u-${u.id}`,
        href: `/bestand?id=${u.id}`,
        titel: u.name || "Ohne Namen",
        zeile: `${u.inv} · ${u.status}${u.lagerort ? ` · ${u.lagerort}` : ""}`,
        art: "Unikat",
        foto: u.foto,
        zeit: latest(u.erfasstAm, u.geaendertAm),
      })),
      ...editionen.map((e) => ({
        key: `e-${e.id}`,
        href: "/bestand?tab=edition",
        titel: e.modell,
        zeile: `${e.zustand}${e.glasur ? ` · ${e.glasur}` : ""} · ${zahl.format(e.anzahl)} Stück`,
        art: "Edition",
        foto: e.foto,
        zeit: latest(e.erfasstAm, e.geaendertAm),
      })),
    ];
    return items.sort((a, b) => b.zeit.localeCompare(a.zeit)).slice(0, RECENT_COUNT);
  }, [unikate, editionen]);

  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const typMax = Math.max(1, ...typRows.map((r) => r.total));
  const modellMax = Math.max(1, ...modellRows.map((r) => r.total));

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Übersicht</h1>
          <p className="text-base text-muted-foreground">
            Stand {new Date().toLocaleDateString("de-DE")} · {zahl.format(unikate.length)} Unikate · {zahl.format(stats.rohlinge + stats.glasiert)} Stück Editionsware
          </p>
        </div>

        {failed ? (
          <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-base">
            Die Übersicht konnte nicht geladen werden. Bitte die Seite neu laden.
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-base text-muted-foreground py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Übersicht wird geladen …
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <Tile label="Unikate verfügbar" value={zahl.format(stats.verfuegbar)} sub={`Wert ${euro.format(stats.verfuegbarWert)}`} href="/bestand?tab=verfuegbar" />
              <Tile label="Reserviert" value={zahl.format(stats.reserviert)} href="/tabelle?status=reserviert" />
              <Tile
                label="Außer Haus"
                value={zahl.format(stats.kommission)}
                sub={stats.galerien === 1 ? "bei 1 Partner" : `bei ${stats.galerien} Partnern`}
                href="#ausser-haus"
              />
              <Tile label={`Verkauft ${jahr}`} value={zahl.format(stats.verkauftJahr)} sub={`Umsatz ${euro.format(stats.umsatzJahr)}`} href="/tabelle?status=verkauft" />
              <Tile label="Rohlinge gesamt" value={zahl.format(stats.rohlinge)} sub="Editionsware, unglasiert" href="/bestand?tab=edition" />
              <Tile label="Glasierte Editionsware" value={zahl.format(stats.glasiert)} sub="Stück auf Lager" href="/bestand?tab=edition" />
            </div>
            {stats.verkauftOhneDatum > 0 && (
              <p className="text-sm text-muted-foreground">
                {stats.verkauftOhneDatum} verkaufte Stücke haben kein Verkaufsdatum und zählen nicht zu „Verkauft {jahr}“.
              </p>
            )}

            <section id="ausser-haus" className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 min-w-0" aria-labelledby="ausser-haus-titel">
              <div>
                <h2 id="ausser-haus-titel" className="text-lg font-semibold">
                  Außer Haus
                </h2>
                <p className="text-sm text-muted-foreground">Was gerade in Galerien, Museen oder Ausstellungen ist und wann es zurückkommt.</p>
              </div>
              {ausserHaus.length === 0 ? (
                <p className="text-base text-muted-foreground">Zurzeit ist nichts außer Haus.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-3" lang="de">
                  {ausserHaus.map((g) => (
                    <div key={g.key} className="rounded-lg border p-3 space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold hyphens-auto">{g.name}</p>
                          <p className="text-sm text-muted-foreground">{[g.art, g.ort].filter(Boolean).join(" · ")}</p>
                        </div>
                        <span className="text-sm tabular-nums shrink-0 text-right">
                          {g.items.length} Stück
                          <br />
                          {euro.format(g.wert)}
                        </span>
                      </div>
                      <ul className="divide-y">
                        {g.items.map((u) => {
                          const frist = fristStatus(u.rueckgabe);
                          return (
                            <li key={u.id}>
                              <a href={`/bestand?id=${u.id}`} className="block min-h-11 py-1.5 rounded-md hover:bg-muted/40">
                                <span className="block font-medium">{u.name}</span>
                                <span className="flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="text-sm text-muted-foreground">{u.status}</span>
                                {u.rueckgabe && (
                                  <span
                                    className={`text-sm shrink-0 rounded-full px-2 py-0.5 ${
                                      frist === "ueberfaellig" ? "bg-red-100 text-red-800" : frist === "bald" ? "bg-amber-100 text-amber-900" : "text-muted-foreground"
                                    }`}
                                  >
                                    {frist === "ueberfaellig" ? "überfällig seit " : "zurück bis "}
                                    {formatDate(u.rueckgabe)}
                                  </span>
                                )}
                                </span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {aufgaben.length > 0 && (
              <Section title="Zu erledigen" description="Angaben, die noch fehlen. Antippen öffnet das Stück im Bestand.">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-3" lang="de">
                  {aufgaben.map((a) => (
                    <div key={a.titel} className="rounded-lg border p-3 min-w-0">
                      <p className="font-semibold">
                        {a.titel} <span className="text-muted-foreground font-normal tabular-nums">· {a.items.length}</span>
                      </p>
                      <ul className="mt-1">
                        {a.items.slice(0, AUFGABEN_MAX).map((u) => (
                          <li key={u.id}>
                            <a href={`/bestand?id=${u.id}`} className="block min-h-11 py-2 hyphens-auto hover:underline">
                              {u.name || "Ohne Namen"} <span className="text-sm text-muted-foreground">{u.inv}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                      {a.items.length > AUFGABEN_MAX && <p className="text-sm text-muted-foreground">und {a.items.length - AUFGABEN_MAX} weitere</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

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
              <Section title="Nachschub nötig" description={`Editionsware mit weniger als ${LOW_STOCK} Stück`}>
                {knapp.length === 0 ? (
                  <p className="text-base text-muted-foreground">Alles ausreichend vorrätig.</p>
                ) : (
                  <ul className="divide-y">
                    {knapp.map((e) => (
                      <li key={e.id}>
                        <a href="/bestand?tab=edition" className="flex items-center gap-3 py-2 min-h-11 hover:bg-muted/40 rounded-md">
                          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden />
                          <span className="flex-1 min-w-0">
                            <span className="block font-medium break-words">{e.modell}</span>
                            <span className="block text-sm text-muted-foreground">
                              {e.zustand}
                              {e.glasur ? ` · ${e.glasur}` : ""}
                              {e.lagerort ? ` · ${e.lagerort}` : ""}
                            </span>
                          </span>
                          <span className="text-lg font-semibold tabular-nums">{zahl.format(e.anzahl)}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>

            <Section title="Zuletzt erfasst oder geändert" description={`Die ${RECENT_COUNT} neuesten Einträge`}>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {zuletzt.map((z) => (
                  <li key={z.key} className="border-t first:border-t-0 md:[&:nth-child(2)]:border-t-0">
                    <a href={z.href} className="flex items-center gap-3 py-2.5 min-h-11 hover:bg-muted/40 rounded-md">
                      <Thumb foto={z.foto} />
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium break-words">{z.titel}</span>
                        <span className="block text-sm text-muted-foreground break-words">{z.zeile}</span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="inline-block text-xs rounded-full border px-2 py-0.5">{z.art}</span>
                        <span className="block text-xs text-muted-foreground mt-1">{formatDateTime(z.zeit)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { datasource, q, useRecords } from "@/lib/datasource";
import { AlertTriangle, CalendarClock, ChevronDown, ChevronRight, CircleCheck, ClipboardList, Package, Receipt } from "lucide-react";
import { AUSGESTELLT, KOMMISSION, PAGE_SIZE, RESERVIERT, ROHLING, VERFUEGBAR, VERKAUFT, isAusserHaus } from "../shared/konstanten";
import { type Attachment, type RawItem, asAttachments, asOpts, firstLabel, euro, lookupValue, modellLabel, num, str, useAllPages, zahl } from "../shared/daten";
import { EmptyState, ErrorState, ListRow, LoadingState, PANEL_CLASS, PageHeader, Section, Thumb } from "../shared/ui";

const ds = datasource.define({ unikate: "unikate", edition: "edition", partner: "partner", modelle: "modelle" });
const modellSelect = q.select({ name: "eXo5w", artikelnr: "BNpSN", vk: "772dM", archiviert: "3tlrw" });

const unikatSelect = q.select({
  inv: "glG6V",
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  fotos: "rqreT",
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
  foto: "nibt5",
  erfasstAm: "0x7rU",
  geaendertAm: "JZyKO",
  artikelnr: "Zzp1S",
  vk: "kAyrB",
});

const RECENT_COUNT = 6;
const MODELLE_SICHTBAR = 8;
const LOW_STOCK = 5;
const SOON_DAYS = 14;
const AUSSER_HAUS_MAX = 8;
const DAY_MS = 86400000;

type Unikat = {
  id: string;
  inv: string;
  name: string;
  typ: string;
  status: string;
  fotos: Attachment[];
  galerie: string;
  galerieId: string;
  rueckgabe: string;
  preis: number | null;
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
  vk: number | null;
  fotos: Attachment[];
  erfasstAm: string;
  geaendertAm: string;
};
type CountRow = { label: string; href: string; values: number[] };
type Pruefpunkt = { label: string; items: { id: string; label: string; href: string }[] };
type Ton = "rot" | "gelb";
type Aufgabe = { key: string; ton: Ton; icon: React.ReactNode; text: string; detail?: string; href: string };
type Kennzahl = { label: string; value: string; sub: string[]; href: string };

const PRUEF_SICHTBAR = 8;
const TON_CLASS: Record<Ton | "neutral", string> = { rot: "bg-red-50 text-red-700", gelb: "bg-amber-50 text-amber-800", neutral: "bg-muted text-muted-foreground" };
const ICON = "w-5 h-5";
const ROW = "flex items-center gap-3 min-h-14 py-2 px-1 rounded-md hover:bg-muted/40";

// Vier Kennzahlen in einem Band statt einzelner Kästen. Jede führt in den passenden Bestand.
function Kennzahlen({ items }: { items: Kennzahl[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-lg border bg-border">
      {items.map((k) => (
        <a key={k.label} href={k.href} className="group bg-card p-4 hover:bg-muted/40 transition-colors">
          <span className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            {k.label}
            <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100" aria-hidden />
          </span>
          <span className="block text-3xl font-semibold mt-1 tabular-nums">{k.value}</span>
          {k.sub.map((line) => (
            <span key={line} className="block text-sm text-muted-foreground">
              {line}
            </span>
          ))}
        </a>
      ))}
    </div>
  );
}

function TonIcon({ ton, children }: { ton: Ton | "neutral"; children: React.ReactNode }) {
  return <span className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${TON_CLASS[ton]}`}>{children}</span>;
}

// Was Aufmerksamkeit braucht, dringendstes zuerst. Datenpflege ist die letzte Zeile und klappt auf.
function ZuErledigen({ aufgaben, pflege }: { aufgaben: Aufgabe[]; pflege: Pruefpunkt[] }) {
  const offen = pflege.reduce((n, p) => n + p.items.length, 0);
  if (aufgaben.length === 0 && offen === 0) {
    return (
      <Section title="Zu erledigen">
        <p className="flex items-center gap-3 text-base text-muted-foreground">
          <CircleCheck className="w-5 h-5 text-emerald-700" aria-hidden /> Nichts offen. Keine Fristen, kein knapper Bestand, keine fehlenden Angaben.
        </p>
      </Section>
    );
  }
  return (
    <Section title="Zu erledigen">
      <ul className="divide-y">
        {aufgaben.map((a) => (
          <li key={a.key}>
            <a href={a.href} className={ROW}>
              <TonIcon ton={a.ton}>{a.icon}</TonIcon>
              <span className="flex-1 min-w-0">
                <span className="block font-medium">{a.text}</span>
                {a.detail && <span className="block text-sm text-muted-foreground truncate">{a.detail}</span>}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
            </a>
          </li>
        ))}
        {offen > 0 && (
          <li>
            <details className="group">
              <summary className={`${ROW} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                <TonIcon ton="neutral">
                  <ClipboardList className={ICON} aria-hidden />
                </TonIcon>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium">Datenpflege · {zahl.format(offen)} offen</span>
                  <span className="block text-sm text-muted-foreground truncate">{pflege.filter((p) => p.items.length).map((p) => p.label).join(" · ")}</span>
                </span>
                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="pl-12 pr-1 pb-3 space-y-3">
                {pflege
                  .filter((p) => p.items.length > 0)
                  .map((p) => (
                    <div key={p.label}>
                      <p className="text-sm font-medium">
                        {p.label} <span className="text-muted-foreground tabular-nums">{zahl.format(p.items.length)}</span>
                      </p>
                      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {p.items.slice(0, PRUEF_SICHTBAR).map((i) => (
                          <li key={i.id}>
                            <a href={i.href} className="inline-flex min-h-8 items-center text-muted-foreground underline underline-offset-4 decoration-neutral-300 hover:text-foreground">
                              {i.label}
                            </a>
                          </li>
                        ))}
                        {p.items.length > PRUEF_SICHTBAR && <li className="text-muted-foreground">und {zahl.format(p.items.length - PRUEF_SICHTBAR)} weitere</li>}
                      </ul>
                    </div>
                  ))}
              </div>
            </details>
          </li>
        )}
      </ul>
    </Section>
  );
}

// Zuletzt Bearbeitetes als Bildleiste: am Handy zum Wischen, am Rechner in einer Reihe.
function Bildleiste({ items }: { items: { key: string; href: string; titel: string; zeile: string; fotos: Attachment[] }[] }) {
  return (
    <ul className="grid grid-flow-col auto-cols-[8.5rem] gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible">
      {items.map((z) => (
        <li key={z.key}>
          <a href={z.href} className="group block">
            <Thumb fotos={z.fotos} size="medium" className="w-full aspect-square rounded-md" />
            <span className="block mt-2 text-sm font-medium leading-snug line-clamp-2 group-hover:underline underline-offset-4">{z.titel}</span>
            <span className="block text-sm text-muted-foreground truncate">{z.zeile}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function fristStatus(iso: string): "ueberfaellig" | "bald" | "ok" | "" {
  if (!iso) return "";
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const tage = (new Date(`${iso.slice(0, 10)}T00:00:00`).getTime() - heute.getTime()) / DAY_MS;
  return tage < 0 ? "ueberfaellig" : tage <= SOON_DAYS ? "bald" : "ok";
}

// Datum ohne Jahr, z. B. 30.9. Für Fristen und Listen, in denen das Jahr klar ist.
function kurzDatum(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" });
}

function latest(...dates: string[]): string {
  return dates.filter(Boolean).sort().at(-1) ?? "";
}

function tabelleLink(params: Record<string, string>): string {
  return `/tabelle?${new URLSearchParams(params).toString()}`;
}

const AUSSER_HAUS_LINK = "/bestand?tab=kommission";

function plural(n: number, eins: string, mehrere: string): string {
  return `${zahl.format(n)} ${n === 1 ? eins : mehrere}`;
}

// Kleine Zähltabelle: erste Spalte Text, danach Zahlen. Nullen als Strich, damit Werte auffallen.
function CountTable({ head, rows, empty }: { head: string[]; rows: CountRow[]; empty: string }) {
  if (rows.length === 0) return <EmptyState text={empty} />;
  return (
    <table className="w-full text-base">
      <thead>
        <tr className="border-b text-sm text-muted-foreground">
          {head.map((h, i) => (
            <th key={h} scope="col" className={`py-2 font-normal ${i === 0 ? "text-left" : "text-right pl-3"}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((r) => (
          <tr key={r.label} className="hover:bg-muted/40">
            <th scope="row" className="py-0 text-left font-medium">
              <a href={r.href} className="flex items-center min-h-11 hover:underline underline-offset-4">
                {r.label}
              </a>
            </th>
            {r.values.map((v, i) => (
              <td key={i} className={`py-2 pl-3 text-right tabular-nums ${i === r.values.length - 1 ? "font-semibold" : ""} ${v === 0 ? "text-muted-foreground" : ""}`}>
                {v === 0 ? "–" : zahl.format(v)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FristBadge({ iso }: { iso: string }) {
  if (!iso) return null;
  const frist = fristStatus(iso);
  return (
    <span className={`inline-block text-sm rounded-md px-2 py-0.5 whitespace-nowrap ${frist === "ueberfaellig" ? "bg-red-50 text-red-800" : frist === "bald" ? "bg-amber-50 text-amber-900" : "text-muted-foreground"}`}>
      {frist === "ueberfaellig" ? "überfällig " : "bis "}
      {kurzDatum(iso)}
    </span>
  );
}

export default function Block() {
  const [alleModelle, setAlleModelle] = useState(false);
  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  const modellQuery = useRecords({ from: ds.modelle, select: modellSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  useAllPages(modellQuery);
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
          galerie: firstLabel(f.galerie),
          galerieId: asOpts(f.galerie)[0]?.id ?? "",
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
          modell: modellLabel(str(lookupValue(f.artikelnr)), firstLabel(f.modell)),
          glasur: firstLabel(f.glasur),
          zustand: firstLabel(f.zustand),
          anzahl: num(f.anzahl) ?? 0,
          vk: num(lookupValue(f.vk)),
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
    const sum = (list: Unikat[]) => list.reduce((n, u) => n + (u.preis ?? 0), 0);
    return {
      verfuegbar: verfuegbar.length,
      verfuegbarWert: sum(verfuegbar),
      reserviert: by(RESERVIERT).length,
      ausserHaus: ausserHaus.length,
      partner: new Set(ausserHaus.map((u) => u.galerieId).filter(Boolean)).size,
      ueberfaellig: ausserHaus.filter((u) => fristStatus(u.rueckgabe) === "ueberfaellig").length,
      verkauftJahr: verkauftJahr.length,
      umsatzJahr: sum(verkauftJahr),
      verkauftLuecken: by(VERKAUFT).filter((u) => !u.verkauftAm || u.preis === null).length,
      bald: ausserHaus.filter((u) => fristStatus(u.rueckgabe) === "bald").length,
      ueberfaelligBei: [...new Set(ausserHaus.filter((u) => fristStatus(u.rueckgabe) === "ueberfaellig").map((u) => u.galerie || "ohne Partner"))],
      rohlinge: editionen.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0),
      glasiert: editionen.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl, 0),
      glasiertWert: editionen.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl * (e.vk ?? 0), 0),
    };
  }, [unikate, editionen, jahr]);

  const typRows = useMemo<CountRow[]>(() => {
    const imBestand = unikate.filter((u) => u.status !== VERKAUFT && u.typ);
    const typen = [...new Set(imBestand.map((u) => u.typ))].sort((a, b) => a.localeCompare(b, "de"));
    return typen.map((typ) => {
      const list = imBestand.filter((u) => u.typ === typ);
      const imHaus = list.filter((u) => !isAusserHaus(u.status)).length;
      const ausser = list.length - imHaus;
      return { label: typ, href: `/bestand?typ=${encodeURIComponent(typ)}&tab=alle`, values: [imHaus, ausser, list.length] };
    });
  }, [unikate]);

  const modellRows = useMemo<CountRow[]>(() => {
    const modelle = [...new Set(editionen.map((e) => e.modell).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de", { numeric: true }));
    return modelle.map((modell) => {
      const list = editionen.filter((e) => e.modell === modell);
      const roh = list.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0);
      const glas = list.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl, 0);
      return { label: modell, href: `/bestand?tab=edition&q=${encodeURIComponent(modell)}`, values: [roh, glas, roh + glas] };
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
        zeile: [u.status, kurzDatum(latest(u.erfasstAm, u.geaendertAm))].filter(Boolean).join(" · "),
        fotos: u.fotos,
        zeit: latest(u.erfasstAm, u.geaendertAm),
      })),
      ...editionen.map((e) => ({
        key: `e-${e.id}`,
        href: `/bestand?tab=edition&q=${encodeURIComponent(e.modell)}`,
        titel: e.modell,
        zeile: [e.zustand, e.glasur, plural(e.anzahl, "Stück", "Stück")].filter(Boolean).join(" · "),
        fotos: e.fotos,
        zeit: latest(e.erfasstAm, e.geaendertAm),
      })),
    ];
    return items.sort((a, b) => b.zeit.localeCompare(a.zeit)).slice(0, RECENT_COUNT);
  }, [unikate, editionen]);

  const knapp = editionen.filter((e) => e.anzahl > 0 && e.anzahl < LOW_STOCK).sort((a, b) => a.anzahl - b.anzahl);
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";

  const kennzahlen: Kennzahl[] = [
    {
      label: "Im Haus",
      value: zahl.format(stats.verfuegbar + stats.reserviert),
      sub: [`davon ${zahl.format(stats.reserviert)} reserviert`, `Wert ${euro.format(stats.verfuegbarWert)}`],
      href: "/bestand?tab=imhaus",
    },
    { label: "Außer Haus", value: zahl.format(stats.ausserHaus), sub: [stats.partner === 1 ? "bei 1 Partner" : `bei ${zahl.format(stats.partner)} Partnern`], href: AUSSER_HAUS_LINK },
    { label: `Verkauft ${jahr}`, value: zahl.format(stats.verkauftJahr), sub: [`Umsatz ${euro.format(stats.umsatzJahr)}`], href: "/bestand?tab=verkauft" },
    {
      label: "Editionsware",
      value: zahl.format(stats.rohlinge + stats.glasiert),
      sub: [`davon ${zahl.format(stats.rohlinge)} Rohlinge`, ...(stats.glasiertWert > 0 ? [`Wert glasiert ${euro.format(stats.glasiertWert)}`] : [])],
      href: "/bestand?tab=edition",
    },
  ];

  const kandidaten: (Aufgabe | false)[] = [
    stats.ueberfaellig > 0 && {
      key: "ueberfaellig",
      ton: "rot",
      icon: <AlertTriangle className={ICON} aria-hidden />,
      text: `${plural(stats.ueberfaellig, "Rückgabe", "Rückgaben")} überfällig`,
      detail: stats.ueberfaelligBei.join(", "),
      href: AUSSER_HAUS_LINK,
    },
    stats.bald > 0 && {
      key: "bald",
      ton: "gelb",
      icon: <CalendarClock className={ICON} aria-hidden />,
      text: `${plural(stats.bald, "Rückgabe", "Rückgaben")} in den nächsten ${SOON_DAYS} Tagen`,
      href: AUSSER_HAUS_LINK,
    },
    knapp.length > 0 && {
      key: "knapp",
      ton: "gelb",
      icon: <Package className={ICON} aria-hidden />,
      text: `${plural(knapp.length, "Editionsposten", "Editionsposten")} unter ${LOW_STOCK} Stück`,
      detail: knapp.map((e) => `${e.modell}: ${e.anzahl}`).join(" · "),
      href: "/bestand?tab=edition",
    },
    stats.verkauftLuecken > 0 && {
      key: "verkauft",
      ton: "gelb",
      icon: <Receipt className={ICON} aria-hidden />,
      text: `${plural(stats.verkauftLuecken, "Verkauf", "Verkäufe")} ohne Datum oder Preis`,
      detail: "Fehlt im Umsatz",
      href: "/bestand?tab=verkauft",
    },
  ];
  const aufgaben = kandidaten.filter((a): a is Aufgabe => a !== false);

  const pruefpunkte: Pruefpunkt[] = [
    {
      label: "Unikate ohne Foto",
      items: unikate.filter((u) => u.status !== VERKAUFT && u.fotos.length === 0).map((u) => ({ id: u.id, label: u.name || u.inv, href: `/bestand?id=${u.id}` })),
    },
    {
      label: "Unikate ohne Preis",
      items: unikate.filter((u) => u.status !== VERKAUFT && u.preis === null).map((u) => ({ id: u.id, label: u.name || u.inv, href: `/bestand?id=${u.id}` })),
    },
    {
      label: "Außer Haus ohne Partner",
      items: unikate.filter((u) => isAusserHaus(u.status) && !u.galerieId).map((u) => ({ id: u.id, label: u.name || u.inv, href: `/bestand?id=${u.id}` })),
    },
    {
      label: "Editionsposten mit 0 Stück",
      items: editionen.filter((e) => e.anzahl === 0).map((e) => ({ id: e.id, label: [e.modell, e.zustand, e.glasur].filter(Boolean).join(" · "), href: `/bestand?tab=edition&q=${encodeURIComponent(e.modell)}` })),
    },
    {
      label: "Modelle ohne VK-Preis",
      items: ((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[])
        .filter((i) => i.fields.archiviert !== true && num(i.fields.vk) === null)
        .map((i) => ({ id: i.id, label: modellLabel(str(i.fields.artikelnr), str(i.fields.name)), href: "/stammdaten?tab=modelle" })),
    },
  ];

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-6" lang="de">
        <PageHeader title="Übersicht" description={`${plural(unikate.length, "Unikat", "Unikate")} · ${zahl.format(stats.rohlinge + stats.glasiert)} Stück Editionsware`} />

        {failed ? (
          <ErrorState text="Die Übersicht konnte nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Übersicht wird geladen …" />
        ) : (
          <>
            <Kennzahlen items={kennzahlen} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <ZuErledigen aufgaben={aufgaben} pflege={pruefpunkte} />

              <Section
                title="Außer Haus"
                description="Nach Partner, früheste Rückgabe zuerst"
                actions={
                  ausserHausGruppen.length > 0 && (
                    <a href={tabelleLink({ status: `${KOMMISSION},${AUSGESTELLT}` })} className="hidden sm:inline-flex items-center min-h-11 text-base font-medium text-primary hover:underline underline-offset-4">
                      Als Tabelle
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
                          sub={[plural(g.anzahl, "Stück", "Stück"), g.art, g.ort].filter(Boolean).join(" · ")}
                          meta={<FristBadge iso={g.naechste} />}
                          href={g.key === "ohne" ? AUSSER_HAUS_LINK : `${AUSSER_HAUS_LINK}&q=${encodeURIComponent(g.name)}`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
                {ausserHausGruppen.length > AUSSER_HAUS_MAX && <p className="text-sm text-muted-foreground">und {ausserHausGruppen.length - AUSSER_HAUS_MAX} weitere Partner im Bestand</p>}
              </Section>
            </div>

            <Section title="Zuletzt erfasst oder geändert">{zuletzt.length === 0 ? <EmptyState text="Noch nichts erfasst." /> : <Bildleiste items={zuletzt} />}</Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <Section title="Unikate nach Typ" description="Ohne verkaufte Stücke">
                <CountTable head={["Typ", "im Haus", "außer Haus", "gesamt"]} rows={typRows} empty="Noch keine Unikate im Bestand." />
              </Section>

              <Section title="Editionsware je Modell" description="Stück nach Zustand">
                <CountTable head={["Modell", "Rohlinge", "glasiert", "gesamt"]} rows={alleModelle ? modellRows : modellRows.slice(0, MODELLE_SICHTBAR)} empty="Noch keine Editionsware." />
                {modellRows.length > MODELLE_SICHTBAR && (
                  <button type="button" onClick={() => setAlleModelle((a) => !a)} className="inline-flex items-center gap-1 min-h-11 text-base font-medium text-primary hover:underline underline-offset-4">
                    {alleModelle ? "Weniger zeigen" : `Alle ${zahl.format(modellRows.length)} Modelle zeigen`}
                    <ChevronDown className={`w-4 h-4 transition-transform ${alleModelle ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                )}
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { datasource, q, useRecords } from "@/lib/datasource";
import { ChevronRight } from "lucide-react";
import { AUSGESTELLT, KOMMISSION, PAGE_SIZE, RESERVIERT, ROHLING, VERFUEGBAR, VERKAUFT, isAusserHaus } from "../shared/konstanten";
import { type Attachment, type RawItem, asAttachments, asOpts, firstLabel, formatDate, euro, lookupValue, modellLabel, num, str, useAllPages, zahl } from "../shared/daten";
import { EmptyState, ErrorState, ListRow, LoadingState, PageHeader, Section, Tile } from "../shared/ui";

const ds = datasource.define({ unikate: "unikate", edition: "edition", partner: "partner" });

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
});

const RECENT_COUNT = 6;
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
  fotos: Attachment[];
  erfasstAm: string;
  geaendertAm: string;
};
type CountRow = { label: string; href: string; values: number[] };

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
    <span className={`inline-block text-sm rounded-md px-2 py-0.5 mt-0.5 ${frist === "ueberfaellig" ? "bg-red-50 text-red-800" : frist === "bald" ? "bg-amber-50 text-amber-900" : "text-muted-foreground"}`}>
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
      verkauftOhnePreis: verkauftJahr.filter((u) => u.preis === null).length,
      verkauftOhneDatum: by(VERKAUFT).filter((u) => !u.verkauftAm).length,
      rohlinge: editionen.filter((e) => e.zustand === ROHLING).reduce((n, e) => n + e.anzahl, 0),
      glasiert: editionen.filter((e) => e.zustand !== ROHLING).reduce((n, e) => n + e.anzahl, 0),
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
        zeile: [u.inv, u.status].filter(Boolean).join(" · "),
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

  const knapp = editionen.filter((e) => e.anzahl < LOW_STOCK).sort((a, b) => a.anzahl - b.anzahl);
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const verkauftHinweis = [
    stats.verkauftOhnePreis > 0 ? `${zahl.format(stats.verkauftOhnePreis)} ohne Preis` : "",
    stats.verkauftOhneDatum > 0 ? `${zahl.format(stats.verkauftOhneDatum)} ohne Verkaufsdatum` : "",
  ]
    .filter(Boolean)
    .join(" · ");

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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Tile label="Verfügbar" value={zahl.format(stats.verfuegbar)} sub={`Wert ${euro.format(stats.verfuegbarWert)}`} href={tabelleLink({ status: VERFUEGBAR })} />
              <Tile label="Reserviert" value={zahl.format(stats.reserviert)} href={tabelleLink({ status: RESERVIERT })} />
              <Tile
                label="Außer Haus"
                value={zahl.format(stats.ausserHaus)}
                sub={stats.partner === 1 ? "bei 1 Partner" : `bei ${zahl.format(stats.partner)} Partnern`}
                warn={stats.ueberfaellig > 0 ? `${plural(stats.ueberfaellig, "Rückgabe", "Rückgaben")} überfällig` : undefined}
                href={AUSSER_HAUS_LINK}
              />
              <Tile
                label={`Verkauft ${jahr}`}
                value={zahl.format(stats.verkauftJahr)}
                sub={`Umsatz ${euro.format(stats.umsatzJahr)}`}
                note={verkauftHinweis || undefined}
                href={tabelleLink({ status: VERKAUFT, verkauftJahr: String(jahr) })}
              />
              <div className="col-span-2 md:col-span-1">
                <Tile label="Editionsware" value={zahl.format(stats.rohlinge + stats.glasiert)} sub={`davon ${zahl.format(stats.rohlinge)} Rohlinge`} href="/bestand?tab=edition" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <Section
                title="Außer Haus"
                description="Nach Partner, früheste Rückgabe zuerst"
                actions={
                  ausserHausGruppen.length > 0 && (
                    <a href={AUSSER_HAUS_LINK} className="inline-flex items-center min-h-11 text-base font-medium text-primary hover:underline underline-offset-4">
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
                          sub={[g.art, g.ort].filter(Boolean).join(" · ")}
                          meta={
                            <>
                              <span className="block tabular-nums">{plural(g.anzahl, "Stück", "Stück")}</span>
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

              <Section title="Zuletzt erfasst oder geändert">
                {zuletzt.length === 0 ? (
                  <EmptyState text="Noch nichts erfasst." />
                ) : (
                  <ul className="divide-y">
                    {zuletzt.map((z) => (
                      <li key={z.key}>
                        <ListRow fotos={z.fotos} title={z.titel} sub={z.zeile} meta={<span className="text-sm text-muted-foreground tabular-nums">{formatDate(z.zeit)}</span>} href={z.href} />
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Unikate nach Typ" description="Ohne verkaufte Stücke">
                <CountTable
                  head={["Typ", "im Haus", "außer Haus", "gesamt"]}
                  rows={typRows}
                  empty="Noch keine Unikate im Bestand."
                />
              </Section>

              <Section title="Editionsware je Modell" description={`Posten unter ${LOW_STOCK} Stück sind markiert`}>
                <CountTable head={["Modell", "Rohlinge", "glasiert", "gesamt"]} rows={modellRows} empty="Noch keine Editionsware." />
                {knapp.length > 0 ? (
                  <ul className="space-y-1 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                    {knapp.map((e) => (
                      <li key={e.id}>
                        Knapp: {[e.modell, e.zustand, e.glasur].filter(Boolean).join(" · ")} – <span className="font-semibold tabular-nums">{zahl.format(e.anzahl)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  modellRows.length > 0 && <p className="text-sm text-muted-foreground">Kein Posten unter {LOW_STOCK} Stück.</p>
                )}
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

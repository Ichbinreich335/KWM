import { useMemo, useState } from "react";
import { datasource, q, useFieldOptions, useRecordCreate, useRecordDelete, useRecordUpdate, useRecords, useUpload } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Archive, ArchiveRestore, Check, ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AUSSER_HAUS_ORT, PAGE_SIZE } from "../shared/konstanten";
import { type Attachment, type Opt, type RawItem, asAttachments, asOpts, compareNr, firstLabel, freshItems, modellLabel, parseNumber, str, useAllPages, zahl } from "../shared/daten";
import {
  ChoiceChips,
  DIALOG_CLASS,
  EmptyState,
  ErrorState,
  ErrorText,
  FIELD_CLASS,
  FieldLabel,
  Hint,
  ListRow,
  LoadingState,
  PANEL_CLASS,
  PageHeader,
  PanelHeader,
  PhotoPicker,
  SearchField,
  SearchPick,
  TEXTAREA_CLASS,
  Tabs,
} from "../shared/ui";

const ds = datasource.define({
  kuenstler: "kuenstler",
  glasuren: "glasuren",
  modelle: "modelle",
  partner: "partner",
  lagerorte: "lagerorte",
  unikate: "unikate",
  edition: "edition",
  ansichten: "ansichten",
});
const ansichtZaehler = q.select({ name: "8s5KL" });
// Grenze im Free-Plan von Softr (Einträge je Datenbank, vorsichtig angesetzt). Bei Planwechsel anpassen.
const DATENSATZ_GRENZE = 1000;
const GRENZE_WARNUNG = 0.8;

const kuenstlerSelect = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const glasurSelect = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const modellSelect = q.select({ name: "eXo5w", artikelnr: "BNpSN", programm: "Mrgtb", nameEn: "CyPYU", typ: "gCX7K", masse: "h65qx", vk: "772dM", glasuren: "EazCZ", foto: "GbUfa", archiviert: "3tlrw" });
const partnerSelect = q.select({ name: "a4yfc", art: "ZS9HU", ort: "RQRec", kontakt: "lnhez", zusammenarbeit: "uEfkz", notiz: "8pLh8", archiviert: "24Tn9" });
const lagerortSelect = q.select({ name: "AoOjs", bereich: "5h1mS", archiviert: "kMBsy" });
const unikatLinks = q.select({ kuenstler: "oDNBh", glasur: "ByeH3", lagerort: "EkVC3", galerie: "NfsXv" });
const editionLinks = q.select({ modell: "jxN6x", glasur: "pbGEk", lagerort: "T5iQe" });

const SEARCH_FROM = 10;

type KatKey = "kuenstler" | "glasuren" | "modelle" | "partner" | "lagerorte";
type FieldDef = { key: string; label: string; kind: "text" | "textarea" | "chips" | "price" | "multi"; required?: boolean; placeholder?: string; options?: Opt[] };
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
  // Eigene Regel für Doppelte (z. B. Artikelnummer) und Sortierung. Ohne Angabe: Name.
  duplicateOf?: (values: Values, selfId: string | undefined) => string | undefined;
  sortKey?: (e: Entry) => string;
  locked?: (e: Entry) => string | undefined;
  save: (id: string | null, values: Values, fotos: Attachment[] | undefined) => Promise<void>;
  archive: (id: string, archiviert: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

function toEntry(item: RawItem, keys: string[], sub: (v: Values) => string, fotoKey?: string): Entry {
  const f = item.fields;
  const values: Values = {};
  keys.forEach((k) => (values[k] = asOpts(f[k]).length ? firstLabel(f[k]) : typeof f[k] === "number" ? zahl.format(f[k] as number) : str(f[k])));
  return { id: item.id, name: values.name ?? "", values, fotos: fotoKey ? asAttachments(f[fotoKey]) : [], sub: sub(values), archiviert: f.archiviert === true };
}

// Dezenter Hinweis für den Admin: wie voll die Datenbank im Free-Plan ist.
function Speicherstand({ eintraege }: { eintraege: number }) {
  const anteil = eintraege / DATENSATZ_GRENZE;
  const knapp = anteil >= GRENZE_WARNUNG;
  return (
    <div className="pt-6 flex items-center gap-3 text-sm text-muted-foreground" title="Alle Einträge der Datenbank: Stücke, Editionsware, Stammdaten und gespeicherte Ansichten">
      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden" aria-hidden>
        <div className={`h-full ${knapp ? "bg-amber-500" : "bg-muted-foreground/40"}`} style={{ width: `${Math.min(100, Math.round(anteil * 100))}%` }} />
      </div>
      <span className={knapp ? "text-amber-800" : ""}>
        Datenbank: {zahl.format(eintraege)} von {zahl.format(DATENSATZ_GRENZE)} Einträgen (Free-Plan)
        {knapp && " – bald voll, Plan prüfen"}
      </span>
    </div>
  );
}

function countLinks(items: RawItem[], keys: string[]): Map<string, number> {
  const map = new Map<string, number>();
  items.forEach((i) => keys.forEach((k) => asOpts(i.fields[k]).forEach((o) => map.set(`${k}:${o.id}`, (map.get(`${k}:${o.id}`) ?? 0) + 1))));
  return map;
}

function EntryDialog({ kat, entry, onClose }: { kat: Kategorie; entry: Entry | null; onClose: () => void }) {
  const [values, setValues] = useState<Values>(() => Object.fromEntries(kat.fields.map((f) => [f.key, entry?.values[f.key] ?? ""])));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<{ key: string; text: string } | null>(null);
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
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Das hat nicht geklappt. Bitte erneut versuchen.");
      setBusy(false);
    }
  }
  const name = (values.name ?? "").trim();
  const sameName = kat.entries.find((e) => e.id !== entry?.id && e.name.trim().toLowerCase() === name.toLowerCase());
  const duplicateText = kat.duplicateOf ? kat.duplicateOf({ ...values, name }, entry?.id) : sameName && `„${sameName.name}“ gibt es schon.`;

  async function save() {
    if (!name) {
      setError({ key: "name", text: "Bitte einen Namen eingeben." });
      return;
    }
    if (duplicateText) {
      setError({ key: kat.duplicateOf ? "artikelnr" : "name", text: duplicateText });
      return;
    }
    const badNumber = kat.fields.find((f) => f.kind === "price" && values[f.key].trim() && parseNumber(values[f.key]) === null);
    if (badNumber) {
      setError({ key: badNumber.key, text: "Bitte eine Zahl eingeben, z. B. 400 oder 12,50." });
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
              ) : f.kind === "multi" ? (
                <SearchPick
                  label={f.label}
                  createNoun={f.label}
                  options={f.options ?? []}
                  value={values[f.key].split(",").filter(Boolean)}
                  onChange={(ids) => setValues((s) => ({ ...s, [f.key]: ids.join(",") }))}
                  multiple
                />
              ) : f.kind === "textarea" ? (
                <Textarea id={`f-${f.key}`} rows={3} value={values[f.key]} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))} className={TEXTAREA_CLASS} />
              ) : (
                <Input
                  id={`f-${f.key}`}
                  value={values[f.key]}
                  inputMode={f.kind === "price" ? "decimal" : undefined}
                  aria-invalid={error?.key === f.key}
                  disabled={f.key === "name" && !!lockedReason}
                  placeholder={f.placeholder}
                  onChange={(e) => {
                    setValues((s) => ({ ...s, [f.key]: e.target.value }));
                    setError(null);
                  }}
                  className={FIELD_CLASS}
                />
              )}
              {f.key === "name" && lockedReason && <Hint>{lockedReason}</Hint>}
              {error?.key === f.key && <ErrorText>{error.text}</ErrorText>}
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
  const ansichtQuery = useRecords({ from: ds.ansichten, select: ansichtZaehler, count: PAGE_SIZE });
  useAllPages(ansichtQuery);
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
  const programme = useFieldOptions({ from: ds.modelle, select: modellSelect, field: "programm" }).options as Opt[];
  const partnerArten = useFieldOptions({ from: ds.partner, select: partnerSelect, field: "art" }).options as Opt[];
  const zusammenarbeit = useFieldOptions({ from: ds.partner, select: partnerSelect, field: "zusammenarbeit" }).options as Opt[];
  const bereiche = useFieldOptions({ from: ds.lagerorte, select: lagerortSelect, field: "bereich" }).options as Opt[];

  const items = (query: { data?: { pages: { items: unknown[] }[] } }) => (query.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[];
  const glasurAuswahl: Opt[] = items(glasurQuery)
    .filter((i) => i.fields.archiviert !== true)
    .map((i) => ({ id: i.id, label: str(i.fields.name) }))
    .sort((a, b) => a.label.localeCompare(b.label, "de"));
  const usage = useMemo(() => {
    const u = countLinks((unikatQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[], ["kuenstler", "glasur", "lagerort", "galerie"]);
    const e = countLinks((editionQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[], ["modell", "glasur", "lagerort"]);
    const m = countLinks((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[], ["glasuren"]);
    return (key: string, id: string, source: "u" | "e" | "m") => (source === "u" ? u : source === "e" ? e : m).get(`${key}:${id}`) ?? 0;
  }, [unikatQuery.data, editionQuery.data, modellQuery.data]);

  const stueck = (n: number, eins: string, mehrere: string) => (n === 0 ? `noch bei keinem ${eins}` : `bei ${zahl.format(n)} ${n === 1 ? eins : mehrere}`);

  async function run<T>(mutation: { mutateAsync: (v: never) => Promise<T> }, payload: unknown, refetch: () => unknown) {
    await mutation.mutateAsync(payload as never);
    await refetch();
  }
  const archiveVia = (mutation: { mutateAsync: (v: never) => Promise<unknown> }, refetch: () => unknown) => (id: string, archiviert: boolean) => run(mutation, { recordId: id, fields: { archiviert } }, refetch);
  // Löschen nur, wenn nach frischem Nachzählen nichts mehr darauf verweist (ein zweites Gerät könnte es gerade verwendet haben).
  type Ref = { source: "u" | "e" | "m"; key: string };
  const sources = { u: unikatQuery, e: editionQuery, m: modellQuery };
  async function freshUsage(id: string, refs: Ref[]): Promise<number> {
    let n = 0;
    for (const r of refs) {
      const list = await freshItems(sources[r.source]);
      if (!list) throw new Error("Die Verwendung konnte nicht geprüft werden. Bitte erneut versuchen.");
      n += countLinks(list, [r.key]).get(`${r.key}:${id}`) ?? 0;
    }
    return n;
  }
  const removeVia = (mutation: { mutateAsync: (v: never) => Promise<unknown> }, refetch: () => unknown, refs: Ref[]) => async (id: string) => {
    const n = await freshUsage(id, refs);
    if (n > 0) throw new Error(`Wird inzwischen ${n === 1 ? "einmal" : `${zahl.format(n)}-mal`} verwendet und kann nicht gelöscht werden. Stattdessen archivieren.`);
    await run(mutation, id, refetch);
  };

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
      remove: removeVia(kuenstlerDelete, kuenstlerQuery.refetch, [{ source: "u", key: "kuenstler" }]),
      save: (id, v) => run(id ? kuenstlerUpdate : kuenstlerCreate, id ? { recordId: id, fields: { name: v.name } } : { name: v.name }, kuenstlerQuery.refetch),
    },
    {
      key: "glasuren",
      label: "Glasuren",
      singular: "Glasur",
      hint: "Glasurname für Unikate und Editionsware.",
      fields: [{ key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Seladon Nebel" }],
      entries: items(glasurQuery).map((i) => toEntry(i, ["name"], () => "")),
      usage: (id) =>
        [stueck(usage("glasur", id, "u"), "Unikat", "Unikaten"), stueck(usage("glasur", id, "e"), "Editionsposten", "Editionsposten"), usage("glasuren", id, "m") ? `bei ${zahl.format(usage("glasuren", id, "m"))} ${usage("glasuren", id, "m") === 1 ? "Modell" : "Modellen"}` : ""]
          .filter(Boolean)
          .join(" · "),
      usageCount: (id) => usage("glasur", id, "u") + usage("glasur", id, "e") + usage("glasuren", id, "m"),
      archive: archiveVia(glasurUpdate, glasurQuery.refetch),
      remove: removeVia(glasurDelete, glasurQuery.refetch, [
        { source: "u", key: "glasur" },
        { source: "e", key: "glasur" },
        { source: "m", key: "glasuren" },
      ]),
      save: (id, v) => run(id ? glasurUpdate : glasurCreate, id ? { recordId: id, fields: { name: v.name } } : { name: v.name }, glasurQuery.refetch),
    },
    {
      key: "modelle",
      label: "Modelle",
      singular: "Modell",
      hint: "Artikel aus Editionen und Manufakturprogramm. Erscheinen beim Erfassen von Editionsware.",
      fields: [
        { key: "artikelnr", label: "Artikelnr.", kind: "text", placeholder: "z. B. 2001 oder 6a" },
        { key: "name", label: "Name", kind: "text", required: true, placeholder: "z. B. Kugelvase Craquelée" },
        { key: "nameEn", label: "Name englisch", kind: "text", placeholder: "z. B. spherical vase" },
        { key: "programm", label: "Programm", kind: "chips", options: programme },
        { key: "typ", label: "Typ", kind: "chips", options: modellTypen },
        { key: "glasuren", label: "Glasuren", kind: "multi", options: glasurAuswahl },
        { key: "masse", label: "Maße", kind: "text", placeholder: "z. B. Ø 8 × H 10 cm" },
        { key: "vk", label: "VK-Preis in €", kind: "price", placeholder: "z. B. 400" },
      ],
      foto: true,
      entries: items(modellQuery).map((i) => {
        const e = toEntry(i, ["name", "artikelnr", "nameEn", "programm", "typ", "masse", "vk"], (v) => [v.programm, v.typ, v.masse, v.vk && `${v.vk} €`].filter(Boolean).join(" · "), "foto");
        e.values.glasuren = asOpts(i.fields.glasuren)
          .map((g) => g.id)
          .join(",");
        return { ...e, name: modellLabel(e.values.artikelnr, e.values.name) };
      }),
      sortKey: (e) => e.values.artikelnr,
      // Eine Artikelnummer gibt es nur einmal. Ohne Nummer darf der Name nicht doppelt sein.
      duplicateOf: (v, selfId) => {
        const nr = (v.artikelnr ?? "").trim().toLowerCase();
        const andere = items(modellQuery).filter((i) => i.id !== selfId);
        const gleich = nr ? andere.find((i) => str(i.fields.artikelnr).trim().toLowerCase() === nr) : andere.find((i) => !str(i.fields.artikelnr) && str(i.fields.name).trim().toLowerCase() === v.name.toLowerCase());
        if (!gleich) return undefined;
        return nr ? `Artikelnr. ${nr} gibt es schon („${str(gleich.fields.name)}“).` : `„${v.name}“ gibt es schon. Bitte eine Artikelnr. angeben.`;
      },
      usage: (id) => stueck(usage("modell", id, "e"), "Editionsposten", "Editionsposten"),
      usageCount: (id) => usage("modell", id, "e"),
      archive: archiveVia(modellUpdate, modellQuery.refetch),
      remove: removeVia(modellDelete, modellQuery.refetch, [{ source: "e", key: "modell" }]),
      save: (id, v, fotos) => {
        const fields = {
          name: v.name,
          artikelnr: v.artikelnr.trim(),
          nameEn: v.nameEn.trim(),
          programm: v.programm || null,
          typ: v.typ || null,
          masse: v.masse.trim(),
          vk: parseNumber(v.vk),
          glasuren: v.glasuren.split(",").filter(Boolean),
          ...(fotos ? { foto: fotos } : {}),
        };
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
      remove: removeVia(partnerDelete, partnerQuery.refetch, [{ source: "u", key: "galerie" }]),
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
      remove: removeVia(lagerortDelete, lagerortQuery.refetch, [
        { source: "u", key: "lagerort" },
        { source: "e", key: "lagerort" },
      ]),
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
    .sort((a, b) => (kat.sortKey ? compareNr(kat.sortKey(a), kat.sortKey(b)) : 0) || a.name.localeCompare(b.name, "de"));
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
            <Speicherstand eintraege={[...queries, ansichtQuery].reduce((n, qq) => n + (qq.data?.pages.flatMap((p) => p.items).length ?? 0), 0)} />
          </>
        )}
      </div>
      {dialog && <EntryDialog key={`${kat.key}-${dialog.entry?.id ?? "neu"}`} kat={kat} entry={dialog.entry} onClose={() => setDialog(null)} />}
    </div>
  );
}

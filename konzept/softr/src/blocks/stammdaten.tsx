import { useMemo, useState } from "react";
import { datasource, q, useFieldOptions, useRecordCreate, useRecordUpdate, useRecords, useUpload } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AUSSER_HAUS_ORT, PAGE_SIZE } from "../shared/konstanten";
import { type Attachment, type Opt, type RawItem, asAttachments, asOpts, firstLabel, str, useAllPages, zahl } from "../shared/daten";
import {
  ChoiceChips,
  DIALOG_CLASS,
  EmptyState,
  ErrorState,
  ErrorText,
  FieldLabel,
  Hint,
  ListRow,
  LoadingState,
  PageHeader,
  PanelHeader,
  PhotoPicker,
  TabChips,
} from "../shared/ui";

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

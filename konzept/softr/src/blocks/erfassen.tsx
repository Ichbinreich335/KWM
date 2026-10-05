import { useEffect, useMemo, useRef, useState } from "react";
import {
  datasource,
  q,
  useFieldOptions,
  useRecord,
  useRecordCreate,
  useRecordUpdate,
  useRecords,
  useUpload,
} from "@/lib/datasource";
import { useNavigationSetting } from "@/lib/editable-settings";
import { NavigationAction } from "@/components/navigation-action";
import { useCurrentUser } from "@/lib/user";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AUSSER_HAUS_ORT, EDITION_PROGRAMM, GESCHRUEHT, GLASIERT, MANUFAKTUR_PROGRAMM, PAGE_SIZE, isAusserHaus } from "../shared/konstanten";
import { type Opt, type RawItem, activeOptions, asOpts, compareNr, freshItems, link, modellLabel, parseNumber, str, today, useAllPages } from "../shared/daten";
import { bezeichnung, gleicherPosten, toPosten } from "../shared/mengen";
import { AddNew, ChoiceChips, ErrorText, Feld, FieldLabel, GroupedSelect, Hint, Knopf, OptionSelect, PageHeader, PANEL_CLASS, PhotoPicker, Rueckfrage, SchalterFeld, SearchPick, SEITE_CLASS, STICKY_BOTTOM, Stueckzahl, Tabs, Textfeld, TextMitVorschlag, ZusatzKnopf } from "../shared/ui";

const ds = datasource.define({ unikate: "unikate", edition: "edition", glasuren: "glasuren", kuenstler: "kuenstler", lagerorte: "lagerorte", partner: "partner", modelle: "modelle" });
const glasurNeu = q.select({ name: "OuhBi" });
const kuenstlerNeu = q.select({ name: "vqD0c" });
const glasurListe = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const kuenstlerListe = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const lagerortListe = q.select({ name: "AoOjs", archiviert: "kMBsy" });
const partnerListe = q.select({ name: "a4yfc", archiviert: "24Tn9" });
const modellListe = q.select({ name: "eXo5w", artikelnr: "BNpSN", programm: "Mrgtb", glasuren: "EazCZ", archiviert: "3tlrw" });

const unikatFields = q.select({
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  kuenstler: "oDNBh",
  gedreht: "90TmC",
  glasiert: "2PXtk",
  datum: "UfM5S",
  gedrehtAm: "bbA3e",
  glasiertAm: "m4gc9",
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
});
const unikatInfo = q.select({ name: "7IBVW", inventarnummer: "glG6V" });

const editionFields = q.select({
  bezeichnung: "LFUIR",
  modell: "jxN6x",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  lagerort: "T5iQe",
  foto: "nibt5",
  notiz: "lyJky",
  brand: "jqmqn",
  reserviert: "L1bO5",
});

const FIELD_NAMES: Record<string, string> = {
  name: "Name",
  status: "Status",
  preis: "Preis",
  modell: "Modell",
  zustand: "Zustand",
  glasur: "Glasur",
  anzahl: "Anzahl",
};

type Art = "unikat" | "edition";
// Geschirr und Edition sind der Hauptfluss der Werkstatt, darum zuerst. Unikate kommen seltener vor.
const ART_TABS: { key: Art; label: string }[] = [
  { key: "edition", label: "Geschirr & Edition" },
  { key: "unikat", label: "Unikat" },
];
type Saved = { art: Art; recordId: string; text: string };

type UnikatForm = {
  name: string;
  typ: string;
  status: string;
  kuenstler: string;
  gedreht: string;
  glasiert: string;
  datum: string;
  gedrehtAm: string;
  glasiertAm: string;
  glasur: string[];
  masse: string;
  lagerort: string;
  galerie: string;
  preis: string;
  bildnachweis: string;
  website: boolean;
  notiz: string;
};

type EditionForm = {
  modell: string;
  zustand: string;
  glasur: string;
  brand: string;
  reserviert: string;
  anzahl: number;
  lagerort: string;
  notiz: string;
};

const emptyUnikat = (): UnikatForm => ({
  name: "",
  typ: "",
  status: "verfügbar",
  kuenstler: "",
  gedreht: "",
  glasiert: "",
  datum: today(),
  gedrehtAm: "",
  glasiertAm: "",
  glasur: [],
  masse: "",
  lagerort: "",
  galerie: "",
  preis: "",
  bildnachweis: "",
  website: false,
  notiz: "",
});

const emptyEdition = (): EditionForm => ({
  modell: "",
  zustand: GESCHRUEHT,
  glasur: "",
  brand: today(),
  reserviert: "",
  anzahl: 1,
  lagerort: "",
  notiz: "",
});

// Am Handy eine Spalte, ab Desktop Pflichtangaben links und Weitere Angaben rechts.
const COLUMNS = "grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12";
const SECOND_COLUMN = "border-t pt-6 lg:border-t-0 lg:pt-0";

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

// Zweite Spalte am Rechner, am Handy darunter. Nichts ist eingeklappt: Speichern klebt unten und ist jederzeit erreichbar.
function ZweiteSpalte({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-6 ${SECOND_COLUMN}`}>
      <SectionTitle title={title} hint={hint} />
      {children}
    </div>
  );
}

function SuccessCard({ saved, onNext }: { saved: Saved; onNext: () => void }) {
  const bestandLink = useNavigationSetting({
    name: "bestand-link",
    label: "Link zum Bestand",
    initialValue: { destination: "/bestand", openIn: "SELF" },
  });
  const { data } = useRecord({
    from: ds.unikate,
    select: unikatInfo,
    recordId: saved.art === "unikat" ? saved.recordId : null,
  });
  const inventarnummer = (data as { fields?: { inventarnummer?: string } } | undefined)?.fields?.inventarnummer;

  return (
    <div className={`${PANEL_CLASS} p-6 text-center space-y-4`} role="status">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="w-7 h-7 text-primary" aria-hidden />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Gespeichert</h2>
        <p className="text-base text-muted-foreground mt-1">{saved.text}</p>
        {inventarnummer && <p className="text-base mt-1">Inventarnummer: <strong>{inventarnummer}</strong></p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Knopf size="lg" onClick={onNext}>
          Nächstes Stück erfassen
        </Knopf>
        <Knopf asChild size="lg" variant="outline">
          <NavigationAction navigation={bestandLink}>Zum Bestand</NavigationAction>
        </Knopf>
      </div>
    </div>
  );
}

export default function Block() {
  const user = useCurrentUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [art, setArt] = useState<Art>("edition");
  const [unikat, setUnikat] = useState<UnikatForm>(emptyUnikat);
  const [edition, setEdition] = useState<EditionForm>(emptyEdition);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);
  const [rueckfrage, setRueckfrage] = useState(false);
  const [einzelDaten, setEinzelDaten] = useState(false);

  const { uploadAsync } = useUpload();
  const createUnikat = useRecordCreate({ from: ds.unikate, fields: unikatFields });
  const createEdition = useRecordCreate({ from: ds.edition, fields: editionFields });
  const updateEdition = useRecordUpdate({ from: ds.edition, fields: q.select({ anzahl: "Ciiwp" }) });

  const typOptions = useFieldOptions({ from: ds.unikate, select: unikatFields, field: "typ" }).options as Opt[];
  const statusOptions = useFieldOptions({ from: ds.unikate, select: unikatFields, field: "status" })
    .options as Opt[];
  const zustandOptions = useFieldOptions({ from: ds.edition, select: editionFields, field: "zustand" })
    .options as Opt[];

  // Auswahllisten direkt aus den Stammdaten, damit archivierte Einträge wegfallen.
  const kuenstlerQuery = useRecords({ from: ds.kuenstler, select: kuenstlerListe, count: PAGE_SIZE });
  const glasurQuery = useRecords({ from: ds.glasuren, select: glasurListe, count: PAGE_SIZE });
  const lagerortQuery = useRecords({ from: ds.lagerorte, select: lagerortListe, count: PAGE_SIZE });
  const galerieQuery = useRecords({ from: ds.partner, select: partnerListe, count: PAGE_SIZE });
  const modellQuery = useRecords({ from: ds.modelle, select: modellListe, count: PAGE_SIZE });
  useAllPages(kuenstlerQuery);
  useAllPages(glasurQuery);
  useAllPages(lagerortQuery);
  useAllPages(galerieQuery);
  useAllPages(modellQuery);
  const kuenstlerOptions = activeOptions(kuenstlerQuery.data);
  const glasurOptions = activeOptions(glasurQuery.data);
  const lagerortOptions = activeOptions(lagerortQuery.data);
  const galerieOptions = activeOptions(galerieQuery.data);
  // Modelle aus dem Katalog: Nummer vor dem Namen, sortiert nach Artikelnummer, gruppiert nach Programm.
  const modelle = useMemo(
    () =>
      ((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[])
        .filter((i) => i.fields.archiviert !== true || i.id === edition.modell)
        .map((i) => ({
          id: i.id,
          nr: str(i.fields.artikelnr),
          name: str(i.fields.name),
          label: modellLabel(str(i.fields.artikelnr), str(i.fields.name)),
          programm: asOpts(i.fields.programm)[0]?.label ?? "",
          glasuren: asOpts(i.fields.glasuren).map((g) => g.id),
        }))
        .sort((a, b) => compareNr(a.nr, b.nr) || a.name.localeCompare(b.name, "de")),
    [modellQuery.data, edition.modell],
  );
  const modellGroups = [
    { label: "Editionen", options: modelle.filter((m) => m.programm === EDITION_PROGRAMM) },
    { label: "Manufakturprogramm (Geschirr)", options: modelle.filter((m) => m.programm === MANUFAKTUR_PROGRAMM) },
    { label: "Weitere Modelle", options: modelle.filter((m) => m.programm !== EDITION_PROGRAMM && m.programm !== MANUFAKTUR_PROGRAMM) },
  ];
  const gewaehltesModell = modelle.find((m) => m.id === edition.modell);
  // Glasuren des Modells. Leer: Glasur frei wählbar und freiwillig. Eine: fest. Mehrere: eine davon wählen.
  const modellGlasuren = gewaehltesModell?.glasuren.length ? glasurOptions.filter((g) => gewaehltesModell.glasuren.includes(g.id)) : [];
  const [extraTypen, setExtraTypen] = useState<Opt[]>([]);
  const typChoices = [...typOptions, ...extraTypen.filter((t) => !typOptions.some((o) => o.label === t.label))];
  const createGlasur = useRecordCreate({ from: ds.glasuren, fields: glasurNeu });
  const createKuenstler = useRecordCreate({ from: ds.kuenstler, fields: kuenstlerNeu });

  function addTyp(name: string): boolean {
    setExtraTypen((t) => [...t, { id: `neu-${name}`, label: name }]);
    setUnikat((s) => ({ ...s, typ: name }));
    return true;
  }

  async function addGlasur(name: string): Promise<string | null> {
    try {
      const created = await createGlasur.mutateAsync({ name } as never);
      await glasurQuery.refetch();
      toast.success(`Glasur „${name}“ angelegt.`);
      return (created as { id: string }).id;
    } catch {
      toast.error("Glasur konnte nicht angelegt werden.");
      return null;
    }
  }

  // Neue Person (Künstler:in, gedreht oder glasiert von) anlegen und direkt im jeweiligen Feld auswählen.
  const addPerson = (feld: "kuenstler" | "gedreht" | "glasiert") => async (name: string): Promise<boolean> => {
    try {
      const created = await createKuenstler.mutateAsync({ name } as never);
      await kuenstlerQuery.refetch();
      setUnikat((s) => ({ ...s, [feld]: (created as { id: string }).id }));
      toast.success(`„${name}“ angelegt.`);
      return true;
    } catch {
      toast.error("Konnte nicht angelegt werden.");
      return false;
    }
  };

  // Alle Editionszeilen laden: Nur so findet die Prüfung „Gibt es diese Kombination schon?“
  // jede Zeile und legt keine doppelte an.
  const editionQuery = useRecords({ from: ds.edition, select: editionFields, count: PAGE_SIZE });
  useAllPages(editionQuery);
  const editionReady = editionQuery.status === "success" && !editionQuery.hasNextPage;
  const editionRows = editionQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const isGlasiert = edition.zustand === GLASIERT;
  const wantGlasur = isGlasiert ? edition.glasur : "";
  const postenKey = { modellId: edition.modell, zustand: edition.zustand, glasurId: wantGlasur, brand: isGlasiert ? edition.brand : "", reserviert: isGlasiert ? edition.reserviert.trim() : "" };
  // Gleicher Posten (Modell, Zustand, Glasur, Brand, Reservierung) wird weitergezählt statt doppelt angelegt.
  const findRow = (rows: { id: string; fields: unknown }[]) => (edition.modell ? rows.find((r) => gleicherPosten(toPosten(r as RawItem), postenKey)) : undefined);
  const kunden = [...new Set<string>(editionRows.map((r) => toPosten(r as RawItem).reserviert).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const existingRow = findRow(editionRows);
  const existingCount = Number((existingRow?.fields as { anzahl?: number } | undefined)?.anzahl ?? 0);

  const clearError = (key: string) =>
    setErrors((e) => {
      if (!(key in e)) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  const setU = <K extends keyof UnikatForm>(key: K, value: UnikatForm[K]) => {
    setUnikat((s) => ({ ...s, [key]: value }));
    clearError(key);
  };
  const setE = <K extends keyof EditionForm>(key: K, value: EditionForm[K]) => {
    setEdition((s) => ({ ...s, [key]: value }));
    clearError(key);
  };
  // Beim Modellwechsel die Glasur neu setzen: feste Glasur übernehmen, sonst leeren.
  function chooseModell(id: string) {
    const m = modelle.find((x) => x.id === id);
    const fest = m && m.glasuren.length === 1 ? m.glasuren[0] : "";
    setEdition((s) => ({ ...s, modell: id, glasur: fest }));
    clearError("modell");
    clearError("glasur");
  }
  const changeFiles = (next: File[]) => {
    setFiles(next);
    clearError("fotos");
  };

  const canCreate = art === "unikat" ? createUnikat.enabled : createEdition.enabled;

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (art === "unikat") {
      if (!unikat.name.trim()) e.name = "Bitte einen Namen eingeben.";
      if (!unikat.status) e.status = "Bitte einen Status wählen.";
      const preis = parseNumber(unikat.preis);
      if (unikat.preis.trim() && (preis === null || preis < 0)) e.preis = "Bitte einen Betrag in Euro eingeben, z. B. 1.200.";
    } else {
      if (!edition.modell) e.modell = "Bitte ein Modell wählen.";
      if (!edition.zustand) e.zustand = "Bitte den Zustand wählen.";
      if (isGlasiert && modellGlasuren.length > 1 && !edition.glasur) e.glasur = "Bitte die Glasur wählen.";
      if (!(edition.anzahl > 0)) e.anzahl = "Die Anzahl muss mindestens 1 sein.";
    }
    return e;
  }

  async function uploadFiles(): Promise<{ filename: string; url: string }[]> {
    if (files.length === 0) return [];
    const results = await uploadAsync(files);
    const failed = results.filter((r) => r.status !== "completed");
    if (failed.length > 0) throw new Error("Foto konnte nicht hochgeladen werden. Bitte erneut versuchen.");
    return results.map((r) => ({ filename: r.file.name, url: r.url as string }));
  }

  // Empfohlene Angaben, die beim Unikat noch fehlen. Speichern geht trotzdem, nach einer Rückfrage.
  const fehlendEmpfohlen = art === "unikat" ? [files.length === 0 ? "Foto" : "", unikat.typ ? "" : "Typ"].filter(Boolean) : [];

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector('[data-error="true"]');
        (first?.parentElement ?? first)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (art === "edition" && !editionReady) {
      toast.error("Der Editionsbestand lädt noch. Bitte gleich noch einmal speichern.");
      return;
    }
    if (fehlendEmpfohlen.length > 0) {
      setRueckfrage(true);
      return;
    }
    await speichern();
  }

  async function speichern() {
    setRueckfrage(false);
    setBusy(true);
    try {
      const fotos = await uploadFiles();
      if (art === "unikat") {
        const preis = parseNumber(unikat.preis) ?? undefined;
        // Ohne Angabe gilt der Tag der Erfassung. Das Jahr folgt immer dem Datum.
        const datum = unikat.datum || today();
        const created = await createUnikat.mutateAsync({
          name: unikat.name.trim(),
          typ: unikat.typ,
          status: unikat.status,
          kuenstler: link(unikat.kuenstler),
          gedreht: link(unikat.gedreht),
          glasiert: link(unikat.glasiert),
          datum,
          jahr: Number(datum.slice(0, 4)),
          gedrehtAm: unikat.gedrehtAm || undefined,
          glasiertAm: unikat.glasiertAm || undefined,
          glasur: unikat.glasur,
          masse: unikat.masse.trim(),
          fotos,
          bildnachweis: unikat.bildnachweis.trim(),
          lagerort: link(unikat.lagerort),
          galerie: isAusserHaus(unikat.status) ? link(unikat.galerie) : [],
          preis,
          website: unikat.website,
          notiz: unikat.notiz.trim(),
          erfasstVon: user?.fullName || user?.email || "",
        } as never);
        setSaved({ art, recordId: (created as { id: string }).id, text: `Unikat „${unikat.name.trim()}“ ist im Bestand.` });
      } else {
        const modell = gewaehltesModell?.label ?? "";
        const glasur = glasurOptions.find((g) => g.id === wantGlasur)?.label;
        const variante = bezeichnung(modell, { zustand: edition.zustand, glasur: glasur ?? "", brand: postenKey.brand, reserviert: postenKey.reserviert });
        // Direkt vor dem Speichern frisch laden: Hat jemand anderes die Zeile gerade angelegt oder geändert,
        // wird dort weitergezählt statt eine doppelte Zeile anzulegen oder Stück zu verlieren.
        const fresh = await freshItems(editionQuery);
        if (!fresh) throw new Error("Der Bestand konnte nicht geladen werden. Bitte erneut speichern.");
        const row = findRow(fresh);
        if (row) {
          const neu = Number((row.fields as { anzahl?: number }).anzahl ?? 0) + edition.anzahl;
          await updateEdition.mutateAsync({ recordId: row.id, fields: { anzahl: neu } } as never);
          setSaved({ art, recordId: row.id, text: `${variante}: jetzt ${neu} Stück.` });
        } else {
          const created = await createEdition.mutateAsync({
            bezeichnung: variante,
            modell: link(edition.modell),
            glasur: link(wantGlasur || undefined),
            zustand: edition.zustand,
            anzahl: edition.anzahl,
            brand: postenKey.brand || null,
            reserviert: postenKey.reserviert,
            lagerort: link(edition.lagerort),
            foto: fotos,
            notiz: edition.notiz.trim(),
          } as never);
          setSaved({ art, recordId: (created as { id: string }).id, text: `${variante}: ${edition.anzahl} Stück angelegt.` });
        }
        await editionQuery.refetch();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSaved(null);
    setEinzelDaten(false);
    setErrors({});
    setFiles([]);
    setUnikat(emptyUnikat());
    setEdition(emptyEdition());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={SEITE_CLASS}>
      <div className="content">
        <div className="mb-5">
          <PageHeader title="Neues Stück erfassen" description="Nur Felder mit * sind Pflicht. Alles andere kann später ergänzt werden." />
        </div>

        {saved ? (
          <SuccessCard saved={saved} onNext={reset} />
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
            <Tabs
              label="Art des Stücks"
              tabs={ART_TABS}
              value={art}
              onChange={(key) => {
                setArt(key);
                setErrors({});
                setFiles((f) => (key === "edition" ? f.slice(0, 1) : f));
              }}
            />

            {art === "unikat" ? (
              <div className={COLUMNS}>
                <div className="space-y-6">
                  <SectionTitle title="Das Stück" hint="Nur der Name ist Pflicht." />
                  <div>
                    <FieldLabel htmlFor="foto-input" empfohlen>
                      Fotos
                    </FieldLabel>
                    <PhotoPicker files={files} onChange={changeFiles} multiple />
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-name" required>
                      Name
                    </FieldLabel>
                    <Feld
                      id="u-name"
                      value={unikat.name}
                      onChange={(e) => setU("name", e.target.value)}
                      placeholder="z. B. Mondvase „Seladon“"
                      aria-invalid={!!errors.name}
                    />
                    <ErrorText>{errors.name}</ErrorText>
                  </div>

                  <div>
                    <FieldLabel empfohlen>Typ</FieldLabel>
                    <ChoiceChips label="Typ" options={typChoices} value={unikat.typ} onChange={(v) => setU("typ", v)} />
                    <div className="mt-2">
                      <AddNew label="Neuer Typ" placeholder="z. B. Krug" existing={typChoices} onAdd={addTyp} />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <ChoiceChips
                      label="Status"
                      options={statusOptions}
                      value={unikat.status}
                      onChange={(v) => {
                        setU("status", v);
                        const ort = lagerortOptions.find((l) => l.label === AUSSER_HAUS_ORT)?.id;
                        if (isAusserHaus(v) && ort) setU("lagerort", ort);
                        else if (unikat.lagerort === ort) setU("lagerort", "");
                      }}
                      statusColors
                    />
                    <ErrorText>{errors.status}</ErrorText>
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-lagerort">Lagerort</FieldLabel>
                    <OptionSelect id="u-lagerort" value={unikat.lagerort} onChange={(v) => setU("lagerort", v)} options={lagerortOptions} placeholder="Bitte wählen" />
                  </div>

                  {isAusserHaus(unikat.status) && (
                    <div>
                      <FieldLabel htmlFor="u-galerie">Partner (Galerie, Museum …)</FieldLabel>
                      <OptionSelect id="u-galerie" value={unikat.galerie} onChange={(v) => setU("galerie", v)} options={galerieOptions} placeholder="Partner wählen" />
                    </div>
                  )}
                </div>

                <ZweiteSpalte title="Herstellung" hint="Wer hat das Stück gemacht und wann.">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel htmlFor="u-gedreht">Gedreht von</FieldLabel>
                      <OptionSelect id="u-gedreht" value={unikat.gedreht} onChange={(v) => setU("gedreht", v)} options={kuenstlerOptions} placeholder="Bitte wählen" />
                      <div className="mt-2">
                        <AddNew label="Neue Person" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addPerson("gedreht")} />
                      </div>
                    </div>
                    <div>
                      <FieldLabel htmlFor="u-glasiert">Glasiert von</FieldLabel>
                      <OptionSelect id="u-glasiert" value={unikat.glasiert} onChange={(v) => setU("glasiert", v)} options={kuenstlerOptions} placeholder="Bitte wählen" />
                      <div className="mt-2">
                        <AddNew label="Neue Person" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addPerson("glasiert")} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-datum">Datum</FieldLabel>
                    <Feld id="u-datum" type="date" value={unikat.datum} onChange={(e) => setU("datum", e.target.value)} />
                    <Hint>Vorbelegt mit heute. Leer gelassen gilt der Tag der Erfassung.</Hint>
                    {einzelDaten || unikat.gedrehtAm || unikat.glasiertAm ? (
                      <div className="grid sm:grid-cols-2 gap-6 mt-4">
                        <div>
                          <FieldLabel htmlFor="u-gedreht-am">Gedreht am</FieldLabel>
                          <Feld id="u-gedreht-am" type="date" value={unikat.gedrehtAm} onChange={(e) => setU("gedrehtAm", e.target.value)} />
                        </div>
                        <div>
                          <FieldLabel htmlFor="u-glasiert-am">Glasiert am</FieldLabel>
                          <Feld id="u-glasiert-am" type="date" value={unikat.glasiertAm} onChange={(e) => setU("glasiertAm", e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <ZusatzKnopf label="Gedreht am und glasiert am einzeln angeben" onClick={() => setEinzelDaten(true)} />
                      </div>
                    )}
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-kuenstler">Künstler:in</FieldLabel>
                    <OptionSelect id="u-kuenstler" value={unikat.kuenstler} onChange={(v) => setU("kuenstler", v)} options={kuenstlerOptions} placeholder="Bitte wählen" />
                    <div className="mt-2">
                      <AddNew label="Neue:r Künstler:in" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addPerson("kuenstler")} />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Glasur</FieldLabel>
                    <SearchPick label="Glasuren" createNoun="neue Glasur" options={glasurOptions} value={unikat.glasur} onChange={(ids) => setU("glasur", ids)} multiple onCreate={addGlasur} />
                    <Hint>Mehrere möglich. Fehlt eine Glasur, den Namen ins Suchfeld schreiben und anlegen.</Hint>
                  </div>

                  <div className="pt-2">
                    <SectionTitle title="Details" hint="Kann auch später im Bestand ergänzt werden." />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel htmlFor="u-masse">Maße</FieldLabel>
                      <Feld id="u-masse" value={unikat.masse} onChange={(e) => setU("masse", e.target.value)} placeholder="z. B. Ø 24 × H 8 cm" />
                    </div>
                    <div>
                      <FieldLabel htmlFor="u-bildnachweis">Bildnachweis</FieldLabel>
                      <Feld id="u-bildnachweis" value={unikat.bildnachweis} onChange={(e) => setU("bildnachweis", e.target.value)} placeholder="z. B. Foto: Name der Fotografin" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel htmlFor="u-preis">Preis intern (€)</FieldLabel>
                      <Feld id="u-preis" inputMode="decimal" value={unikat.preis} onChange={(e) => setU("preis", e.target.value)} placeholder="z. B. 480" aria-invalid={!!errors.preis} />
                      <Hint>Nur intern, erscheint nie auf der Website.</Hint>
                      <ErrorText>{errors.preis}</ErrorText>
                    </div>
                    <SchalterFeld
                      id="u-website"
                      label="Auf Website zeigen"
                      hint="Nur für die spätere Website-Anbindung."
                      checked={unikat.website}
                      onChange={(v) => setU("website", v)}
                      lage="self-start sm:mt-8"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="u-notiz">Notiz</FieldLabel>
                    <Textfeld id="u-notiz" value={unikat.notiz} onChange={(e) => setU("notiz", e.target.value)} rows={3} />
                  </div>
                </ZweiteSpalte>
              </div>
            ) : (
              <div className={COLUMNS}>
                <div className="space-y-6">
                  <SectionTitle title="Pflichtangaben" hint="Geschirr und Edition: Modell, Zustand, Anzahl." />
                  <div>
                    <FieldLabel htmlFor="e-modell" required>
                      Modell
                    </FieldLabel>
                    <GroupedSelect id="e-modell" value={edition.modell} onChange={chooseModell} groups={modellGroups} placeholder="Modell wählen (Nummer oder Name)" />
                    <Hint>Neue Modelle unter „Stammdaten“ anlegen.</Hint>
                    <ErrorText>{errors.modell}</ErrorText>
                  </div>

                  <div>
                    <FieldLabel required>Zustand</FieldLabel>
                    <ChoiceChips
                      label="Zustand"
                      options={zustandOptions}
                      value={edition.zustand}
                      onChange={(v) => setE("zustand", v)}
                    />
                    <ErrorText>{errors.zustand}</ErrorText>
                  </div>

                  {isGlasiert && edition.modell && (
                    <div>
                      <FieldLabel required={modellGlasuren.length > 1}>Glasur</FieldLabel>
                      {modellGlasuren.length === 1 ? (
                        <p className="text-base">
                          {modellGlasuren[0].label} <span className="text-muted-foreground">(fest bei diesem Modell)</span>
                        </p>
                      ) : modellGlasuren.length > 1 ? (
                        <ChoiceChips label="Glasur" options={modellGlasuren} value={modellGlasuren.find((g) => g.id === edition.glasur)?.label ?? ""} onChange={(label) => setE("glasur", modellGlasuren.find((g) => g.label === label)?.id ?? "")} />
                      ) : (
                        <>
                          <SearchPick label="Glasuren" createNoun="neue Glasur" options={glasurOptions} value={link(edition.glasur || undefined)} onChange={(ids) => setE("glasur", ids.at(-1) ?? "")} multiple={false} onCreate={addGlasur} />
                          <Hint>Freiwillig. Feste Glasuren eines Modells unter „Stammdaten“ eintragen.</Hint>
                        </>
                      )}
                      <ErrorText>{errors.glasur}</ErrorText>
                    </div>
                  )}

                  {isGlasiert && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <FieldLabel htmlFor="e-brand">Brand vom</FieldLabel>
                        <Feld id="e-brand" type="date" value={edition.brand} onChange={(e) => setE("brand", e.target.value)} />
                        <Hint>Stücke aus einem Brand stehen zusammen.</Hint>
                      </div>
                      <div>
                        <FieldLabel htmlFor="e-reserviert">Reserviert für</FieldLabel>
                        <TextMitVorschlag id="e-reserviert" value={edition.reserviert} onChange={(v) => setE("reserviert", v)} vorschlaege={kunden} placeholder="Kunde oder Auftrag (freiwillig)" />
                      </div>
                    </div>
                  )}

                  <div>
                    <FieldLabel htmlFor="e-anzahl" required>
                      Anzahl
                    </FieldLabel>
                    <Stueckzahl id="e-anzahl" value={edition.anzahl} min={1} onChange={(n) => setE("anzahl", n)} />
                    <ErrorText>{errors.anzahl}</ErrorText>
                    {existingRow && (
                      <p className="mt-3 rounded-md bg-muted p-3 text-base">
                        Diese Kombination gibt es schon mit <strong>{existingCount} Stück</strong>. Beim Speichern wird
                        die Anzahl dort auf <strong>{existingCount + edition.anzahl}</strong> erhöht.
                      </p>
                    )}
                  </div>
                </div>

                {!existingRow && (
                  <ZweiteSpalte title="Weitere Angaben" hint="Kann auch später im Bestand ergänzt werden.">
                    <div>
                      <FieldLabel htmlFor="e-lagerort">Lagerort</FieldLabel>
                      <OptionSelect
                        id="e-lagerort"
                        value={edition.lagerort}
                        onChange={(v) => setE("lagerort", v)}
                        options={lagerortOptions}
                        placeholder="Bitte wählen"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="foto-input">Foto</FieldLabel>
                      <PhotoPicker files={files} onChange={changeFiles} multiple={false} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="e-notiz">Notiz</FieldLabel>
                      <Textfeld
                        id="e-notiz"
                        value={edition.notiz}
                        onChange={(e) => setE("notiz", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </ZweiteSpalte>
                )}
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <p role="alert" className="text-base text-destructive">
                Bitte noch ausfüllen: {Object.keys(errors).map((k) => FIELD_NAMES[k] ?? k).join(", ")}
              </p>
            )}
            {canCreate ? (
              // Am Handy klebt Speichern unten, damit es nach den Pflichtangaben ohne Scrollen erreichbar ist.
              <div className={`sticky ${STICKY_BOTTOM} z-10 sm:static`}>
                <Knopf type="submit" size="lg" className="w-full h-14 rounded-md text-lg shadow-lg sm:shadow-none" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> Wird gespeichert …
                    </>
                  ) : existingRow && art === "edition" ? (
                    "Anzahl erhöhen"
                  ) : (
                    "Speichern"
                  )}
                </Knopf>
              </div>
            ) : (
              <p className="text-base text-muted-foreground">Du hast keine Berechtigung, Stücke zu erfassen.</p>
            )}
            <Rueckfrage
              offen={rueckfrage}
              titel={`${fehlendEmpfohlen.join(" und ")} ${fehlendEmpfohlen.length > 1 ? "fehlen" : "fehlt"} noch`}
              text="Trotzdem speichern? Du kannst alles jederzeit im Bestand nachtragen."
              bestaetigen="Trotzdem speichern"
              abbrechen="Noch ergänzen"
              onBestaetigen={speichern}
              onAbbrechen={() => setRueckfrage(false)}
            />
          </form>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { datasource, q, useFieldOptions, useRecordCreate, useRecordDelete, useRecordUpdate, useRecords, useUpload } from "@/lib/datasource";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, ClipboardList, ImageOff, Images, Loader2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { AUSGESTELLT, AUSSER_HAUS_ORT, EDITION_PROGRAMM, GESCHIRR, GESCHRUEHT, GLASIERT, KOMMISSION, PAGE_SIZE, RESERVIERT, ROH, VERFUEGBAR, VERKAUFT, ZUSTAENDE, isAusserHaus } from "../shared/konstanten";
import { type Attachment, type Opt, type RawItem, activeOptions, asAttachments, asOpts, euro, formatDate, freshItems, link, num, parseNumber, str, thumb, today, useAllPages, zahl } from "../shared/daten";
import { type BrandGruppe, type ModellStand, type Posten, type PostenKey, ausserHaus, bezeichnung, brandGruppen, brandName, glasurZeile, keyVon, nachModell, naechsterZustand, planeUmbuchung, postenText, schrittName, standText, statusText, toPosten, verkaufbar } from "../shared/mengen";
import {
  AktionKnopf,
  AnsichtToggle,
  Auswahl,
  ChoiceChips,
  DIALOG_CLASS,
  DoneButton,
  EmptyState,
  ErrorState,
  ErrorText,
  Feld,
  FieldLabel,
  FilterChips,
  EinzelWahl,
  GlasurWahl,
  Hint,
  Knopf,
  ListRow,
  LoadingState,
  OptionSelect,
  PageHeader,
  PANEL_CLASS,
  PanelHeader,
  PhotoPicker,
  SchalterFeld,
  Schnellfilter,
  SCROLL_ROW,
  SearchField,
  SearchPick,
  SEITE_CLASS,
  StatusBadge,
  STICKY_BOTTOM,
  Stueckzahl,
  Tabs,
  Textfeld,
  TextMitVorschlag,
  useAnsicht,
  WISCHEN,
  ZusatzKnopf,
} from "../shared/ui";

const ds = datasource.define({ unikate: "unikate", edition: "edition", kuenstler: "kuenstler", glasuren: "glasuren", lagerorte: "lagerorte", partner: "partner", modelle: "modelle" });
const kuenstlerSelect = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const glasurSelect = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const lagerortSelect = q.select({ name: "AoOjs", archiviert: "kMBsy" });
const partnerSelect = q.select({ name: "a4yfc", archiviert: "24Tn9" });
const modellSelect = q.select({ glasuren: "EazCZ" });
const glasurNeu = q.select({ name: "OuhBi" });

const unikatSelect = q.select({
  nummer: "T63YN",
  inv: "glG6V",
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
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
  erfasstAm: "p4ha0",
  verkauftAm: "48BXo",
  verkauftAn: "4qhRx",
  seit: "Evxm2",
  rueckgabe: "ENQkk",
  ort: "6YbfO",
  brennart: "8D0WI",
  glasurrezept: "XhsmV",
});
const unikatUpdateFields = q.select({
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  gedreht: "90TmC",
  glasiert: "2PXtk",
  datum: "UfM5S",
  gedrehtAm: "bbA3e",
  glasiertAm: "m4gc9",
  jahr: "ZIHrT",
  glasur: "ByeH3",
  masse: "KDUVZ",
  bildnachweis: "QqQo6",
  lagerort: "EkVC3",
  galerie: "NfsXv",
  preis: "N9yfT",
  website: "e5hSY",
  notiz: "Ku4py",
  verkauftAm: "48BXo",
  verkauftAn: "4qhRx",
  seit: "Evxm2",
  rueckgabe: "ENQkk",
  ort: "6YbfO",
  brennart: "8D0WI",
  glasurrezept: "XhsmV",
  fotos: "rqreT",
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
  artikelnr: "Zzp1S",
  programm: "IIAdh",
  brand: "jqmqn",
  reserviert: "L1bO5",
  status: "v9V6W",
  partner: "hs3iV",
  rueckgabe: "nBkRl",
  gedreht: "7FQQm",
  glasiert: "dkREk",
  masse: "eVHco",
});
const editionUpdateFields = q.select({ anzahl: "Ciiwp", lagerort: "T5iQe", notiz: "lyJky", masse: "eVHco" });
const editionCreateFields = q.select({
  bezeichnung: "LFUIR",
  modell: "jxN6x",
  glasur: "pbGEk",
  zustand: "WUkN3",
  anzahl: "Ciiwp",
  lagerort: "T5iQe",
  brand: "jqmqn",
  reserviert: "L1bO5",
  status: "v9V6W",
  partner: "hs3iV",
  rueckgabe: "nBkRl",
  gedreht: "7FQQm",
  glasiert: "dkREk",
  masse: "eVHco",
});
const AUSSER_STATUS: Opt[] = [AUSGESTELLT, KOMMISSION].map((s) => ({ id: s, label: s }));

const LIST_STEP = 50;
const LETZTE_BRAENDE = 3;
const UNDO_MS = 10000;

type Unikat = {
  id: string;
  nummer: number;
  inv: string;
  name: string;
  typ: string;
  status: string;
  gedreht: Opt | undefined;
  glasiert: Opt | undefined;
  datum: string;
  gedrehtAm: string;
  glasiertAm: string;
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
  verkauftAn: string;
  seit: string;
  rueckgabe: string;
  ort: string;
  brennart: string;
  glasurrezept: string;
};

// Drei Serien der Werkstatt. Geschirr und Edition sind Mengenware (Stück je Zustand), Unikate Einzelstücke.
type Art = "geschirr" | "edition" | "unikat";
type TabKey = "imhaus" | "kommission" | "verkauft" | "alle";
type StammData = { pages: { items: unknown[] }[] } | undefined;
type Stamm = { lagerorte: StammData; partner: StammData; kuenstler: StammData; glasuren: StammData };
type SortKey = "neu" | "name" | "nummer" | "preis" | "lagerort";

// „kommission“ bleibt als Schlüssel, weil Links aus der Übersicht ihn verwenden.
const TABS: { key: TabKey; label: string; match?: (u: Unikat) => boolean }[] = [
  { key: "imhaus", label: "Im Haus", match: (u) => u.status === VERFUEGBAR || u.status === RESERVIERT },
  { key: "kommission", label: "Außer Haus", match: (u) => isAusserHaus(u.status) },
  { key: "verkauft", label: "Verkauft", match: (u) => u.status === VERKAUFT },
  { key: "alle", label: "Alle" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "neu", label: "Neueste zuerst" },
  { key: "name", label: "Name A–Z" },
  { key: "nummer", label: "Inventarnummer" },
  { key: "preis", label: "Preis absteigend" },
  { key: "lagerort", label: "Lagerort" },
];

type MengenFilter = "alle" | "reserviert" | "ausser" | (typeof ZUSTAENDE)[number];
const MENGEN_FILTER: { key: MengenFilter; label: string; match: (s: ModellStand) => boolean }[] = [
  { key: "alle", label: "Alle", match: () => true },
  { key: GESCHRUEHT, label: "Geschrüht", match: (s) => (s.je[GESCHRUEHT] ?? 0) > 0 },
  { key: GLASIERT, label: "Glasiert", match: (s) => (s.je[GLASIERT] ?? 0) > 0 },
  { key: ROH, label: "Roh", match: (s) => (s.je[ROH] ?? 0) > 0 },
  { key: "reserviert", label: "Reserviert", match: (s) => s.reserviert > 0 },
  { key: "ausser", label: "Außer Haus", match: (s) => s.ausserHaus > 0 },
];
// Diese Filter erscheinen nur, wenn es solche Ware gibt.
const NUR_WENN_VORHANDEN: MengenFilter[] = [ROH, "ausser"];

function initialParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

// ?tab=geschirr | edition, sonst die Unikate (auch die alten Links mit Status, z. B. ?tab=kommission).
function initialArt(): Art {
  const t = initialParam("tab");
  return t === "edition" ? "edition" : t === "geschirr" || !t ? "geschirr" : "unikat";
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
    gedreht: asOpts(f.gedreht)[0],
    glasiert: asOpts(f.glasiert)[0],
    datum: str(f.datum),
    gedrehtAm: str(f.gedrehtAm),
    glasiertAm: str(f.glasiertAm),
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
    verkauftAn: str(f.verkauftAn),
    seit: str(f.seit),
    rueckgabe: str(f.rueckgabe),
    ort: str(f.ort),
    brennart: str(f.brennart),
    glasurrezept: str(f.glasurrezept),
  };
}

// Ältere Stücke haben nur ein Jahr, neue ein Datum.
function datumText(u: Unikat): string {
  return u.datum ? formatDate(u.datum) : u.jahr !== null ? String(u.jahr) : "";
}

function ortVon(u: Unikat): string {
  return (isAusserHaus(u.status) && u.galerie ? u.galerie.label : u.lagerort?.label) ?? "";
}

function matchesSearch(u: Unikat, term: string): boolean {
  if (!term) return true;
  const hay = [u.name, u.inv, u.typ, u.status, u.gedreht?.label, u.glasiert?.label, u.lagerort?.label, u.galerie?.label, u.notiz, u.masse, ...u.glasur.map((g) => g.label)].join(" ").toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .every((t) => hay.includes(t));
}

function compare(a: Unikat, b: Unikat, key: SortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name, "de");
    case "nummer":
      return a.nummer - b.nummer;
    case "preis":
      return (b.preis ?? -1) - (a.preis ?? -1);
    case "lagerort":
      return (ortVon(a) || "~").localeCompare(ortVon(b) || "~", "de");
    default:
      return b.erfasstAm.localeCompare(a.erfasstAm);
  }
}

type EditForm = {
  name: string;
  typ: string;
  gedrehtId: string;
  glasiertId: string;
  datum: string;
  gedrehtAm: string;
  glasiertAm: string;
  glasurIds: string[];
  masse: string;
  bildnachweis: string;
  preis: string;
  website: boolean;
  verkauftAm: string;
  verkauftAn: string;
  notiz: string;
  ort: string;
  brennart: string;
  glasurrezept: string;
};

function UnikatDetail({
  u,
  onClose,
  onSaved,
  stamm,
  typen,
  statusListe,
  kunden,
}: {
  u: Unikat;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  stamm: Stamm;
  typen: Opt[];
  statusListe: Opt[];
  kunden: string[];
}) {
  const lagerorte = activeOptions(stamm.lagerorte, link(u.lagerort?.id));
  const galerien = activeOptions(stamm.partner, link(u.galerie?.id));
  const personen = activeOptions(stamm.kuenstler, [u.gedreht?.id, u.glasiert?.id].filter((id): id is string => !!id));
  const glasuren = activeOptions(
    stamm.glasuren,
    u.glasur.map((g) => g.id),
  );
  const initial: EditForm = {
    name: u.name,
    typ: u.typ,
    gedrehtId: u.gedreht?.id ?? "",
    glasiertId: u.glasiert?.id ?? "",
    datum: u.datum.slice(0, 10),
    gedrehtAm: u.gedrehtAm.slice(0, 10),
    glasiertAm: u.glasiertAm.slice(0, 10),
    glasurIds: u.glasur.map((g) => g.id),
    masse: u.masse,
    bildnachweis: u.bildnachweis,
    preis: u.preis !== null ? String(u.preis) : "",
    website: u.website,
    verkauftAm: u.verkauftAm.slice(0, 10),
    verkauftAn: u.verkauftAn,
    notiz: u.notiz,
    ort: u.ort,
    brennart: u.brennart,
    glasurrezept: u.glasurrezept,
  };
  const [editing, setEditing] = useState(false);
  const [einzelDaten, setEinzelDaten] = useState(false);
  const [werkOffen, setWerkOffen] = useState(false);
  const [form, setForm] = useState<EditForm>(initial);
  const [formError, setFormError] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [photoIndex, setPhotoIndex] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState<{ text: string; fields: Record<string, unknown> } | null>(null);
  const { uploadAsync } = useUpload();
  const update = useRecordUpdate({ from: ds.unikate, fields: unikatUpdateFields });
  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [undo]);
  const set = <K extends keyof EditForm>(k: K, v: EditForm[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
    setFormError((e) => ({ ...e, [k]: undefined }));
  };
  const photo = u.fotos[Math.min(photoIndex, u.fotos.length - 1)];

  async function quickSave(fields: Record<string, unknown>, message: string, undoFields?: Record<string, unknown>) {
    setBusy(true);
    try {
      await update.mutateAsync({ recordId: u.id, fields } as never);
      await onSaved();
      toast.success(message);
      setUndo(undoFields ? { text: message, fields: undoFields } : null);
    } catch {
      toast.error("Speichern hat nicht geklappt. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  // Das erste Foto ist das Hauptbild. Umsortieren ändert nur die Reihenfolge, kein Foto geht verloren.
  function makeMainPhoto(index: number) {
    const fotos = [u.fotos[index], ...u.fotos.filter((_, i) => i !== index)].map((a) => ({ id: a.id, url: a.url, filename: a.filename }));
    setPhotoIndex(0);
    quickSave({ fotos }, "Hauptbild geändert");
  }

  // Dieselben Regeln laufen zusätzlich als Softr-Workflow auf der Datenbank. Hier sorgen sie für sofortige Anzeige und „Rückgängig“.
  function changeStatus(status: string) {
    if (status === u.status || busy) return;
    const fields: Record<string, unknown> = { status, verkauftAm: status === VERKAUFT ? today() : null };
    const ausserHausOrt = lagerorte.find((l) => l.label === AUSSER_HAUS_ORT)?.id;
    if (!isAusserHaus(status)) {
      Object.assign(fields, { galerie: [], seit: null, rueckgabe: null });
      if (isAusserHaus(u.status)) fields.lagerort = [];
    } else if (!isAusserHaus(u.status)) {
      fields.seit = today();
      if (ausserHausOrt) fields.lagerort = [ausserHausOrt];
    }
    const before = {
      status: u.status,
      lagerort: link(u.lagerort?.id),
      verkauftAm: u.verkauftAm ? u.verkauftAm.slice(0, 10) : null,
      galerie: link(u.galerie?.id),
      seit: u.seit ? u.seit.slice(0, 10) : null,
      rueckgabe: u.rueckgabe ? u.rueckgabe.slice(0, 10) : null,
    };
    quickSave(fields, `Status: ${status}`, before);
  }

  async function saveAll() {
    const preis = parseNumber(form.preis);
    const errors: Partial<Record<keyof EditForm, string>> = {};
    if (!form.name.trim()) errors.name = "Bitte einen Namen eingeben.";
    if (form.preis.trim() && (preis === null || preis < 0)) errors.preis = "Bitte einen Betrag in Euro eingeben, z. B. 1.200.";
    setFormError(errors);
    if (Object.keys(errors).length) return;
    // Leer gelassenes Datum gilt als Tag der Erfassung. Ältere Stücke ohne Datum behalten ihr Jahr.
    const datum = form.datum || (u.datum ? u.erfasstAm.slice(0, 10) : "");
    setBusy(true);
    try {
      let fotos: { id?: string; url: string; filename?: string }[] | undefined;
      if (newFiles.length) {
        const results = await uploadAsync(newFiles);
        if (results.some((r) => r.status !== "completed")) throw new Error("Foto konnte nicht hochgeladen werden.");
        // Neue Fotos hinten anhängen: Das erste Foto ist das Hauptbild und bleibt es.
        fotos = [...u.fotos.map((a) => ({ id: a.id, url: a.url, filename: a.filename })), ...results.map((r) => ({ url: r.url as string, filename: r.file.name }))];
      }
      await update.mutateAsync({
        recordId: u.id,
        fields: {
          name: form.name.trim(),
          typ: form.typ,
          gedreht: link(form.gedrehtId),
          glasiert: link(form.glasiertId),
          datum: datum || null,
          jahr: datum ? Number(datum.slice(0, 4)) : u.jahr,
          gedrehtAm: form.gedrehtAm || null,
          glasiertAm: form.glasiertAm || null,
          glasur: form.glasurIds,
          masse: form.masse.trim(),
          bildnachweis: form.bildnachweis.trim(),
          preis,
          website: form.website,
          verkauftAm: form.verkauftAm || null,
          verkauftAn: form.verkauftAn.trim(),
          notiz: form.notiz.trim(),
          ort: form.ort.trim(),
          brennart: form.brennart.trim(),
          glasurrezept: form.glasurrezept.trim(),
          ...(fotos ? { fotos } : {}),
        },
      } as never);
      await onSaved();
      setNewFiles([]);
      setEditing(false);
      toast.success("Änderungen gespeichert.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  }

  const facts: [string, string][] = [
    ["Preis intern", u.preis !== null ? euro.format(u.preis) : ""],
    ["Datum", datumText(u)],
    ["Gedreht von", [u.gedreht?.label, u.gedrehtAm && `am ${formatDate(u.gedrehtAm)}`].filter(Boolean).join(" ")],
    ["Glasiert von", [u.glasiert?.label, u.glasiertAm && `am ${formatDate(u.glasiertAm)}`].filter(Boolean).join(" ")],
    ["Glasur", u.glasur.map((g) => g.label).join(", ")],
    ["Maße", u.masse],
    ["Außer Haus seit", formatDate(u.seit)],
    ["Auf Website zeigen", u.website ? "ja" : "nein"],
    ["Verkauft", [u.verkauftAn && `an ${u.verkauftAn}`, u.verkauftAm && `am ${formatDate(u.verkauftAm)}`].filter(Boolean).join(" ")],
    ["Bildnachweis", u.bildnachweis],
    ["Erfasst", [formatDate(u.erfasstAm), u.erfasstVon].filter(Boolean).join(", von ")],
    // Werkangaben bleiben im Hintergrund: nur sichtbar, wenn sie ausgefüllt sind.
    ...([
      ["Ort", u.ort],
      ["Brennart", u.brennart],
    ] as [string, string][]).filter(([, v]) => v),
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-3xl`}>
        <PanelHeader title={u.name || "Ohne Namen"} description={[u.inv, u.typ, u.preis !== null ? euro.format(u.preis) : ""].filter(Boolean).join(" · ")} />
        <div className="pb-2 space-y-6" lang="de">
          {!update.enabled && <StatusBadge text={u.status} />}
          {update.enabled && !editing && (
            <section className="space-y-4" aria-labelledby="schnell-titel">
              <h3 id="schnell-titel" className="text-base font-semibold">
                Schnell ändern <span className="font-normal text-muted-foreground">· wird sofort gespeichert</span>
              </h3>
              <div>
                <FieldLabel>Status</FieldLabel>
                <ChoiceChips label="Status" options={statusListe} value={u.status} onChange={changeStatus} statusColors disabled={busy} />
              </div>
              <div>
                <FieldLabel htmlFor="d-lagerort">Lagerort</FieldLabel>
                <OptionSelect
                  id="d-lagerort"
                  value={u.lagerort?.id ?? ""}
                  disabled={busy}
                  onChange={(v) => quickSave({ lagerort: link(v) }, `Lagerort: ${lagerorte.find((l) => l.id === v)?.label ?? "keiner"}`, { lagerort: link(u.lagerort?.id) })}
                  options={lagerorte}
                  placeholder="Kein Lagerort"
                />
                {!u.lagerort && !isAusserHaus(u.status) && u.status !== VERKAUFT && <p className="text-sm text-amber-800 mt-1.5">Bitte Lagerort wählen.</p>}
              </div>
              {isAusserHaus(u.status) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel htmlFor="d-galerie">Partner (Galerie, Museum …)</FieldLabel>
                    <OptionSelect
                      id="d-galerie"
                      value={u.galerie?.id ?? ""}
                      disabled={busy}
                      onChange={(v) => quickSave({ galerie: link(v) }, `Partner: ${galerien.find((g) => g.id === v)?.label ?? "keiner"}`, { galerie: link(u.galerie?.id) })}
                      options={galerien}
                      placeholder="Partner wählen"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="d-rueckgabe">Rückgabe bis</FieldLabel>
                    <Feld
                      id="d-rueckgabe"
                      type="date"
                      disabled={busy}
                      defaultValue={u.rueckgabe.slice(0, 10)}
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v === u.rueckgabe.slice(0, 10)) return;
                        quickSave({ rueckgabe: v || null }, `Rückgabe bis: ${v ? formatDate(v) : "offen"}`, { rueckgabe: u.rueckgabe ? u.rueckgabe.slice(0, 10) : null });
                      }}
                    />
                  </div>
                </div>
              )}
              {busy && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Wird gespeichert …
                </p>
              )}
              {undo && !busy && (
                <div role="status" className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2 pl-3">
                  <span className="text-sm">{undo.text} gespeichert</span>
                  <Knopf
                    variant="outline"
                    className="h-11 text-base"
                    onClick={() => {
                      const fields = undo.fields;
                      setUndo(null);
                      quickSave(fields, "Rückgängig gemacht");
                    }}
                  >
                    Rückgängig
                  </Knopf>
                </div>
              )}
            </section>
          )}

          {!editing && (
            <>
              {photo ? (
                <div className="space-y-2">
                  <img src={thumb(photo, "large")} alt={u.name} className="w-full max-h-64 object-contain rounded-lg bg-muted" />
                  {u.fotos.length > 1 &&
                    (photoIndex === 0 ? (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" aria-hidden /> Hauptbild, erscheint in Listen und Kacheln
                      </p>
                    ) : (
                      <Knopf variant="ghost" className="h-11 px-2 text-base" disabled={busy || !update.enabled} onClick={() => makeMainPhoto(photoIndex)}>
                        <Star className="w-5 h-5 mr-1.5" aria-hidden /> Als Hauptbild verwenden
                      </Knopf>
                    ))}
                  {u.fotos.length > 1 && (
                    <div className={`flex gap-2 ${WISCHEN}`}>
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
                <div className="h-24 rounded-lg bg-muted flex items-center justify-center gap-2 text-muted-foreground">
                  <ImageOff className="w-5 h-5" aria-hidden /> Noch kein Foto
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="text-base break-words">{value || "–"}</dd>
                  </div>
                ))}
              </dl>
              {u.notiz && (
                <div>
                  <p className="text-sm text-muted-foreground">Notiz</p>
                  <p className="text-base whitespace-pre-line">{u.notiz}</p>
                </div>
              )}
              {u.glasurrezept && (
                <div>
                  <p className="text-sm text-muted-foreground">Glasurrezept</p>
                  <p className="text-base whitespace-pre-line">{u.glasurrezept}</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {update.enabled && (
                  <Knopf onClick={() => setEditing(true)}>
                    <Pencil className="w-5 h-5 mr-2" aria-hidden /> Alle Angaben bearbeiten
                  </Knopf>
                )}
                <p className="text-sm text-muted-foreground">Löschen ist nicht vorgesehen. Verkaufte Stücke bitte auf „verkauft“ setzen.</p>
                <DoneButton />
              </div>
            </>
          )}

          {editing && (
            <section className="space-y-5" aria-label="Alle Angaben bearbeiten">
              <div>
                <FieldLabel htmlFor="d-name" required>
                  Name
                </FieldLabel>
                <Feld id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!formError.name} />
                <ErrorText>{formError.name}</ErrorText>
              </div>
              <div>
                <FieldLabel>Typ</FieldLabel>
                <ChoiceChips label="Typ" options={typen} value={form.typ} onChange={(v) => set("typ", v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-gedreht">Gedreht von</FieldLabel>
                  <OptionSelect id="d-gedreht" value={form.gedrehtId} onChange={(v) => set("gedrehtId", v)} options={personen} placeholder="Bitte wählen" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-glasiert">Glasiert von</FieldLabel>
                  <OptionSelect id="d-glasiert" value={form.glasiertId} onChange={(v) => set("glasiertId", v)} options={personen} placeholder="Bitte wählen" />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="d-datum">Datum</FieldLabel>
                <Feld id="d-datum" type="date" value={form.datum} onChange={(e) => set("datum", e.target.value)} />
                {!u.datum && u.jahr !== null && <Hint>{`Bisher nur das Jahr ${u.jahr} bekannt.`}</Hint>}
                {einzelDaten || form.gedrehtAm || form.glasiertAm ? (
                  <div className="grid sm:grid-cols-2 gap-5 mt-4">
                    <div>
                      <FieldLabel htmlFor="d-gedreht-am">Gedreht am</FieldLabel>
                      <Feld id="d-gedreht-am" type="date" value={form.gedrehtAm} onChange={(e) => set("gedrehtAm", e.target.value)} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="d-glasiert-am">Glasiert am</FieldLabel>
                      <Feld id="d-glasiert-am" type="date" value={form.glasiertAm} onChange={(e) => set("glasiertAm", e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <ZusatzKnopf label="Gedreht am und glasiert am einzeln angeben" onClick={() => setEinzelDaten(true)} />
                  </div>
                )}
              </div>
              <div>
                <FieldLabel>Glasur</FieldLabel>
                <SearchPick label="Glasuren" createNoun="Glasur" options={glasuren} value={form.glasurIds} onChange={(ids) => set("glasurIds", ids)} multiple />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-masse">Maße</FieldLabel>
                  <Feld id="d-masse" value={form.masse} onChange={(e) => set("masse", e.target.value)} placeholder="z. B. Ø 24 × H 8 cm" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-bildnachweis">Bildnachweis</FieldLabel>
                  <Feld id="d-bildnachweis" value={form.bildnachweis} onChange={(e) => set("bildnachweis", e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-preis">Preis intern (€)</FieldLabel>
                  <Feld id="d-preis" inputMode="decimal" value={form.preis} onChange={(e) => set("preis", e.target.value)} placeholder="z. B. 480" aria-invalid={!!formError.preis} />
                  <ErrorText>{formError.preis}</ErrorText>
                </div>
                <SchalterFeld id="d-website" label="Auf Website zeigen" checked={form.website} onChange={(v) => set("website", v)} lage="self-end" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-verkauft-an">Verkauft an</FieldLabel>
                  <TextMitVorschlag id="d-verkauft-an" value={form.verkauftAn} onChange={(v) => set("verkauftAn", v)} vorschlaege={kunden} placeholder="Name der Käuferin oder des Käufers" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-verkauft">Verkauft am</FieldLabel>
                  <Feld id="d-verkauft" type="date" value={form.verkauftAm} onChange={(e) => set("verkauftAm", e.target.value)} />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="d-notiz">Notiz</FieldLabel>
                <Textfeld id="d-notiz" rows={3} value={form.notiz} onChange={(e) => set("notiz", e.target.value)} />
              </div>
              {werkOffen || form.ort || form.brennart || form.glasurrezept ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel htmlFor="d-ort">Ort</FieldLabel>
                      <Feld id="d-ort" value={form.ort} onChange={(e) => set("ort", e.target.value)} placeholder="z. B. Essen" />
                    </div>
                    <div>
                      <FieldLabel htmlFor="d-brennart">Brennart</FieldLabel>
                      <Feld id="d-brennart" value={form.brennart} onChange={(e) => set("brennart", e.target.value)} placeholder="z. B. Holzbrand, reduzierend" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel htmlFor="d-glasurrezept">Glasurrezept</FieldLabel>
                    <Textfeld id="d-glasurrezept" rows={2} value={form.glasurrezept} onChange={(e) => set("glasurrezept", e.target.value)} />
                  </div>
                </>
              ) : (
                <ZusatzKnopf label="Werkangaben: Ort, Brennart, Glasurrezept" onClick={() => setWerkOffen(true)} />
              )}
              <div>
                <FieldLabel htmlFor="foto-input">Fotos hinzufügen</FieldLabel>
                <PhotoPicker files={newFiles} onChange={setNewFiles} multiple />
              </div>
              <div className="flex gap-3">
                <Knopf
                  variant="outline"
                  className="h-12 flex-1 text-base"
                  disabled={busy}
                  onClick={() => {
                    setForm(initial);
                    setEinzelDaten(false);
                    setFormError({});
                    setNewFiles([]);
                    setEditing(false);
                  }}
                >
                  Abbrechen
                </Knopf>
                <Knopf className="h-12 flex-1 text-base" disabled={busy} onClick={saveAll}>
                  {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : <Check className="w-5 h-5 mr-2" aria-hidden />}
                  Speichern
                </Knopf>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Kachel: Hauptbild groß, darunter Name, Nummer, Ort und Preis. Mehrere Fotos zeigt eine kleine Zahl.
function UnikatTile({ u, onOpen }: { u: Unikat; onOpen: () => void }) {
  const main = u.fotos[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`text-left ${PANEL_CLASS} overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      <span className="relative block aspect-square bg-muted">
        {main ? (
          <img src={thumb(main, "medium")} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/60" aria-label="Kein Foto">
            <ImageOff className="w-6 h-6" aria-hidden />
          </span>
        )}
        <span className="absolute left-2 top-2">
          <StatusBadge text={u.status} />
        </span>
        {u.fotos.length > 1 && (
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium tabular-nums" aria-label={`${u.fotos.length} Fotos`}>
            <Images className="w-3.5 h-3.5" aria-hidden />
            {u.fotos.length}
          </span>
        )}
      </span>
      <span className="block p-3 space-y-0.5">
        <span className="block font-medium leading-snug line-clamp-2 hyphens-auto">{u.name || "Ohne Namen"}</span>
        <span className="block text-sm text-muted-foreground truncate">{[u.inv, ortVon(u)].filter(Boolean).join(" · ")}</span>
        {u.preis !== null && <span className="block text-sm tabular-nums">{euro.format(u.preis)}</span>}
      </span>
    </button>
  );
}

type InventurChange = { e: Posten; gezaehlt: number };
const INVENTUR_KEY = "kwm-inventur";

function loadCounts(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(INVENTUR_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// Inventur: gezählte Menge je Posten eintippen, Abweichungen sehen und gesammelt übernehmen.
// Die Zahlen bleiben auf dem Gerät gespeichert, bis sie übernommen sind (Neuladen oder Unterbrechung schadet nicht).
function InventurView({ rows, onApply, onClose }: { rows: Posten[]; onApply: (changes: InventurChange[]) => Promise<string[]>; onClose: () => void }) {
  const [counts, setCounts] = useState<Record<string, string>>(loadCounts);
  const [ort, setOrt] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      window.localStorage.setItem(INVENTUR_KEY, JSON.stringify(counts));
    } catch {
      // Ohne Speicher gelten die Zahlen bis zum Neuladen.
    }
  }, [counts]);

  const orte = [...new Set(rows.map((e) => e.lagerort?.label ?? "Ohne Lagerort"))].sort((a, b) => (a === "Ohne Lagerort" ? 1 : b === "Ohne Lagerort" ? -1 : a.localeCompare(b, "de")));
  const shown = rows.filter((e) => !ort || (e.lagerort?.label ?? "Ohne Lagerort") === ort);
  const groups = orte.filter((o) => !ort || o === ort).map((o) => ({ ort: o, rows: shown.filter((e) => (e.lagerort?.label ?? "Ohne Lagerort") === o) }));
  const gezaehlt = rows.filter((e) => counts[e.id] !== undefined && counts[e.id] !== "");
  const changes: InventurChange[] = gezaehlt.map((e) => ({ e, gezaehlt: Number(counts[e.id]) })).filter((c) => c.gezaehlt !== c.e.anzahl);

  async function apply() {
    setBusy(true);
    const offen = await onApply(changes);
    setCounts((c) => Object.fromEntries(Object.entries(c).filter(([id]) => offen.includes(id))));
    setBusy(false);
    setConfirm(false);
  }

  return (
    <div className="space-y-4">
      <div className={`${PANEL_CLASS} p-4 flex flex-wrap items-center gap-3`}>
        <div className="flex-1 min-w-48">
          <p className="font-medium">Inventur</p>
          <p className="text-sm text-muted-foreground">Gezählte Menge eintippen. Übernommen wird erst am Ende, gesammelt.</p>
        </div>
        <Auswahl aria-label="Lagerort" value={ort} onChange={(ev) => setOrt(ev.target.value)} breite="w-auto min-w-48">
          <option value="">Alle Lagerorte</option>
          {orte.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Auswahl>
        <Knopf variant="outline" className="h-12 text-base" onClick={onClose}>
          Inventur beenden
        </Knopf>
      </div>

      {groups.map((g) => (
        <section key={g.ort} className={`${PANEL_CLASS} px-4`}>
          <h2 className="py-3 font-semibold border-b">{g.ort}</h2>
          <ul className="divide-y">
            {g.rows.map((e) => {
              const value = counts[e.id] ?? "";
              const delta = value === "" ? null : Number(value) - e.anzahl;
              return (
                <li key={e.id} className="flex items-center gap-3 py-2">
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium truncate">{e.modell}</span>
                    <span className="block text-sm text-muted-foreground">{[e.zustand, postenText(e), e.reserviert && `für ${e.reserviert}`].filter((t, i, all) => t && all.indexOf(t) === i).join(" · ")}</span>
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">Soll {zahl.format(e.anzahl)}</span>
                  <Feld
                    inputMode="numeric"
                    aria-label={`${e.modell} ${postenText(e)}: gezählt`}
                    placeholder="–"
                    value={value}
                    onChange={(ev) => setCounts((c) => ({ ...c, [e.id]: ev.target.value.replace(/\D/g, "").slice(0, 5) }))}
                    className="h-11 w-20 text-center text-base md:text-base"
                  />
                  <span className={`w-12 text-right text-sm font-medium tabular-nums ${delta === null ? "" : delta === 0 ? "text-emerald-700" : "text-amber-800"}`}>
                    {delta === null ? "" : delta === 0 ? <Check className="inline w-4 h-4" aria-label="stimmt" /> : delta > 0 ? `+${delta}` : `−${-delta}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className={`sticky ${STICKY_BOTTOM} z-10`}>
        <div className={`${PANEL_CLASS} shadow-md p-3 flex flex-wrap items-center gap-3`}>
          <span className="flex-1 text-base">
            {zahl.format(gezaehlt.length)} gezählt · <strong>{zahl.format(changes.length)}</strong> {changes.length === 1 ? "Abweichung" : "Abweichungen"}
          </span>
          <Knopf className="h-12 text-base" disabled={changes.length === 0 || busy} onClick={() => setConfirm(true)}>
            Abweichungen übernehmen
          </Knopf>
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={(o) => !busy && setConfirm(o)}>
        <DialogContent className={`${DIALOG_CLASS} max-w-lg`}>
          <PanelHeader title={`${changes.length} ${changes.length === 1 ? "Änderung" : "Änderungen"} übernehmen`} description="Der Bestand wird auf die gezählten Mengen gesetzt." />
          <ul className="divide-y text-base">
            {changes.map((c) => (
              <li key={c.e.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 truncate">{[c.e.modell, postenText(c.e)].join(" · ")}</span>
                <span className="tabular-nums whitespace-nowrap">
                  {zahl.format(c.e.anzahl)} → <strong>{zahl.format(c.gezaehlt)}</strong>
                </span>
              </li>
            ))}
          </ul>
          <div className="pt-2 space-y-2">
            <Knopf className="w-full h-12 text-base" disabled={busy} onClick={apply}>
              {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
              Jetzt übernehmen
            </Knopf>
            <DoneButton />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type MengenArt = "reservieren" | "freigeben" | "ausstellen" | "zurueck" | "ausbuchen";
type Schritt = { art: "liste" } | { art: "brand"; glasurId: string; glasur: string; brand: string } | { art: "wahl" | "weiter" | "korrigieren" | MengenArt; p: Posten };
type UmbuchenFn = (p: Posten, auftrag: { entnommen: number; ausschuss: number; ziel: PostenKey | null; glasur: string; lagerortId: string; meldung: string }) => Promise<boolean>;
type KorrigierenFn = (p: Posten, fields: { anzahl: number; lagerort: string[]; notiz: string; masse: string }) => Promise<boolean>;
type Auswahlen = { modellGlasuren: Opt[]; glasuren: Opt[]; lagerorte: Opt[]; personen: Opt[]; partner: Opt[]; kunden: string[]; braende: string[]; onGlasurNeu: (name: string) => Promise<string | null> };

// Antwort auf „Wie viele kann ich zusammen verkaufen?“: je Glasur die freie Ware im Haus, aufgeteilt nach Brand.
// Nur Stücke aus einem Brand haben denselben Farbton. Einen Brand antippen reserviert direkt daraus.
// Darunter, wie viel geschrühte Ware zum Nachglasieren bereitliegt.
function ZusammenVerkaufbar({ posten, onReservieren, onNachglasieren }: { posten: Posten[]; onReservieren?: (g: BrandGruppe, brand: string) => void; onNachglasieren?: (p: Posten) => void }) {
  const gruppen = brandGruppen(posten);
  const geschrueht = posten.filter((p) => p.zustand === GESCHRUEHT && !p.reserviert && !ausserHaus(p) && p.anzahl > 0).sort((a, b) => b.anzahl - a.anzahl);
  const geschruehtSumme = geschrueht.reduce((n, p) => n + p.anzahl, 0);
  if (!gruppen.length && !geschruehtSumme) return null;
  return (
    <section className={`${PANEL_CLASS} p-3 space-y-3`}>
      <div>
        <h3 className="font-semibold">Zusammen verkaufbar</h3>
        <p className="text-sm text-muted-foreground">{`Frei, im Haus und aus einem Brand, also im selben Farbton.${onReservieren ? " Brand antippen zum Reservieren." : ""}`}</p>
      </div>
      {gruppen.map((g) => (
        <div key={g.glasurId || "ohne"}>
          <p className="font-medium">
            {g.glasur || "Ohne Glasur"} <span className="font-normal text-muted-foreground">{g.braende.length > 1 ? `· ${g.gesamt} frei, bis zu ${g.zusammen} zusammen` : `· ${g.gesamt} frei`}</span>
          </p>
          <ul className="divide-y">
            {g.braende.map((b) => (
              <li key={b.brand || "unbekannt"}>
                <ListRow title={brandName(b.brand)} meta={<span className="text-lg font-semibold tabular-nums">{zahl.format(b.anzahl)}</span>} onClick={onReservieren ? () => onReservieren(g, b.brand) : undefined} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {geschruehtSumme > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted p-3">
          <p className="text-base">
            Zum Nachglasieren: <strong>{zahl.format(geschruehtSumme)} geschrüht</strong>
          </p>
          {onNachglasieren && (
            <Knopf variant="outline" className="h-11 text-base" onClick={() => onNachglasieren(geschrueht[0])}>
              Glasieren
            </Knopf>
          )}
        </div>
      )}
    </section>
  );
}

// Reservieren direkt aus einem Brand: zieht die Stück aus den freien Posten dieser Glasur und dieses Brands.
function BrandReservieren({ posten, glasurId, glasur, brand, auswahl, onUmbuchen, onFertig, onZurueck }: { posten: Posten[]; glasurId: string; glasur: string; brand: string; auswahl: Auswahlen; onUmbuchen: UmbuchenFn; onFertig: () => void; onZurueck: () => void }) {
  const quelle = posten.filter((p) => verkaufbar(p) && p.glasurId === glasurId && p.brand === brand).sort((a, b) => b.anzahl - a.anzahl);
  const frei = quelle.reduce((n, p) => n + p.anzahl, 0);
  const [anzahl, setAnzahl] = useState(frei);
  const [fuer, setFuer] = useState("");
  const [fehler, setFehler] = useState("");
  const [busy, setBusy] = useState(false);

  async function speichern() {
    if (!fuer.trim()) {
      setFehler("Bitte angeben, für wen reserviert wird.");
      return;
    }
    setBusy(true);
    let rest = anzahl;
    for (const p of quelle) {
      if (rest <= 0) break;
      const n = Math.min(rest, p.anzahl);
      const ok = await onUmbuchen(p, { entnommen: n, ausschuss: 0, ziel: { ...keyVon(p), reserviert: fuer.trim() }, glasur: p.glasur, lagerortId: p.lagerort?.id ?? "", meldung: "" });
      if (!ok) {
        setBusy(false);
        return;
      }
      rest -= n;
    }
    toast.success(`${anzahl} Stück ${glasur} (${brandName(brand)}) für ${fuer.trim()} reserviert.`);
    setBusy(false);
    onFertig();
  }

  if (frei === 0) {
    return (
      <div className="pb-2 space-y-3">
        <EmptyState text="Aus diesem Brand ist nichts mehr frei." />
        <SchrittKnoepfe text="Zurück zur Liste" busy={false} onSpeichern={onFertig} onZurueck={onZurueck} />
      </div>
    );
  }
  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="b-anzahl">Anzahl</FieldLabel>
        <Stueckzahl id="b-anzahl" value={anzahl} min={1} max={frei} onChange={setAnzahl} />
        <Hint>{`Frei aus diesem Brand: ${frei} Stück.`}</Hint>
      </div>
      <div>
        <FieldLabel htmlFor="b-fuer" required>
          Reserviert für
        </FieldLabel>
        <TextMitVorschlag
          id="b-fuer"
          value={fuer}
          onChange={(v) => {
            setFuer(v);
            setFehler("");
          }}
          vorschlaege={auswahl.kunden}
          placeholder="z. B. Café Lindenhof oder Auftrag 2026-14"
        />
        <ErrorText>{fehler}</ErrorText>
      </div>
      <SchrittKnoepfe text={`${anzahl} Stück reservieren`} busy={busy} onSpeichern={speichern} onZurueck={onZurueck} />
    </div>
  );
}

// Ein Modell mit allen Posten (Zustand, Glasur, Brand, Reservierung). Ein Posten antippen, dann eine Sache wählen:
// weiterbrennen, reservieren, ausbuchen oder korrigieren. Jede Sache ist ein eigener, kurzer Schritt.
function ModellFenster({
  stand,
  canEdit,
  auswahl,
  onClose,
  onUmbuchen,
  onKorrigieren,
}: {
  stand: ModellStand;
  canEdit: boolean;
  auswahl: Auswahlen;
  onClose: () => void;
  onUmbuchen: UmbuchenFn;
  onKorrigieren: KorrigierenFn;
}) {
  const [schritt, setSchritt] = useState<Schritt>({ art: "liste" });
  // Nach dem Neuladen den Posten mit aktueller Anzahl zeigen. Gibt es ihn nicht mehr, zurück zur Liste.
  const aktuell = "p" in schritt ? stand.posten.find((p) => p.id === schritt.p.id) : undefined;
  const zurListe = () => setSchritt({ art: "liste" });
  const zustaende = ZUSTAENDE.filter((z) => stand.posten.some((p) => p.zustand === z));
  const andere = stand.posten.filter((p) => !ZUSTAENDE.includes(p.zustand));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-lg`}>
        <PanelHeader
          title={stand.modell}
          description={
            schritt.art === "brand"
              ? `${schritt.glasur || "Ohne Glasur"} · ${brandName(schritt.brand)}`
              : schritt.art === "liste" || !aktuell
              ? [stand.serie, stand.typ, standText(stand.je)].filter(Boolean).join(" · ")
              : [postenText(aktuell), `${aktuell.anzahl} Stück`, aktuell.reserviert && `für ${aktuell.reserviert}`, statusText(aktuell)].filter(Boolean).join(" · ")
          }
        />
        {schritt.art === "brand" ? (
          <BrandReservieren posten={stand.posten} glasurId={schritt.glasurId} glasur={schritt.glasur} brand={schritt.brand} auswahl={auswahl} onUmbuchen={onUmbuchen} onFertig={zurListe} onZurueck={zurListe} />
        ) : schritt.art === "liste" || !aktuell ? (
          <div className="pb-2 space-y-5">
            {stand.fotos[0] && <img src={thumb(stand.fotos[0], "large")} alt={stand.modell} className="w-full max-h-56 object-contain rounded-lg bg-muted" />}
            <ZusammenVerkaufbar
              posten={stand.posten}
              onReservieren={canEdit ? (g, brand) => setSchritt({ art: "brand", glasurId: g.glasurId, glasur: g.glasur, brand }) : undefined}
              onNachglasieren={canEdit ? (p) => setSchritt({ art: "weiter", p }) : undefined}
            />
            {[
              ...zustaende.map((z) => ({ titel: z, posten: stand.posten.filter((p) => p.zustand === z) })),
              ...(andere.length ? [{ titel: "Ohne Zustand", posten: andere }] : []),
            ].map((g) => (
              <section key={g.titel}>
                <h3 className="font-semibold capitalize">
                  {g.titel} · {zahl.format(g.posten.reduce((n, p) => n + p.anzahl, 0))} Stück
                </h3>
                <ul className="divide-y">
                  {g.posten.map((p) => (
                    <li key={p.id}>
                      <ListRow
                        title={p.glasur || p.lagerort?.label || "Ohne Lagerort"}
                        sub={[
                          p.zustand === GLASIERT && brandName(p.brand),
                          p.reserviert && `reserviert für ${p.reserviert}`,
                          statusText(p),
                          p.glasur && (p.lagerort?.label ?? "Kein Lagerort"),
                          p.masse,
                          p.gedreht && `gedreht von ${p.gedreht}`,
                          p.glasiert && `glasiert von ${p.glasiert}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        meta={<span className="text-lg font-semibold tabular-nums">{zahl.format(p.anzahl)}</span>}
                        onClick={canEdit ? () => setSchritt({ art: "wahl", p }) : undefined}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {canEdit && <Hint>Eine Zeile antippen, um zu glasieren, zu reservieren oder auszubuchen.</Hint>}
            <DoneButton />
          </div>
        ) : schritt.art === "wahl" ? (
          <div className="pb-2 space-y-3">
            {schrittName(aktuell.zustand) && (
              <AktionKnopf
                haupt
                titel={schrittName(aktuell.zustand)}
                text={aktuell.zustand === GESCHRUEHT ? "Stücke aus dem Lager nehmen und als glasiert eintragen, mit Glasur und Brand." : "Nach dem Schrühbrand als geschrüht eintragen."}
                onClick={() => setSchritt({ art: "weiter", p: aktuell })}
              />
            )}
            {aktuell.reserviert ? (
              <AktionKnopf titel="Reservierung aufheben" text={`Wieder frei verfügbar machen (jetzt für ${aktuell.reserviert}).`} onClick={() => setSchritt({ art: "freigeben", p: aktuell })} />
            ) : (
              <AktionKnopf titel="Reservieren" text="Für einen Kunden oder Auftrag zurücklegen." onClick={() => setSchritt({ art: "reservieren", p: aktuell })} />
            )}
            {ausserHaus(aktuell) ? (
              <AktionKnopf titel="Zurückholen" text={`Wieder in der Werkstatt (jetzt ${statusText(aktuell)}).`} onClick={() => setSchritt({ art: "zurueck", p: aktuell })} />
            ) : (
              aktuell.zustand === GLASIERT && <AktionKnopf titel="Ausstellen" text="In eine Ausstellung oder in Kommission geben." onClick={() => setSchritt({ art: "ausstellen", p: aktuell })} />
            )}
            <AktionKnopf titel="Ausbuchen" text="Verkauft, abgegeben oder zerbrochen: Stücke aus dem Bestand nehmen." onClick={() => setSchritt({ art: "ausbuchen", p: aktuell })} />
            <AktionKnopf titel="Korrigieren" text="Anzahl, Lagerort, Maße oder Notiz berichtigen, z. B. nach dem Zählen." onClick={() => setSchritt({ art: "korrigieren", p: aktuell })} />
            <Knopf variant="ghost" className="w-full h-12 text-base" onClick={zurListe}>
              Zurück
            </Knopf>
          </div>
        ) : schritt.art === "weiter" ? (
          <WeiterSchritt key={aktuell.id} p={aktuell} auswahl={auswahl} onUmbuchen={onUmbuchen} onFertig={zurListe} onZurueck={() => setSchritt({ art: "wahl", p: aktuell })} />
        ) : schritt.art === "korrigieren" ? (
          <KorrigierenSchritt key={aktuell.id} p={aktuell} lagerorte={auswahl.lagerorte} onKorrigieren={onKorrigieren} onFertig={zurListe} onZurueck={() => setSchritt({ art: "wahl", p: aktuell })} />
        ) : (
          <MengenSchritt key={`${schritt.art}-${aktuell.id}`} art={schritt.art} p={aktuell} auswahl={auswahl} onUmbuchen={onUmbuchen} onFertig={zurListe} onZurueck={() => setSchritt({ art: "wahl", p: aktuell })} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SchrittKnoepfe({ text, busy, disabled, onSpeichern, onZurueck }: { text: string; busy: boolean; disabled?: boolean; onSpeichern: () => void; onZurueck: () => void }) {
  return (
    <div className="pt-2 space-y-2">
      <Knopf className="w-full h-12 text-base" disabled={busy || disabled} onClick={onSpeichern}>
        {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
        {text}
      </Knopf>
      <Knopf variant="ghost" className="w-full h-12 text-base" disabled={busy} onClick={onZurueck}>
        Zurück
      </Knopf>
    </div>
  );
}

// Schrühen bzw. Glasieren: Stück vom Posten nehmen, Ausschuss abziehen, den Rest im nächsten Zustand eintragen.
function WeiterSchritt({ p, auswahl, onUmbuchen, onFertig, onZurueck }: { p: Posten; auswahl: Auswahlen; onUmbuchen: UmbuchenFn; onFertig: () => void; onZurueck: () => void }) {
  const ziel = naechsterZustand(p.zustand);
  const glasieren = ziel === GLASIERT;
  const [entnommen, setEntnommen] = useState(Math.min(1, p.anzahl));
  const [ausschuss, setAusschuss] = useState(0);
  const { modellGlasuren, glasuren, lagerorte, personen, kunden } = auswahl;
  const [glasurId, setGlasurId] = useState(modellGlasuren.length === 1 ? modellGlasuren[0].id : "");
  const [brand, setBrand] = useState(today());
  const [anderesDatum, setAnderesDatum] = useState(false);
  const [mehr, setMehr] = useState(!!p.reserviert);
  const [glasiertId, setGlasiertId] = useState("");
  const [fuer, setFuer] = useState(p.reserviert);
  const [lagerortId, setLagerortId] = useState(p.lagerort?.id ?? "");
  const [fehler, setFehler] = useState("");
  const [busy, setBusy] = useState(false);
  const gut = Math.max(0, entnommen - ausschuss);
  const glasur = glasuren.find((g) => g.id === glasurId)?.label ?? "";
  // Brand als Knöpfe: heute oder einer der letzten Brände. Ein vertipptes Datum ergäbe sonst einen Scheinbrand.
  const ANDERES = "Anderes Datum";
  const brandKnoepfe = [{ id: today(), label: "Heute" }, ...auswahl.braende.map((b) => ({ id: b, label: formatDate(b) })), { id: ANDERES, label: ANDERES }];
  const brandWert = anderesDatum ? ANDERES : (brandKnoepfe.find((k) => k.id === brand)?.label ?? ANDERES);

  async function speichern() {
    if (glasieren && !glasurId) {
      setFehler("Bitte die Glasur wählen.");
      return;
    }
    setBusy(true);
    const ok = await onUmbuchen(p, {
      entnommen,
      ausschuss,
      ziel: { ...keyVon(p), zustand: ziel, glasurId: glasieren ? glasurId : "", brand: glasieren ? brand : "", reserviert: fuer.trim(), glasiertId: glasieren ? glasiertId : "" },
      glasur,
      lagerortId,
      meldung: `${p.modell}: ${gut} Stück ${ziel}${glasur ? ` (${glasur})` : ""}${ausschuss ? `, ${ausschuss} Ausschuss` : ""}.`,
    });
    setBusy(false);
    if (ok) onFertig();
  }

  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="w-entnommen">Aus dem Lager genommen</FieldLabel>
        <Stueckzahl
          id="w-entnommen"
          value={entnommen}
          min={1}
          max={p.anzahl}
          onChange={(n) => {
            setEntnommen(n);
            setAusschuss((a) => Math.min(a, n));
          }}
        />
        <Hint>{`Vorhanden: ${p.anzahl} Stück ${p.zustand}.`}</Hint>
      </div>
      <div>
        <FieldLabel htmlFor="w-ausschuss">Davon Ausschuss</FieldLabel>
        <Stueckzahl id="w-ausschuss" value={ausschuss} max={entnommen} onChange={setAusschuss} />
        <Hint>Stücke, die nicht gut genug sind. Sie werden nicht eingetragen.</Hint>
      </div>
      {glasieren && (
        <>
          <div>
            <FieldLabel required>Glasur</FieldLabel>
            <GlasurWahl
              modell={modellGlasuren}
              alle={glasuren}
              value={glasurId}
              onChange={(id) => {
                setGlasurId(id);
                setFehler("");
              }}
              onCreate={auswahl.onGlasurNeu}
            />
            <ErrorText>{fehler}</ErrorText>
          </div>
          <div>
            <FieldLabel>Brand vom</FieldLabel>
            <ChoiceChips
              label="Brand vom"
              options={brandKnoepfe}
              value={brandWert}
              onChange={(label) => {
                const k = brandKnoepfe.find((x) => x.label === label);
                setAnderesDatum(label === ANDERES);
                if (k && label !== ANDERES) setBrand(k.id);
              }}
            />
            {anderesDatum && (
              <div className="mt-3">
                <Feld id="w-brand" type="date" aria-label="Datum des Brands" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
            )}
            <Hint>Stücke aus einem Brand haben denselben Farbton und stehen zusammen.</Hint>
          </div>
        </>
      )}
      {mehr ? (
        <>
          {glasieren && (
            <div>
              <FieldLabel htmlFor="w-glasiert">Glasiert von</FieldLabel>
              <OptionSelect id="w-glasiert" value={glasiertId} onChange={setGlasiertId} options={personen} placeholder="Freiwillig" />
            </div>
          )}
          <div>
            <FieldLabel htmlFor="w-fuer">Reserviert für</FieldLabel>
            <TextMitVorschlag id="w-fuer" value={fuer} onChange={setFuer} vorschlaege={kunden} placeholder="Kunde oder Auftrag (freiwillig)" />
          </div>
          <div>
            <FieldLabel htmlFor="w-lagerort">Lagerort</FieldLabel>
            <OptionSelect id="w-lagerort" value={lagerortId} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
          </div>
        </>
      ) : (
        <ZusatzKnopf label={glasieren ? "Mehr: glasiert von, reserviert, Lagerort" : "Mehr: reserviert, Lagerort"} onClick={() => setMehr(true)} />
      )}
      <p className="rounded-md bg-muted p-3 text-base">
        Danach: {p.zustand} <strong>{p.anzahl - entnommen}</strong> · {ziel}
        {glasur ? ` ${glasur}` : ""} <strong>+{gut}</strong>
        {ausschuss ? ` · ${ausschuss} Ausschuss` : ""}
      </p>
      <SchrittKnoepfe text={`${gut} Stück als ${ziel} eintragen`} busy={busy} disabled={entnommen < 1} onSpeichern={speichern} onZurueck={onZurueck} />
    </div>
  );
}

// Reservieren, Reservierung aufheben oder Ausbuchen: nur eine Anzahl (und beim Reservieren für wen).
function MengenSchritt({ art, p, auswahl, onUmbuchen, onFertig, onZurueck }: { art: MengenArt; p: Posten; auswahl: Auswahlen; onUmbuchen: UmbuchenFn; onFertig: () => void; onZurueck: () => void }) {
  const [anzahl, setAnzahl] = useState(art === "ausbuchen" && !p.reserviert ? Math.min(1, p.anzahl) : p.anzahl);
  const [fuer, setFuer] = useState("");
  const [status, setStatus] = useState(AUSGESTELLT);
  const [partnerId, setPartnerId] = useState("");
  const [rueckgabe, setRueckgabe] = useState("");
  const [fehler, setFehler] = useState("");
  const [busy, setBusy] = useState(false);
  const partner = auswahl.partner.find((x) => x.id === partnerId)?.label ?? "";
  // Wie bei Unikaten: Ausgestellte Ware steht auf „Außer Haus“, zurückgeholte bekommt ihren Platz beim Einräumen.
  const ausserHausOrt = auswahl.lagerorte.find((l) => l.label === AUSSER_HAUS_ORT)?.id ?? "";
  const lagerortNachher = art === "ausstellen" ? ausserHausOrt : art === "zurueck" && p.lagerort?.id === ausserHausOrt ? "" : (p.lagerort?.id ?? "");
  const text = {
    reservieren: `${anzahl} Stück reservieren`,
    freigeben: `${anzahl} Stück freigeben`,
    ausstellen: `${anzahl} Stück ${status === KOMMISSION ? "in Kommission geben" : "ausstellen"}`,
    zurueck: `${anzahl} Stück zurückholen`,
    ausbuchen: `${anzahl} Stück ausbuchen`,
  }[art];
  const ziele: Record<MengenArt, PostenKey | null> = {
    reservieren: { ...keyVon(p), reserviert: fuer.trim() },
    freigeben: { ...keyVon(p), reserviert: "" },
    ausstellen: { ...keyVon(p), status, partnerId, rueckgabe },
    zurueck: { ...keyVon(p), status: "", partnerId: "", rueckgabe: "" },
    ausbuchen: null,
  };
  const erledigt = {
    reservieren: `für ${fuer.trim()} reserviert`,
    freigeben: "wieder frei",
    ausstellen: statusText({ status, partner, rueckgabe }),
    zurueck: "wieder in der Werkstatt",
    ausbuchen: "ausgebucht",
  }[art];

  async function speichern() {
    if (art === "reservieren" && !fuer.trim()) {
      setFehler("Bitte angeben, für wen reserviert wird.");
      return;
    }
    setBusy(true);
    const ok = await onUmbuchen(p, {
      entnommen: anzahl,
      ausschuss: 0,
      ziel: ziele[art],
      glasur: p.glasur,
      lagerortId: lagerortNachher,
      meldung: `${p.modell} · ${postenText(p)}: ${anzahl} Stück ${erledigt}.`,
    });
    setBusy(false);
    if (ok) onFertig();
  }

  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="m-anzahl">Anzahl</FieldLabel>
        <Stueckzahl id="m-anzahl" value={anzahl} min={1} max={p.anzahl} onChange={setAnzahl} />
        <Hint>{art === "ausbuchen" ? "Verkauft, abgegeben oder zerbrochen. Die Stücke verlassen den Bestand." : `Vorhanden: ${p.anzahl} Stück.`}</Hint>
      </div>
      {art === "reservieren" && (
        <div>
          <FieldLabel htmlFor="m-fuer" required>
            Reserviert für
          </FieldLabel>
          <TextMitVorschlag
            id="m-fuer"
            value={fuer}
            onChange={(v) => {
              setFuer(v);
              setFehler("");
            }}
            vorschlaege={auswahl.kunden}
            placeholder="z. B. Café Lindenhof oder Auftrag 2026-14"
          />
          <ErrorText>{fehler}</ErrorText>
        </div>
      )}
      {art === "ausstellen" && (
        <>
          <div>
            <FieldLabel>Wohin</FieldLabel>
            <ChoiceChips label="Wohin" options={AUSSER_STATUS} value={status} onChange={setStatus} statusColors />
          </div>
          <div>
            <FieldLabel htmlFor="m-partner">Partner (Galerie, Museum …)</FieldLabel>
            <OptionSelect id="m-partner" value={partnerId} onChange={setPartnerId} options={auswahl.partner} placeholder="Freiwillig" />
          </div>
          <div>
            <FieldLabel htmlFor="m-rueckgabe">Rückgabe bis</FieldLabel>
            <Feld id="m-rueckgabe" type="date" value={rueckgabe} onChange={(e) => setRueckgabe(e.target.value)} />
            <Hint>Freiwillig. Die Übersicht erinnert rechtzeitig an die Rückgabe.</Hint>
          </div>
        </>
      )}
      <SchrittKnoepfe text={text} busy={busy} onSpeichern={speichern} onZurueck={onZurueck} />
    </div>
  );
}

function KorrigierenSchritt({ p, lagerorte, onKorrigieren, onFertig, onZurueck }: { p: Posten; lagerorte: Opt[]; onKorrigieren: KorrigierenFn; onFertig: () => void; onZurueck: () => void }) {
  const [anzahl, setAnzahl] = useState(p.anzahl);
  const [lagerortId, setLagerortId] = useState(p.lagerort?.id ?? "");
  const [notiz, setNotiz] = useState(p.notiz);
  const [masse, setMasse] = useState(p.masse);
  const [busy, setBusy] = useState(false);
  return (
    <div className="pb-2 space-y-5">
      <div>
        <FieldLabel htmlFor="k-anzahl">Anzahl</FieldLabel>
        <Stueckzahl id="k-anzahl" value={anzahl} onChange={setAnzahl} />
      </div>
      <div>
        <FieldLabel htmlFor="k-masse">Maße</FieldLabel>
        <Feld id="k-masse" value={masse} onChange={(e) => setMasse(e.target.value)} placeholder="z. B. Ø 24 × H 3 cm" />
      </div>
      <div>
        <FieldLabel htmlFor="k-lagerort">Lagerort</FieldLabel>
        <OptionSelect id="k-lagerort" value={lagerortId} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
      </div>
      <div>
        <FieldLabel htmlFor="k-notiz">Notiz</FieldLabel>
        <Textfeld id="k-notiz" rows={3} value={notiz} onChange={(e) => setNotiz(e.target.value)} />
      </div>
      <SchrittKnoepfe
        text="Änderungen speichern"
        busy={busy}
        onSpeichern={async () => {
          setBusy(true);
          const ok = await onKorrigieren(p, { anzahl, lagerort: link(lagerortId), notiz: notiz.trim(), masse: masse.trim() });
          setBusy(false);
          if (ok) onFertig();
        }}
        onZurueck={onZurueck}
      />
    </div>
  );
}

export default function Block() {
  const [art, setArt] = useState<Art>(initialArt);
  const [tab, setTab] = useState<TabKey>(() => {
    const t = initialParam("tab");
    return TABS.some((x) => x.key === t) ? (t as TabKey) : "imhaus";
  });
  const [search, setSearch] = useState(() => initialParam("q"));
  const [sort, setSort] = useState<SortKey>("neu");
  const [typFilter, setTypFilter] = useState<string[]>(() => (initialParam("typ") ? [initialParam("typ")] : []));
  const [selectedId, setSelectedId] = useState(() => initialParam("id"));
  const [modellKey, setModellKey] = useState("");
  const [mengenFilter, setMengenFilter] = useState<MengenFilter>("alle");
  const [inventur, setInventur] = useState(false);
  const [ansicht, setAnsicht] = useAnsicht();
  const [limit, setLimit] = useState(LIST_STEP);

  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const kuenstlerQuery = useRecords({ from: ds.kuenstler, select: kuenstlerSelect, count: PAGE_SIZE });
  const glasurQuery = useRecords({ from: ds.glasuren, select: glasurSelect, count: PAGE_SIZE });
  const lagerortQuery = useRecords({ from: ds.lagerorte, select: lagerortSelect, count: PAGE_SIZE });
  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  const modellQuery = useRecords({ from: ds.modelle, select: modellSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  useAllPages(kuenstlerQuery);
  useAllPages(glasurQuery);
  useAllPages(lagerortQuery);
  useAllPages(partnerQuery);
  useAllPages(modellQuery);

  const editionUpdate = useRecordUpdate({ from: ds.edition, fields: editionUpdateFields });
  const editionCreate = useRecordCreate({ from: ds.edition, fields: editionCreateFields });
  const editionDelete = useRecordDelete({ from: ds.edition });
  const glasurCreate = useRecordCreate({ from: ds.glasuren, fields: glasurNeu });
  const typen = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "typ" }).options as Opt[];
  const statusListe = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "status" }).options as Opt[];
  const stamm: Stamm = { lagerorte: lagerortQuery.data, partner: partnerQuery.data, kuenstler: kuenstlerQuery.data, glasuren: glasurQuery.data };

  const unikate = useMemo(() => (unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toUnikat(i as RawItem)), [unikateQuery.data]);
  const posten = useMemo(() => (editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toPosten(i as RawItem)), [editionQuery.data]);
  // Frühere Kunden und Aufträge als Vorschläge, damit derselbe Name gleich geschrieben wird.
  // Die letzten Brände (außer heute) als Knöpfe beim Glasieren.
  const letzteBraende = useMemo(
    () =>
      [...new Set<string>(posten.map((p) => p.brand).filter((b) => b && b !== today()))]
        .sort()
        .reverse()
        .slice(0, LETZTE_BRAENDE),
    [posten],
  );
  const kunden = useMemo(
    () => [...new Set([...posten.map((p) => p.reserviert), ...unikate.map((u) => u.verkauftAn.trim())].filter(Boolean))].sort((a, b) => a.localeCompare(b, "de")),
    [posten, unikate],
  );

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const term = search.trim();
  const visible = useMemo(
    () => unikate.filter((u) => (activeTab.match ? activeTab.match(u) : true) && (!typFilter.length || typFilter.includes(u.typ)) && matchesSearch(u, term)).sort((a, b) => compare(a, b, sort)),
    [unikate, activeTab, typFilter, term, sort],
  );
  const tabs = useMemo(() => TABS.map((t) => ({ key: t.key, label: t.label, count: unikate.filter((u) => (t.match ? t.match(u) : true)).length })), [unikate]);

  const isMenge = art !== "unikat";
  const serie = art === "edition" ? EDITION_PROGRAMM : GESCHIRR;
  const postenSerie = posten.filter((p) => p.serie === serie);
  const staende = nachModell(postenSerie);
  const imTyp = staende.filter((s) => !typFilter.length || typFilter.includes(s.typ));
  const mengenChips = MENGEN_FILTER.filter((f) => !NUR_WENN_VORHANDEN.includes(f.key) || imTyp.some(f.match)).map((f) => ({ key: f.key, label: f.label, count: imTyp.filter(f.match).length }));
  const activeMenge = MENGEN_FILTER.find((f) => f.key === mengenFilter) ?? MENGEN_FILTER[0];
  const visibleStaende = imTyp
    .filter(activeMenge.match)
    .filter((s) => !term || [s.modell, s.typ, ...s.posten.flatMap((p) => [p.glasur, p.reserviert, p.partner, p.lagerort?.label])].join(" ").toLowerCase().includes(term.toLowerCase()));
  const typenMenge = [...new Set(staende.map((s) => s.typ).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const glasurenJeModell = useMemo(
    () => new Map(((modellQuery.data?.pages.flatMap((p) => p.items) ?? []) as RawItem[]).map((m) => [m.id, asOpts(m.fields.glasuren)] as [string, Opt[]])),
    [modellQuery.data],
  );

  const selected = unikate.find((u) => u.id === selectedId);
  const offenesModell = staende.find((s) => (s.modellId || s.modell) === modellKey);
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const stueckGesamt = visibleStaende.reduce((n, s) => n + Object.values(s.je).reduce((a, b) => a + b, 0), 0);
  const filtered = !!(search || typFilter.length);
  const canEdit = editionUpdate.enabled && editionCreate.enabled && editionDelete.enabled;

  // Umbuchen immer auf dem frisch geladenen Stand. Erst das Ziel schreiben, dann die Quelle verringern:
  // Bricht es dazwischen ab, fehlt kein Stück, es ist höchstens doppelt gezählt und fällt beim Zählen auf.
  async function umbuchen(p: Posten, a: { entnommen: number; ausschuss: number; ziel: PostenKey | null; glasur: string; lagerortId: string; meldung: string }): Promise<boolean> {
    try {
      const fresh = await freshItems(editionQuery);
      if (!fresh) {
        toast.error("Der Bestand konnte nicht geladen werden. Bitte erneut versuchen.");
        return false;
      }
      const plan = planeUmbuchung(fresh.map(toPosten), p.id, a.entnommen, a.ausschuss, a.ziel, a.lagerortId);
      if (typeof plan === "string") {
        toast.error(plan);
        return false;
      }
      if (plan.ziel && "neu" in plan.ziel) {
        const n = plan.ziel.neu;
        await editionCreate.mutateAsync({
          bezeichnung: bezeichnung(p.modell, { zustand: n.zustand, glasur: a.glasur, brand: n.brand, reserviert: n.reserviert, status: n.status, rueckgabe: n.rueckgabe, partner: activeOptions(stamm.partner, [n.partnerId]).find((x) => x.id === n.partnerId)?.label ?? "" }),
          modell: link(n.modellId),
          glasur: link(n.glasurId || undefined),
          zustand: n.zustand,
          anzahl: n.anzahl,
          lagerort: link(n.lagerortId || undefined),
          brand: n.brand || null,
          reserviert: n.reserviert,
          status: n.status || null,
          partner: link(n.partnerId || undefined),
          rueckgabe: n.rueckgabe || null,
          gedreht: link(n.gedrehtId || undefined),
          glasiert: link(n.glasiertId || undefined),
          masse: n.masse,
        } as never);
      } else if (plan.ziel) {
        await editionUpdate.mutateAsync({ recordId: plan.ziel.id, fields: { anzahl: plan.ziel.anzahl } } as never);
      }
      if ("loeschen" in plan.quelle) await editionDelete.mutateAsync(plan.quelle.id);
      else await editionUpdate.mutateAsync({ recordId: plan.quelle.id, fields: { anzahl: plan.quelle.anzahl } } as never);
      if (a.meldung) toast.success(a.meldung);
      return true;
    } catch {
      toast.error("Speichern hat nicht geklappt. Bitte den Bestand dieses Modells prüfen.");
      return false;
    } finally {
      await editionQuery.refetch();
    }
  }

  // Neue Glasur direkt beim Glasieren anlegen. Gibt es den Namen schon, wird die vorhandene genommen.
  async function neueGlasur(name: string): Promise<string | null> {
    const vorhanden = activeOptions(stamm.glasuren).find((g) => g.label.toLowerCase() === name.toLowerCase());
    if (vorhanden) return vorhanden.id;
    try {
      const created = await glasurCreate.mutateAsync({ name } as never);
      await glasurQuery.refetch();
      toast.success(`Glasur „${name}“ angelegt.`);
      return (created as { id: string }).id;
    } catch {
      toast.error("Glasur konnte nicht angelegt werden.");
      return null;
    }
  }

  // Inventur übernehmen: nur Posten, deren Anzahl sich seit dem Zählen nicht geändert hat. Die anderen bleiben offen.
  async function applyInventur(changes: InventurChange[]): Promise<string[]> {
    const fresh = await freshItems(editionQuery);
    if (!fresh) {
      toast.error("Der Bestand konnte nicht geladen werden. Bitte erneut übernehmen.");
      return changes.map((c) => c.e.id);
    }
    const offen: string[] = [];
    let ok = 0;
    for (const c of changes) {
      const row = fresh.find((i) => i.id === c.e.id);
      if (!row || (num(row.fields.anzahl) ?? 0) !== c.e.anzahl) {
        offen.push(c.e.id);
        continue;
      }
      try {
        await editionUpdate.mutateAsync({ recordId: c.e.id, fields: { anzahl: c.gezaehlt } } as never);
        ok++;
      } catch {
        offen.push(c.e.id);
      }
    }
    await editionQuery.refetch();
    if (ok) toast.success(`${ok} Posten übernommen.`);
    if (offen.length) toast.error(`${offen.length} ${offen.length === 1 ? "Posten wurde" : "Posten wurden"} inzwischen geändert oder nicht gespeichert. Bitte dort neu zählen.`);
    return offen;
  }

  async function korrigieren(p: Posten, fields: { anzahl: number; lagerort: string[]; notiz: string; masse: string }): Promise<boolean> {
    try {
      // Hat jemand die Anzahl geändert, seit das Fenster offen ist, nicht überschreiben, sondern melden.
      const fresh = await freshItems(editionQuery);
      const row = fresh?.find((i) => i.id === p.id);
      if (!row) {
        toast.error("Diesen Posten gibt es nicht mehr.");
        return false;
      }
      const aktuell = num(row.fields.anzahl) ?? 0;
      const anzahlGeaendert = fields.anzahl !== p.anzahl;
      if (anzahlGeaendert && aktuell !== p.anzahl) {
        toast.error(`Die Anzahl wurde inzwischen geändert (jetzt ${aktuell}). Bitte prüfen und erneut speichern.`);
        return false;
      }
      await editionUpdate.mutateAsync({ recordId: p.id, fields: { ...fields, anzahl: anzahlGeaendert ? fields.anzahl : aktuell } } as never);
      toast.success("Änderungen gespeichert.");
      return true;
    } catch {
      toast.error("Speichern hat nicht geklappt.");
      return false;
    } finally {
      await editionQuery.refetch();
    }
  }

  const searchPlaceholder = isMenge ? "Nummer, Modell, Kunde" : "Name, Nummer, Glasur, Ort";
  const inventurButton =
    isMenge && !inventur && editionUpdate.enabled ? (
      <Knopf variant="outline" className="h-12 text-base" onClick={() => setInventur(true)}>
        <ClipboardList className="w-5 h-5 mr-2" aria-hidden /> Inventur
      </Knopf>
    ) : undefined;

  return (
    <div className={SEITE_CLASS}>
      <div className="content space-y-4" lang="de">
        <PageHeader
          title="Bestand"
          description={isMenge ? `${zahl.format(stueckGesamt)} Stück in ${zahl.format(visibleStaende.length)} ${visibleStaende.length === 1 ? "Modell" : "Modellen"}` : `${zahl.format(visible.length)} von ${zahl.format(unikate.length)} Meisterstücken`}
          // Handy und Desktop gleich: Ansichtsumschalter bzw. Inventur im Kopf, Filter hinter dem Filterknopf.
          aside={isMenge ? inventurButton : <AnsichtToggle value={ansicht} onChange={setAnsicht} />}
        />

        <Tabs
          label="Serie"
          tabs={[
            { key: "geschirr" as Art, label: GESCHIRR, count: nachModell(posten.filter((p) => p.serie === GESCHIRR)).length },
            { key: "edition" as Art, label: EDITION_PROGRAMM, count: nachModell(posten.filter((p) => p.serie === EDITION_PROGRAMM)).length },
            { key: "unikat" as Art, label: "Meisterstücke", count: unikate.length },
          ]}
          value={art}
          onChange={(key) => {
            setArt(key);
            setSearch("");
            setTypFilter([]);
            setLimit(LIST_STEP);
            setInventur(false);
          }}
        />

        {isMenge ? (
          <FilterChips label="Zustand" options={mengenChips} value={mengenFilter} onChange={setMengenFilter} />
        ) : (
          <FilterChips
            label="Status"
            options={tabs}
            value={tab}
            onChange={(key) => {
              setTab(key);
              setLimit(LIST_STEP);
            }}
          />
        )}

        {/* Suche und Filter wie in der Tabelle: Knöpfe mit aufklappender Auswahl, am Handy als Wischzeile unter der Suche. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField label="Suche" placeholder={searchPlaceholder} value={search} onChange={setSearch} />
          <div className={`${SCROLL_ROW} sm:flex-nowrap`}>
            <Schnellfilter label="Typ" options={isMenge ? typenMenge : typen.map((t) => t.label)} value={typFilter} onChange={setTypFilter} />
            {!isMenge && <EinzelWahl label="Sortierung" options={SORTS} value={sort} onChange={setSort} />}
          </div>
        </div>

        {failed ? (
          <ErrorState text="Der Bestand konnte nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Bestand wird geladen …" />
        ) : isMenge && inventur ? (
          <InventurView rows={postenSerie} onApply={applyInventur} onClose={() => setInventur(false)} />
        ) : isMenge ? (
          visibleStaende.length === 0 ? (
            <EmptyState text={term || typFilter.length || mengenFilter !== "alle" ? "Nichts gefunden. Suche oder Filter ändern." : `Noch kein ${serie} im Lager. Neue Ware unter „Erfassen“ eintragen.`} />
          ) : (
            <ul className={`${PANEL_CLASS} px-3 divide-y`}>
              {visibleStaende.map((s) => (
                <li key={s.modellId || s.modell}>
                  <ListRow
                    fotos={s.fotos}
                    title={s.modell}
                    sub={
                      <>
                        {standText(s.je)}
                        {glasurZeile(s.posten) && <span className="block">{glasurZeile(s.posten)}</span>}
                      </>
                    }
                    meta={s.reserviert > 0 ? <span className="text-sm text-amber-900">{zahl.format(s.reserviert)} reserviert</span> : undefined}
                    onClick={() => setModellKey(s.modellId || s.modell)}
                  />
                </li>
              ))}
            </ul>
          )
        ) : visible.length === 0 ? (
          <div className="space-y-3 text-center">
            <EmptyState text={filtered ? "Keine Stücke zu Suche und Filter." : "Hier ist zurzeit kein Stück."} />
            {filtered && (
              <Knopf
                variant="outline"
                className="h-11 text-base"
                onClick={() => {
                  setSearch("");
                  setTypFilter([]);
                }}
              >
                Suche und Filter zurücksetzen
              </Knopf>
            )}
          </div>
        ) : (
          <>
            {ansicht === "kacheln" ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visible.slice(0, limit).map((u) => (
                  <li key={u.id} className="grid">
                    <UnikatTile u={u} onOpen={() => setSelectedId(u.id)} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={`${PANEL_CLASS} px-3 divide-y`}>
                {visible.slice(0, limit).map((u) => (
                  <li key={u.id}>
                    <ListRow
                      fotos={u.fotos}
                      title={u.name || "Ohne Namen"}
                      sub={[u.inv, ortVon(u) || "Kein Lagerort"].filter(Boolean).join(" · ")}
                      meta={
                        <span className="flex flex-col items-end gap-1">
                          <StatusBadge text={u.status} />
                          {u.preis !== null && <span className="text-sm tabular-nums">{euro.format(u.preis)}</span>}
                        </span>
                      }
                      onClick={() => setSelectedId(u.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
            {visible.length > limit && (
              <div className="flex justify-center">
                <Knopf variant="outline" className="h-12 text-base" onClick={() => setLimit((l) => l + LIST_STEP)}>
                  Weitere {Math.min(LIST_STEP, visible.length - limit)} anzeigen
                </Knopf>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <UnikatDetail key={selected.id} u={selected} onClose={() => setSelectedId("")} onSaved={() => unikateQuery.refetch()} stamm={stamm} typen={typen} statusListe={statusListe} kunden={kunden} />
      )}
      {offenesModell && (
        <ModellFenster
          key={modellKey}
          stand={offenesModell}
          canEdit={canEdit}
          auswahl={{
            modellGlasuren: glasurenJeModell.get(offenesModell.modellId) ?? [],
            glasuren: activeOptions(stamm.glasuren),
            lagerorte: activeOptions(stamm.lagerorte),
            personen: activeOptions(stamm.kuenstler),
            partner: activeOptions(stamm.partner),
            kunden,
            braende: letzteBraende,
            onGlasurNeu: neueGlasur,
          }}
          onClose={() => setModellKey("")}
          onUmbuchen={umbuchen}
          onKorrigieren={korrigieren}
        />
      )}
    </div>
  );
}

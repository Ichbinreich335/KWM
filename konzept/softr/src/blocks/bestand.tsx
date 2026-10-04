import { useEffect, useMemo, useState } from "react";
import { datasource, q, useFieldOptions, useRecordUpdate, useRecords, useUpload } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, ClipboardList, ImageOff, Images, Loader2, Minus, Pencil, Plus, Star, Table2 } from "lucide-react";
import { toast } from "sonner";
import { AUSSER_HAUS_ORT, EDITION_PROGRAMM, MANUFAKTUR_PROGRAMM, PAGE_SIZE, RESERVIERT, ROHLING, VERFUEGBAR, VERKAUFT, isAusserHaus } from "../shared/konstanten";
import {
  type Attachment,
  type Opt,
  type RawItem,
  activeOptions,
  asAttachments,
  asOpts,
  compareNr,
  downloadCsv,
  euro,
  formatDate,
  freshItems,
  printTable,
  link,
  lookupValue,
  modellLabel,
  num,
  parseNumber,
  str,
  thumb,
  today,
  useAllPages,
  zahl,
} from "../shared/daten";
import {
  AnsichtToggle,
  ChoiceChips,
  DIALOG_CLASS,
  DoneButton,
  EmptyState,
  ErrorState,
  ErrorText,
  ExportMenu,
  FIELD_CLASS,
  FieldLabel,
  FilterChips,
  INPUT_CLASS,
  ListRow,
  LoadingState,
  OptionSelect,
  PANEL_CLASS,
  PageHeader,
  PanelHeader,
  PhotoPicker,
  SearchField,
  SearchPick,
  StatusBadge,
  TEXTAREA_CLASS,
  Tabs,
  useAnsicht,
} from "../shared/ui";

const ds = datasource.define({ unikate: "unikate", edition: "edition", kuenstler: "kuenstler", glasuren: "glasuren", lagerorte: "lagerorte", partner: "partner" });
const kuenstlerSelect = q.select({ name: "vqD0c", archiviert: "TOhYe" });
const glasurSelect = q.select({ name: "OuhBi", archiviert: "jxxXN" });
const lagerortSelect = q.select({ name: "AoOjs", archiviert: "kMBsy" });
const partnerSelect = q.select({ name: "a4yfc", archiviert: "24Tn9" });

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
  verkauftAm: "48BXo",
  seit: "Evxm2",
  rueckgabe: "ENQkk",
});
const unikatUpdateFields = q.select({
  name: "7IBVW",
  typ: "7g9jI",
  status: "SEUyZ",
  kuenstler: "oDNBh",
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
  seit: "Evxm2",
  rueckgabe: "ENQkk",
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
});
const editionUpdateFields = q.select({ anzahl: "Ciiwp", lagerort: "T5iQe", notiz: "lyJky" });

const LIST_STEP = 50;
const LOW_STOCK = 5;
const UNDO_MS = 10000;

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
  seit: string;
  rueckgabe: string;
};

type Edition = {
  id: string;
  nr: string;
  programm: string;
  modell: string;
  typ: string;
  glasur: string;
  zustand: string;
  anzahl: number;
  lagerort: Opt | undefined;
  fotos: Attachment[];
  notiz: string;
};

type Art = "unikat" | "edition";
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

type ZustandKey = "alle" | "rohling" | "glasiert";
const ZUSTAND_FILTER: { key: ZustandKey; label: string; match?: (e: Edition) => boolean }[] = [
  { key: "alle", label: "Alle" },
  { key: "rohling", label: "Rohlinge", match: (e) => e.zustand === ROHLING },
  { key: "glasiert", label: "Glasiert", match: (e) => e.zustand !== ROHLING },
];
type ProgrammKey = "" | typeof EDITION_PROGRAMM | typeof MANUFAKTUR_PROGRAMM;

function initialParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
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
    seit: str(f.seit),
    rueckgabe: str(f.rueckgabe),
  };
}

function toEdition(item: RawItem): Edition {
  const f = item.fields;
  return {
    id: item.id,
    nr: str(lookupValue(f.artikelnr)),
    programm: asOpts(f.programm)[0]?.label ?? "",
    modell: modellLabel(str(lookupValue(f.artikelnr)), asOpts(f.modell)[0]?.label ?? ""),
    typ: asOpts(f.typ)[0]?.label ?? "",
    glasur: asOpts(f.glasur)[0]?.label ?? "",
    zustand: asOpts(f.zustand)[0]?.label ?? "",
    anzahl: num(f.anzahl) ?? 0,
    lagerort: asOpts(f.lagerort)[0],
    fotos: asAttachments(f.foto),
    notiz: str(f.notiz),
  };
}

function ortVon(u: Unikat): string {
  return (isAusserHaus(u.status) && u.galerie ? u.galerie.label : u.lagerort?.label) ?? "";
}

function matchesSearch(u: Unikat, term: string): boolean {
  if (!term) return true;
  const hay = [u.name, u.inv, u.typ, u.status, u.kuenstler?.label, u.lagerort?.label, u.galerie?.label, u.notiz, u.masse, ...u.glasur.map((g) => g.label)].join(" ").toLowerCase();
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

function exportUnikate(list: Unikat[]) {
  downloadCsv(
    `unikate-${today()}.csv`,
    ["Inventarnummer", "Name", "Typ", "Status", "Künstler:in", "Jahr", "Glasur", "Maße", "Lagerort", "Partner", "Preis intern (€)", "Auf Website zeigen", "Notiz", "Erfasst am", "Verkauft am"],
    list.map((u) => [
      u.inv,
      u.name,
      u.typ,
      u.status,
      u.kuenstler?.label ?? "",
      u.jahr === null ? "" : String(u.jahr),
      u.glasur.map((g) => g.label).join(", "),
      u.masse,
      u.lagerort?.label ?? "",
      u.galerie?.label ?? "",
      u.preis === null ? "" : String(u.preis),
      u.website ? "ja" : "nein",
      u.notiz,
      formatDate(u.erfasstAm),
      formatDate(u.verkauftAm),
    ]),
  );
}

function printUnikate(list: Unikat[], untertitel: string): boolean {
  return printTable({
    title: "Unikate",
    subtitle: untertitel,
    columns: [{ label: "Inv.-Nr." }, { label: "Name" }, { label: "Typ" }, { label: "Status" }, { label: "Künstler:in" }, { label: "Ort / Partner" }, { label: "Preis", align: "right" }],
    rows: list.map((u) => [u.inv, u.name, u.typ, u.status, u.kuenstler?.label ?? "", ortVon(u), u.preis === null ? "" : euro.format(u.preis)]),
  });
}

function printEdition(list: Edition[], untertitel: string): boolean {
  return printTable({
    title: "Editionsware",
    subtitle: untertitel,
    columns: [{ label: "Modell" }, { label: "Zustand" }, { label: "Glasur" }, { label: "Lagerort" }, { label: "Anzahl", align: "right" }],
    rows: list.map((e) => [e.modell, e.zustand, e.glasur, e.lagerort?.label ?? "", zahl.format(e.anzahl)]),
    footer: ["Summe", "", "", "", zahl.format(list.reduce((n, e) => n + e.anzahl, 0))],
  });
}

function exportEdition(list: Edition[]) {
  downloadCsv(
    `editionsbestand-${today()}.csv`,
    ["Artikelnr.", "Modell", "Programm", "Typ", "Zustand", "Glasur", "Anzahl", "Lagerort", "Notiz"],
    list.map((e) => [e.nr, e.modell, e.programm, e.typ, e.zustand, e.glasur, String(e.anzahl), e.lagerort?.label ?? "", e.notiz]),
  );
}

type EditForm = {
  name: string;
  typ: string;
  kuenstlerId: string;
  jahr: string;
  glasurIds: string[];
  masse: string;
  bildnachweis: string;
  preis: string;
  website: boolean;
  verkauftAm: string;
  notiz: string;
};

function UnikatDetail({ u, onClose, onSaved, stamm, typen, statusListe }: { u: Unikat; onClose: () => void; onSaved: () => Promise<unknown>; stamm: Stamm; typen: Opt[]; statusListe: Opt[] }) {
  const lagerorte = activeOptions(stamm.lagerorte, link(u.lagerort?.id));
  const galerien = activeOptions(stamm.partner, link(u.galerie?.id));
  const kuenstler = activeOptions(stamm.kuenstler, link(u.kuenstler?.id));
  const glasuren = activeOptions(
    stamm.glasuren,
    u.glasur.map((g) => g.id),
  );
  const initial: EditForm = {
    name: u.name,
    typ: u.typ,
    kuenstlerId: u.kuenstler?.id ?? "",
    jahr: u.jahr !== null ? String(u.jahr) : "",
    glasurIds: u.glasur.map((g) => g.id),
    masse: u.masse,
    bildnachweis: u.bildnachweis,
    preis: u.preis !== null ? String(u.preis) : "",
    website: u.website,
    verkauftAm: u.verkauftAm.slice(0, 10),
    notiz: u.notiz,
  };
  const [editing, setEditing] = useState(false);
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
          kuenstler: link(form.kuenstlerId),
          jahr: parseNumber(form.jahr),
          glasur: form.glasurIds,
          masse: form.masse.trim(),
          bildnachweis: form.bildnachweis.trim(),
          preis,
          website: form.website,
          verkauftAm: form.verkauftAm || null,
          notiz: form.notiz.trim(),
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
    ["Künstler:in", u.kuenstler?.label ?? ""],
    ["Jahr", u.jahr !== null ? String(u.jahr) : ""],
    ["Glasur", u.glasur.map((g) => g.label).join(", ")],
    ["Maße", u.masse],
    ["Außer Haus seit", formatDate(u.seit)],
    ["Auf Website zeigen", u.website ? "ja" : "nein"],
    ["Verkauft am", formatDate(u.verkauftAm)],
    ["Bildnachweis", u.bildnachweis],
    ["Erfasst", [formatDate(u.erfasstAm), u.erfasstVon].filter(Boolean).join(", von ")],
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-3xl`}>
        <PanelHeader title={u.name || "Ohne Namen"} description={[u.inv, u.typ, u.preis !== null ? euro.format(u.preis) : ""].filter(Boolean).join(" · ")} />
        <div className="px-4 pb-8 space-y-6" lang="de">
          {!update.enabled && <StatusBadge text={u.status} />}
          {update.enabled && !editing && (
            <section className="rounded-lg border p-4 space-y-4" aria-labelledby="schnell-titel">
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
                    <Input
                      id="d-rueckgabe"
                      type="date"
                      disabled={busy}
                      defaultValue={u.rueckgabe.slice(0, 10)}
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v === u.rueckgabe.slice(0, 10)) return;
                        quickSave({ rueckgabe: v || null }, `Rückgabe bis: ${v ? formatDate(v) : "offen"}`, { rueckgabe: u.rueckgabe ? u.rueckgabe.slice(0, 10) : null });
                      }}
                      className={FIELD_CLASS}
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
                  <Button
                    variant="outline"
                    className="h-11 text-base"
                    onClick={() => {
                      const fields = undo.fields;
                      setUndo(null);
                      quickSave(fields, "Rückgängig gemacht");
                    }}
                  >
                    Rückgängig
                  </Button>
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
                      <Button variant="ghost" className="h-11 px-2 text-base" disabled={busy || !update.enabled} onClick={() => makeMainPhoto(photoIndex)}>
                        <Star className="w-5 h-5 mr-1.5" aria-hidden /> Als Hauptbild verwenden
                      </Button>
                    ))}
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
              <div className="flex flex-col gap-3">
                {update.enabled && (
                  <Button className={FIELD_CLASS} onClick={() => setEditing(true)}>
                    <Pencil className="w-5 h-5 mr-2" aria-hidden /> Alle Angaben bearbeiten
                  </Button>
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
                <Input id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)} className={FIELD_CLASS} aria-invalid={!!formError.name} />
                <ErrorText>{formError.name}</ErrorText>
              </div>
              <div>
                <FieldLabel>Typ</FieldLabel>
                <ChoiceChips label="Typ" options={typen} value={form.typ} onChange={(v) => set("typ", v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-preis">Preis intern (€)</FieldLabel>
                  <Input
                    id="d-preis"
                    inputMode="decimal"
                    value={form.preis}
                    onChange={(e) => set("preis", e.target.value)}
                    placeholder="z. B. 480"
                    className={FIELD_CLASS}
                    aria-invalid={!!formError.preis}
                  />
                  <ErrorText>{formError.preis}</ErrorText>
                </div>
                <label htmlFor="d-website" className="flex items-center justify-between gap-4 rounded-md border px-4 h-12 cursor-pointer self-end">
                  <span className="text-base font-medium">Auf Website zeigen</span>
                  <Switch id="d-website" className="scale-125 data-[state=unchecked]:bg-zinc-300" checked={form.website} onCheckedChange={(v) => set("website", v)} />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-kuenstler">Künstler:in</FieldLabel>
                  <OptionSelect id="d-kuenstler" value={form.kuenstlerId} onChange={(v) => set("kuenstlerId", v)} options={kuenstler} placeholder="Bitte wählen" />
                </div>
                <div>
                  <FieldLabel htmlFor="d-jahr">Jahr</FieldLabel>
                  <Input id="d-jahr" inputMode="numeric" value={form.jahr} onChange={(e) => set("jahr", e.target.value.replace(/\D/g, "").slice(0, 4))} className={FIELD_CLASS} />
                </div>
              </div>
              <div>
                <FieldLabel>Glasur</FieldLabel>
                <SearchPick label="Glasuren" createNoun="Glasur" options={glasuren} value={form.glasurIds} onChange={(ids) => set("glasurIds", ids)} multiple />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="d-masse">Maße</FieldLabel>
                  <Input id="d-masse" value={form.masse} onChange={(e) => set("masse", e.target.value)} placeholder="z. B. Ø 24 × H 8 cm" className={FIELD_CLASS} />
                </div>
                <div>
                  <FieldLabel htmlFor="d-verkauft">Verkauft am</FieldLabel>
                  <input id="d-verkauft" type="date" value={form.verkauftAm} onChange={(e) => set("verkauftAm", e.target.value)} className={INPUT_CLASS} />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="d-bildnachweis">Bildnachweis</FieldLabel>
                <Input id="d-bildnachweis" value={form.bildnachweis} onChange={(e) => set("bildnachweis", e.target.value)} className={FIELD_CLASS} />
              </div>
              <div>
                <FieldLabel htmlFor="d-notiz">Notiz</FieldLabel>
                <Textarea id="d-notiz" rows={3} value={form.notiz} onChange={(e) => set("notiz", e.target.value)} className={TEXTAREA_CLASS} />
              </div>
              <div>
                <FieldLabel htmlFor="foto-input">Fotos hinzufügen</FieldLabel>
                <PhotoPicker files={newFiles} onChange={setNewFiles} multiple />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-12 flex-1 text-base"
                  disabled={busy}
                  onClick={() => {
                    setForm(initial);
                    setFormError({});
                    setNewFiles([]);
                    setEditing(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button className="h-12 flex-1 text-base" disabled={busy} onClick={saveAll}>
                  {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : <Check className="w-5 h-5 mr-2" aria-hidden />}
                  Speichern
                </Button>
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
      className="text-left rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

type InventurChange = { e: Edition; gezaehlt: number };
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
function InventurView({ rows, onApply, onClose }: { rows: Edition[]; onApply: (changes: InventurChange[]) => Promise<string[]>; onClose: () => void }) {
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
        <select aria-label="Lagerort" value={ort} onChange={(ev) => setOrt(ev.target.value)} className={`${INPUT_CLASS} w-auto min-w-48`}>
          <option value="">Alle Lagerorte</option>
          {orte.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <Button variant="outline" className="h-12 text-base" onClick={onClose}>
          Inventur beenden
        </Button>
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
                    <span className="block text-sm text-muted-foreground">{[e.zustand, e.glasur].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">Soll {zahl.format(e.anzahl)}</span>
                  <Input
                    inputMode="numeric"
                    aria-label={`${e.modell} ${e.zustand} ${e.glasur}: gezählt`}
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

      <div className="sticky bottom-3 z-10">
        <div className={`${PANEL_CLASS} shadow-md p-3 flex flex-wrap items-center gap-3`}>
          <span className="flex-1 text-base">
            {zahl.format(gezaehlt.length)} gezählt · <strong>{zahl.format(changes.length)}</strong> {changes.length === 1 ? "Abweichung" : "Abweichungen"}
          </span>
          <Button className="h-12 text-base" disabled={changes.length === 0 || busy} onClick={() => setConfirm(true)}>
            Abweichungen übernehmen
          </Button>
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={(o) => !busy && setConfirm(o)}>
        <DialogContent className={`${DIALOG_CLASS} max-w-lg`}>
          <PanelHeader title={`${changes.length} ${changes.length === 1 ? "Änderung" : "Änderungen"} übernehmen`} description="Der Bestand wird auf die gezählten Mengen gesetzt." />
          <ul className="px-4 divide-y text-base">
            {changes.map((c) => (
              <li key={c.e.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 truncate">{[c.e.modell, c.e.zustand, c.e.glasur].filter(Boolean).join(" · ")}</span>
                <span className="tabular-nums whitespace-nowrap">
                  {zahl.format(c.e.anzahl)} → <strong>{zahl.format(c.gezaehlt)}</strong>
                </span>
              </li>
            ))}
          </ul>
          <div className="px-4 pb-6 pt-2 space-y-2">
            <Button className="w-full h-12 text-base" disabled={busy} onClick={apply}>
              {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
              Jetzt übernehmen
            </Button>
            <DoneButton />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditionRow({ e, busy, canEdit, onAdjust, onOpen }: { e: Edition; busy: boolean; canEdit: boolean; onAdjust: (delta: number) => void; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 min-w-0">
        <ListRow fotos={e.fotos} title={e.modell} sub={[e.zustand, e.glasur, e.lagerort?.label ?? "Kein Lagerort"].filter(Boolean).join(" · ")} onClick={onOpen} />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {canEdit && (
          <Button variant="outline" className="h-11 w-11 p-0" aria-label={`${e.modell}: eins weniger`} disabled={busy || e.anzahl <= 0} onClick={() => onAdjust(-1)}>
            <Minus className="w-5 h-5" aria-hidden />
          </Button>
        )}
        <span className={`w-12 text-center text-lg font-semibold tabular-nums ${e.anzahl < LOW_STOCK ? "text-amber-800" : ""}`} aria-label={`Anzahl ${e.anzahl}`}>
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
  canEdit,
}: {
  e: Edition;
  onClose: () => void;
  onSave: (fields: { anzahl: number; lagerort: string[]; notiz: string }) => Promise<void>;
  lagerorte: Opt[];
  canEdit: boolean;
}) {
  const [anzahl, setAnzahl] = useState(String(e.anzahl));
  const [lagerortId, setLagerortId] = useState(e.lagerort?.id ?? "");
  const [notiz, setNotiz] = useState(e.notiz);
  const [busy, setBusy] = useState(false);
  const value = Number(anzahl) || 0;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${DIALOG_CLASS} max-w-lg`}>
        <PanelHeader title={e.modell} description={[e.typ, e.zustand, e.glasur].filter(Boolean).join(" · ")} />
        <div className="px-4 pb-8 space-y-6">
          {e.fotos[0] && <img src={thumb(e.fotos[0], "large")} alt={e.modell} className="w-full max-h-72 object-contain rounded-lg bg-muted" />}
          <div>
            <FieldLabel htmlFor="ed-anzahl">Anzahl</FieldLabel>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-12 w-12" aria-label="Eins weniger" disabled={!canEdit} onClick={() => setAnzahl(String(Math.max(0, value - 1)))}>
                <Minus className="w-5 h-5" aria-hidden />
              </Button>
              <Input
                id="ed-anzahl"
                inputMode="numeric"
                disabled={!canEdit}
                value={anzahl}
                onChange={(ev) => setAnzahl(ev.target.value.replace(/\D/g, ""))}
                className="h-12 w-24 rounded-md text-center text-lg md:text-lg"
              />
              <Button variant="outline" className="h-12 w-12" aria-label="Eins mehr" disabled={!canEdit} onClick={() => setAnzahl(String(value + 1))}>
                <Plus className="w-5 h-5" aria-hidden />
              </Button>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="ed-lagerort">Lagerort</FieldLabel>
            <OptionSelect id="ed-lagerort" value={lagerortId} disabled={!canEdit} onChange={setLagerortId} options={lagerorte} placeholder="Kein Lagerort" />
          </div>
          <div>
            <FieldLabel htmlFor="ed-notiz">Notiz</FieldLabel>
            <Textarea id="ed-notiz" rows={3} disabled={!canEdit} value={notiz} onChange={(ev) => setNotiz(ev.target.value)} className={TEXTAREA_CLASS} />
          </div>
          {canEdit && (
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
          )}
          <DoneButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Block() {
  const [art, setArt] = useState<Art>(() => (initialParam("tab") === "edition" ? "edition" : "unikat"));
  const [tab, setTab] = useState<TabKey>(() => {
    const t = initialParam("tab");
    return TABS.some((x) => x.key === t) ? (t as TabKey) : "imhaus";
  });
  const [search, setSearch] = useState(() => initialParam("q"));
  const [sort, setSort] = useState<SortKey>("neu");
  const [typFilter, setTypFilter] = useState(() => initialParam("typ"));
  const [kuenstlerFilter, setKuenstlerFilter] = useState("");
  const [selectedId, setSelectedId] = useState(() => initialParam("id"));
  const [editionId, setEditionId] = useState("");
  const [zustandFilter, setZustandFilter] = useState<ZustandKey>("alle");
  const [programmFilter, setProgrammFilter] = useState<ProgrammKey>("");
  const [inventur, setInventur] = useState(false);
  const [ansicht, setAnsicht] = useAnsicht();
  const [limit, setLimit] = useState(LIST_STEP);
  const [pendingEdition, setPendingEdition] = useState("");

  const unikateQuery = useRecords({ from: ds.unikate, select: unikatSelect, count: PAGE_SIZE });
  const editionQuery = useRecords({ from: ds.edition, select: editionSelect, count: PAGE_SIZE });
  const kuenstlerQuery = useRecords({ from: ds.kuenstler, select: kuenstlerSelect, count: PAGE_SIZE });
  const glasurQuery = useRecords({ from: ds.glasuren, select: glasurSelect, count: PAGE_SIZE });
  const lagerortQuery = useRecords({ from: ds.lagerorte, select: lagerortSelect, count: PAGE_SIZE });
  const partnerQuery = useRecords({ from: ds.partner, select: partnerSelect, count: PAGE_SIZE });
  useAllPages(unikateQuery);
  useAllPages(editionQuery);
  useAllPages(kuenstlerQuery);
  useAllPages(glasurQuery);
  useAllPages(lagerortQuery);
  useAllPages(partnerQuery);

  const editionUpdate = useRecordUpdate({ from: ds.edition, fields: editionUpdateFields });
  const typen = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "typ" }).options as Opt[];
  const statusListe = useFieldOptions({ from: ds.unikate, select: unikatSelect, field: "status" }).options as Opt[];
  const stamm: Stamm = { lagerorte: lagerortQuery.data, partner: partnerQuery.data, kuenstler: kuenstlerQuery.data, glasuren: glasurQuery.data };

  const unikate = useMemo(() => (unikateQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toUnikat(i as RawItem)), [unikateQuery.data]);
  const editionen = useMemo(() => (editionQuery.data?.pages.flatMap((p) => p.items) ?? []).map((i) => toEdition(i as RawItem)), [editionQuery.data]);
  // Filter nur mit Werten, die im Bestand vorkommen. So bleiben auch archivierte Künstler:innen auffindbar.
  const kuenstlerImBestand = useMemo(
    () => [...new Map<string, Opt>(unikate.flatMap((u) => (u.kuenstler ? [[u.kuenstler.id, u.kuenstler] as [string, Opt]] : []))).values()].sort((a, b) => a.label.localeCompare(b.label, "de")),
    [unikate],
  );

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const term = search.trim();
  const visible = useMemo(
    () =>
      unikate
        .filter((u) => (activeTab.match ? activeTab.match(u) : true) && (!typFilter || u.typ === typFilter) && (!kuenstlerFilter || u.kuenstler?.id === kuenstlerFilter) && matchesSearch(u, term))
        .sort((a, b) => compare(a, b, sort)),
    [unikate, activeTab, typFilter, kuenstlerFilter, term, sort],
  );
  const editionImProgramm = editionen.filter((e) => !programmFilter || e.programm === programmFilter);
  const zustandChips = ZUSTAND_FILTER.map((z) => ({ key: z.key, label: z.label, count: editionImProgramm.filter((e) => !z.match || z.match(e)).length }));
  const activeZustand = ZUSTAND_FILTER.find((z) => z.key === zustandFilter) ?? ZUSTAND_FILTER[0];
  const visibleEdition = editionImProgramm
    .filter((e) => !activeZustand.match || activeZustand.match(e))
    .filter((e) => !term || [e.modell, e.programm, e.glasur, e.zustand, e.typ, e.lagerort?.label, e.notiz].join(" ").toLowerCase().includes(term.toLowerCase()))
    .sort((a, b) => compareNr(a.nr, b.nr) || a.modell.localeCompare(b.modell, "de") || a.zustand.localeCompare(b.zustand, "de") || a.glasur.localeCompare(b.glasur, "de"));

  const tabs = useMemo(() => TABS.map((t) => ({ key: t.key, label: t.label, count: unikate.filter((u) => (t.match ? t.match(u) : true)).length })), [unikate]);

  const selected = unikate.find((u) => u.id === selectedId);
  const selectedEdition = editionen.find((e) => e.id === editionId);
  const isEdition = art === "edition";
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const stueckGesamt = visibleEdition.reduce((n, e) => n + e.anzahl, 0);
  const filtered = !!(search || typFilter || kuenstlerFilter);

  // Aktuelle Anzahl direkt vom Server. Rechnet nie mit einem Stand, den ein zweites Gerät schon geändert hat.
  async function currentAnzahl(id: string): Promise<number | null> {
    const fresh = await freshItems(editionQuery);
    const row = fresh?.find((i) => i.id === id);
    return row ? (num(row.fields.anzahl) ?? 0) : null;
  }

  // Änderung um delta auf den frischen Wert. Rückgängig zieht genau diese Änderung wieder ab.
  async function changeBy(id: string, delta: number): Promise<{ vorher: number; neu: number } | null> {
    const vorher = await currentAnzahl(id);
    if (vorher === null) {
      toast.error("Diesen Posten gibt es nicht mehr. Die Liste wurde neu geladen.");
      return null;
    }
    const neu = Math.max(0, vorher + delta);
    await editionUpdate.mutateAsync({ recordId: id, fields: { anzahl: neu } } as never);
    await editionQuery.refetch();
    return { vorher, neu };
  }

  async function adjustEdition(e: Edition, delta: number) {
    setPendingEdition(e.id);
    try {
      const result = await changeBy(e.id, delta);
      if (!result) return;
      const applied = result.neu - result.vorher;
      toast.success(`${e.modell}${e.glasur ? ` · ${e.glasur}` : ""}: ${result.vorher} → ${result.neu}`, {
        duration: UNDO_MS,
        action: {
          label: "Rückgängig",
          onClick: async () => {
            try {
              await changeBy(e.id, -applied);
            } catch {
              toast.error("Rückgängig hat nicht geklappt.");
            }
          },
        },
      });
    } catch {
      toast.error("Anzahl konnte nicht gespeichert werden.");
    } finally {
      setPendingEdition("");
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

  function exportPdf() {
    const ok = isEdition
      ? printEdition(visibleEdition, [activeZustand.key === "alle" ? "Alle Zustände" : activeZustand.label, programmFilter || "Alle Programme", term && `Suche „${term}“`].filter(Boolean).join(" · "))
      : printUnikate(visible, [activeTab.label, typFilter, kuenstlerImBestand.find((k) => k.id === kuenstlerFilter)?.label, term && `Suche „${term}“`].filter(Boolean).join(" · "));
    if (!ok) toast.error("Der Browser hat das Druckfenster blockiert. Bitte Pop-ups für diese Seite erlauben.");
  }

  async function saveEdition(e: Edition, fields: { anzahl: number; lagerort: string[]; notiz: string }) {
    try {
      // Hat jemand die Anzahl geändert, seit das Fenster offen ist, nicht überschreiben, sondern melden.
      const aktuell = await currentAnzahl(e.id);
      if (aktuell === null) {
        toast.error("Diesen Posten gibt es nicht mehr.");
        setEditionId("");
        return;
      }
      const anzahlGeaendert = fields.anzahl !== e.anzahl;
      if (anzahlGeaendert && aktuell !== e.anzahl) {
        toast.error(`Die Anzahl wurde inzwischen geändert (jetzt ${aktuell}). Bitte prüfen und erneut speichern.`);
        return;
      }
      // Anzahl nicht angefasst: den aktuellen Wert behalten, nur Lagerort und Notiz speichern.
      await editionUpdate.mutateAsync({ recordId: e.id, fields: { ...fields, anzahl: anzahlGeaendert ? fields.anzahl : aktuell } } as never);
      await editionQuery.refetch();
      toast.success("Änderungen gespeichert.");
      setEditionId("");
    } catch {
      toast.error("Speichern hat nicht geklappt.");
    }
  }

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content space-y-4" lang="de">
        <PageHeader
          title="Bestand"
          description={isEdition ? `${zahl.format(stueckGesamt)} Stück in ${zahl.format(visibleEdition.length)} Posten` : `${zahl.format(visible.length)} von ${zahl.format(unikate.length)} Unikaten`}
          actions={
            <>
              <Button asChild variant="ghost" className="h-11 text-base">
                <a href="/tabelle">
                  <Table2 className="w-5 h-5 mr-2" aria-hidden /> Tabelle
                </a>
              </Button>
              <ExportMenu
                onCsv={() => (isEdition ? exportEdition(visibleEdition) : exportUnikate(visible))}
                onPdf={exportPdf}
                disabled={isEdition ? visibleEdition.length === 0 : visible.length === 0}
              />
            </>
          }
        />

        <Tabs
          label="Art"
          tabs={[
            { key: "unikat" as Art, label: "Unikate", count: unikate.length },
            { key: "edition" as Art, label: "Editionsware", count: editionen.length },
          ]}
          value={art}
          onChange={(key) => {
            setArt(key);
            setSearch("");
            setLimit(LIST_STEP);
            setInventur(false);
          }}
        />

        {isEdition ? (
          <>
            <FilterChips label="Zustand" options={zustandChips} value={zustandFilter} onChange={setZustandFilter} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_16rem_auto]">
              <div className="flex">
                <SearchField label="Suche" placeholder="Suchen: Nummer, Modell, Glasur, Ort" value={search} onChange={setSearch} />
              </div>
              <select aria-label="Programm" value={programmFilter} onChange={(e) => setProgrammFilter(e.target.value as ProgrammKey)} className={INPUT_CLASS}>
                <option value="">Alle Programme</option>
                <option value={EDITION_PROGRAMM}>Editionen</option>
                <option value={MANUFAKTUR_PROGRAMM}>Manufakturprogramm</option>
              </select>
              {!inventur && editionUpdate.enabled && (
                <Button variant="outline" className="h-12 text-base" onClick={() => setInventur(true)}>
                  <ClipboardList className="w-5 h-5 mr-2" aria-hidden /> Inventur
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <FilterChips
                label="Status"
                options={tabs}
                value={tab}
                onChange={(key) => {
                  setTab(key);
                  setLimit(LIST_STEP);
                }}
              />
              <AnsichtToggle value={ansicht} onChange={setAnsicht} />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_12rem_11rem]">
              <div className="col-span-2 lg:col-span-1 flex">
                <SearchField label="Suche" placeholder="Suchen: Name, Nummer, Glasur, Ort" value={search} onChange={setSearch} />
              </div>
              <select aria-label="Typ" value={typFilter} onChange={(e) => setTypFilter(e.target.value)} className={INPUT_CLASS}>
                <option value="">Alle Typen</option>
                {typen.map((t) => (
                  <option key={t.id} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select aria-label="Künstler:in" value={kuenstlerFilter} onChange={(e) => setKuenstlerFilter(e.target.value)} className={INPUT_CLASS}>
                <option value="">Alle Künstler:innen</option>
                {kuenstlerImBestand.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
              <select aria-label="Sortierung" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={INPUT_CLASS}>
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {failed ? (
          <ErrorState text="Der Bestand konnte nicht geladen werden. Bitte die Seite neu laden." />
        ) : loading ? (
          <LoadingState text="Bestand wird geladen …" />
        ) : isEdition && inventur ? (
          <InventurView rows={visibleEdition} onApply={applyInventur} onClose={() => setInventur(false)} />
        ) : isEdition ? (
          visibleEdition.length === 0 ? (
            <EmptyState text="Keine Editionsware gefunden." />
          ) : (
            <div className={`${PANEL_CLASS} px-3 divide-y`}>
              {visibleEdition.map((e) => (
                <EditionRow key={e.id} e={e} busy={pendingEdition === e.id} canEdit={editionUpdate.enabled} onAdjust={(d) => adjustEdition(e, d)} onOpen={() => setEditionId(e.id)} />
              ))}
            </div>
          )
        ) : visible.length === 0 ? (
          <div className="space-y-3 text-center">
            <EmptyState text={filtered ? "Keine Stücke zu Suche und Filter." : "Hier ist zurzeit kein Stück."} />
            {filtered && (
              <Button
                variant="outline"
                className="h-11 text-base"
                onClick={() => {
                  setSearch("");
                  setTypFilter("");
                  setKuenstlerFilter("");
                }}
              >
                Suche und Filter zurücksetzen
              </Button>
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
                      sub={[u.inv, u.kuenstler?.label, ortVon(u) || "Kein Lagerort"].filter(Boolean).join(" · ")}
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
                <Button variant="outline" className="h-12 text-base" onClick={() => setLimit((l) => l + LIST_STEP)}>
                  Weitere {Math.min(LIST_STEP, visible.length - limit)} anzeigen
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <UnikatDetail key={selected.id} u={selected} onClose={() => setSelectedId("")} onSaved={() => unikateQuery.refetch()} stamm={stamm} typen={typen} statusListe={statusListe} />}
      {selectedEdition && (
        <EditionDetail
          key={selectedEdition.id}
          e={selectedEdition}
          canEdit={editionUpdate.enabled}
          onClose={() => setEditionId("")}
          onSave={(fields) => saveEdition(selectedEdition, fields)}
          lagerorte={activeOptions(stamm.lagerorte, link(selectedEdition.lagerort?.id))}
        />
      )}
    </div>
  );
}

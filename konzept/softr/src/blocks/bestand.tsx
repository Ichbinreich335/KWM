import { useEffect, useMemo, useState } from "react";
import { datasource, q, useFieldOptions, useRecordUpdate, useRecords, useUpload } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Download, ImageOff, Loader2, Minus, Pencil, Plus, Table2 } from "lucide-react";
import { toast } from "sonner";
import { AUSSER_HAUS_ORT, PAGE_SIZE, RESERVIERT, ROHLING, VERFUEGBAR, VERKAUFT, isAusserHaus } from "../shared/konstanten";
import {
  type Attachment,
  type Opt,
  type RawItem,
  activeOptions,
  asAttachments,
  asOpts,
  downloadCsv,
  euro,
  formatDate,
  link,
  num,
  parseNumber,
  str,
  thumb,
  today,
  useAllPages,
  zahl,
} from "../shared/daten";
import {
  ChoiceChips,
  DIALOG_CLASS,
  DoneButton,
  EmptyState,
  ErrorState,
  ErrorText,
  FIELD_CLASS,
  FieldLabel,
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
  Segmented,
  StatusBadge,
  TEXTAREA_CLASS,
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

const ARTEN: { key: Art; label: string }[] = [
  { key: "unikat", label: "Unikate" },
  { key: "edition", label: "Editionsware" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "neu", label: "Neueste zuerst" },
  { key: "name", label: "Name A–Z" },
  { key: "nummer", label: "Inventarnummer" },
  { key: "preis", label: "Preis absteigend" },
  { key: "lagerort", label: "Lagerort" },
];

type ZustandKey = "alle" | "rohling" | "glasiert";
const ZUSTAND_FILTER: { key: ZustandKey; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "rohling", label: "Rohlinge" },
  { key: "glasiert", label: "Glasiert" },
];

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
    modell: asOpts(f.modell)[0]?.label ?? "",
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

function exportEdition(list: Edition[]) {
  downloadCsv(
    `editionsbestand-${today()}.csv`,
    ["Modell", "Typ", "Zustand", "Glasur", "Anzahl", "Lagerort", "Notiz"],
    list.map((e) => [e.modell, e.typ, e.zustand, e.glasur, String(e.anzahl), e.lagerort?.label ?? "", e.notiz]),
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

function UnikatDetail({
  u,
  onClose,
  onSaved,
  stamm,
  typen,
  statusListe,
}: {
  u: Unikat;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  stamm: Stamm;
  typen: Opt[];
  statusListe: Opt[];
}) {
  const lagerorte = activeOptions(stamm.lagerorte, link(u.lagerort?.id));
  const galerien = activeOptions(stamm.partner, link(u.galerie?.id));
  const kuenstler = activeOptions(stamm.kuenstler, link(u.kuenstler?.id));
  const glasuren = activeOptions(stamm.glasuren, u.glasur.map((g) => g.id));
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
        fotos = [...results.map((r) => ({ url: r.url as string, filename: r.file.name })), ...u.fotos.map((a) => ({ id: a.id, url: a.url, filename: a.filename }))];
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
                <ChoiceChips label="Status" options={statusListe} value={u.status} onChange={changeStatus} withDots disabled={busy} />
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
                  {u.fotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {u.fotos.map((a, i) => (
                        <button key={a.id ?? a.url} type="button" aria-label={`Foto ${i + 1} zeigen`} onClick={() => setPhotoIndex(i)} className={`shrink-0 rounded-md overflow-hidden border-2 ${i === photoIndex ? "border-primary" : "border-transparent"}`}>
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
                  <Input id="d-preis" inputMode="decimal" value={form.preis} onChange={(e) => set("preis", e.target.value)} placeholder="z. B. 480" className={FIELD_CLASS} aria-invalid={!!formError.preis} />
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

function EditionDetail({ e, onClose, onSave, lagerorte, canEdit }: { e: Edition; onClose: () => void; onSave: (fields: { anzahl: number; lagerort: string[]; notiz: string }) => Promise<void>; lagerorte: Opt[]; canEdit: boolean }) {
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
              <Input id="ed-anzahl" inputMode="numeric" disabled={!canEdit} value={anzahl} onChange={(ev) => setAnzahl(ev.target.value.replace(/\D/g, ""))} className="h-12 w-24 rounded-md text-center text-lg md:text-lg" />
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
  const visibleEdition = editionen
    .filter((e) => (zustandFilter === "rohling" ? e.zustand === ROHLING : zustandFilter === "glasiert" ? e.zustand !== ROHLING : true))
    .filter((e) => !term || [e.modell, e.glasur, e.zustand, e.typ, e.lagerort?.label, e.notiz].join(" ").toLowerCase().includes(term.toLowerCase()))
    .sort((a, b) => a.modell.localeCompare(b.modell, "de") || a.zustand.localeCompare(b.zustand, "de"));

  const tabs = useMemo(() => TABS.map((t) => ({ key: t.key, label: t.label, count: unikate.filter((u) => (t.match ? t.match(u) : true)).length })), [unikate]);

  const selected = unikate.find((u) => u.id === selectedId);
  const selectedEdition = editionen.find((e) => e.id === editionId);
  const isEdition = art === "edition";
  const loading = unikateQuery.status === "pending" || editionQuery.status === "pending";
  const failed = unikateQuery.status === "error" || editionQuery.status === "error";
  const stueckGesamt = visibleEdition.reduce((n, e) => n + e.anzahl, 0);
  const filtered = !!(search || typFilter || kuenstlerFilter);

  async function adjustEdition(e: Edition, delta: number) {
    setPendingEdition(e.id);
    const neu = Math.max(0, e.anzahl + delta);
    try {
      await editionUpdate.mutateAsync({ recordId: e.id, fields: { anzahl: neu } } as never);
      await editionQuery.refetch();
      toast.success(`${e.modell}${e.glasur ? ` · ${e.glasur}` : ""}: ${e.anzahl} → ${neu}`, {
        duration: 6000,
        action: {
          label: "Rückgängig",
          onClick: async () => {
            await editionUpdate.mutateAsync({ recordId: e.id, fields: { anzahl: e.anzahl } } as never);
            await editionQuery.refetch();
          },
        },
      });
    } catch {
      toast.error("Anzahl konnte nicht gespeichert werden.");
    } finally {
      setPendingEdition("");
    }
  }

  async function saveEdition(e: Edition, fields: { anzahl: number; lagerort: string[]; notiz: string }) {
    try {
      await editionUpdate.mutateAsync({ recordId: e.id, fields } as never);
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
              <Button variant="outline" className="h-11 text-base" onClick={() => (isEdition ? exportEdition(visibleEdition) : exportUnikate(visible))} disabled={isEdition ? visibleEdition.length === 0 : visible.length === 0}>
                <Download className="w-5 h-5 mr-2" aria-hidden /> CSV
              </Button>
            </>
          }
        />

        <Segmented
          label="Art"
          options={ARTEN}
          value={art}
          onChange={(key) => {
            setArt(key);
            setSearch("");
            setLimit(LIST_STEP);
          }}
        />

        {isEdition ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchField label="Suche" placeholder="Suchen: Modell, Glasur, Ort" value={search} onChange={setSearch} />
            <Segmented label="Zustand" options={ZUSTAND_FILTER} value={zustandFilter} onChange={setZustandFilter} />
          </div>
        ) : (
          <>
            <Segmented
              label="Status"
              options={tabs}
              value={tab}
              onChange={(key) => {
                setTab(key);
                setLimit(LIST_STEP);
              }}
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_12rem_12rem]">
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
              <select aria-label="Sortierung" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${INPUT_CLASS} col-span-2 lg:col-span-1`}>
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

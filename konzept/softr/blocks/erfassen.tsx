import { useEffect, useMemo, useRef, useState } from "react";
import {
  datasource,
  q,
  useFieldOptions,
  useLinkedRecords,
  useRecord,
  useRecordCreate,
  useRecordUpdate,
  useRecords,
  useUpload,
} from "@/lib/datasource";
import { useNavigationSetting } from "@/lib/editable-settings";
import { NavigationAction } from "@/components/navigation-action";
import { useCurrentUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Camera, Check, Loader2, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({ unikate: "unikate", edition: "edition", glasuren: "glasuren", kuenstler: "kuenstler" });
const glasurNeu = q.select({ name: "OuhBi" });
const kuenstlerNeu = q.select({ name: "vqD0c" });

const unikatFields = q.select({
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
});

const KOMMISSION = "in Kommission";
const AUSGESTELLT = "ausgestellt";
const userProperties = { role: "z0b2k" };
const STATUS_ACTIVE: Record<string, string> = {
  verfügbar: "bg-emerald-600 text-white border-emerald-600",
  reserviert: "bg-amber-400 text-amber-950 border-amber-400",
  verkauft: "bg-zinc-500 text-white border-zinc-500",
  [KOMMISSION]: "bg-sky-600 text-white border-sky-600",
  ausgestellt: "bg-violet-700 text-white border-violet-700",
};
const FIELD_NAMES: Record<string, string> = {
  fotos: "Foto",
  name: "Name",
  typ: "Typ",
  status: "Status",
  preis: "Preis",
  modell: "Modell",
  zustand: "Zustand",
  glasur: "Glasur",
  anzahl: "Anzahl",
};
const ROHLING = "Rohling";
const MAX_EDITION_ROWS = 100;

type Option = { id: string; label: string };
type Art = "unikat" | "edition";
type Saved = { art: Art; recordId: string; text: string };

type UnikatForm = {
  name: string;
  typ: string;
  status: string;
  kuenstler: string;
  jahr: string;
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
  anzahl: number;
  lagerort: string;
  notiz: string;
};

const emptyUnikat = (): UnikatForm => ({
  name: "",
  typ: "",
  status: "verfügbar",
  kuenstler: "",
  jahr: String(new Date().getFullYear()),
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
  zustand: ROHLING,
  glasur: "",
  anzahl: 1,
  lagerort: "",
  notiz: "",
});

type LinkedPages = { pages: { items: { id: string; title: string }[] }[] } | undefined;

function toOptions(data: LinkedPages): Option[] {
  return (data?.pages.flatMap((p) => p.items) ?? []).map((o) => ({ id: o.id, label: o.title }));
}

function link(id: string) {
  return id ? [id] : [];
}

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
      {required && <span className="text-destructive"> *</span>}
    </label>
  );
}

function Hint({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground mt-1.5">{children}</p>;
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" data-error="true" className="text-sm text-destructive mt-1.5">
      {children}
    </p>
  );
}

function Chips({
  options,
  value,
  onChange,
  name,
  activeClasses,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  name: string;
  activeClasses?: Record<string, string>;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.label;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.label)}
            className={`inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full border text-base transition-colors ${
              active ? activeClasses?.[o.label] ?? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
            }`}
          >
            {active && <Check className="w-4 h-4" aria-hidden />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 rounded-md border border-input bg-background px-3 text-base"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function AddNew({ label, placeholder, existing, onAdd }: { label: string; placeholder: string; existing: Option[]; onAdd: (name: string) => Promise<boolean> | boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const name = value.trim();
  const duplicate = existing.find((o) => o.label.toLowerCase() === name.toLowerCase());
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-11 px-4 rounded-full border border-dashed border-input text-base text-muted-foreground hover:bg-muted">
        + {label}
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} aria-label={label} className="h-11 text-base flex-1 min-w-48" />
      <Button
        type="button"
        className="h-11 text-base"
        disabled={!name || !!duplicate || busy}
        onClick={async () => {
          setBusy(true);
          const ok = await onAdd(name);
          setBusy(false);
          if (ok) {
            setValue("");
            setOpen(false);
          }
        }}
      >
        Übernehmen
      </Button>
      <Button type="button" variant="ghost" className="h-11 text-base" onClick={() => { setValue(""); setOpen(false); }}>
        Abbrechen
      </Button>
      {duplicate && <p className="w-full text-sm text-muted-foreground">„{duplicate.label}“ gibt es schon. Bitte oben auswählen.</p>}
    </div>
  );
}

function PhotoPicker({
  files,
  onChange,
  multiple,
  error,
}: {
  files: File[];
  onChange: (f: File[]) => void;
  multiple: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  return (
    <div>
      <input
        ref={inputRef}
        id="foto-input"
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));
          e.target.value = "";
        }}
      />
      {files.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-base hover:bg-muted ${
            error ? "border-destructive" : "border-input"
          }`}
        >
          <Camera className="w-8 h-8 text-muted-foreground" aria-hidden />
          <span className="font-medium">Foto aufnehmen oder auswählen</span>
          <span className="text-sm text-muted-foreground">Am Handy öffnet sich Kamera oder Galerie</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square rounded-lg overflow-hidden border">
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label={`Foto ${i + 1} entfernen`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-11 h-11 rounded-full bg-background/90 flex items-center justify-center"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>
          ))}
          {multiple && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-input flex flex-col items-center justify-center gap-1 text-sm hover:bg-muted"
            >
              <Plus className="w-6 h-6" aria-hidden />
              Weiteres Foto
            </button>
          )}
        </div>
      )}
      <ErrorText>{error}</ErrorText>
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
    <div className="rounded-xl border bg-card p-6 text-center space-y-4" role="status">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="w-7 h-7 text-primary" aria-hidden />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Gespeichert</h2>
        <p className="text-base text-muted-foreground mt-1">{saved.text}</p>
        {inventarnummer && <p className="text-base mt-1">Inventarnummer: <strong>{inventarnummer}</strong></p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="h-12 text-base" onClick={onNext}>
          Nächstes Stück erfassen
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 text-base">
          <NavigationAction navigation={bestandLink}>Zum Bestand</NavigationAction>
        </Button>
      </div>
    </div>
  );
}

export default function Block() {
  const user = useCurrentUser({ properties: userProperties });
  const roleValue = (user?.properties as { role?: unknown } | undefined)?.role;
  const isAdmin = (Array.isArray(roleValue) ? roleValue : [roleValue]).some((r) => (r as { label?: string } | undefined)?.label === "Admin");
  const formRef = useRef<HTMLFormElement>(null);
  const [art, setArt] = useState<Art>("unikat");
  const [unikat, setUnikat] = useState<UnikatForm>(emptyUnikat);
  const [edition, setEdition] = useState<EditionForm>(emptyEdition);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);

  const { uploadAsync } = useUpload();
  const createUnikat = useRecordCreate({ from: ds.unikate, fields: unikatFields });
  const createEdition = useRecordCreate({ from: ds.edition, fields: editionFields });
  const updateEdition = useRecordUpdate({ from: ds.edition, fields: q.select({ anzahl: "Ciiwp" }) });

  const typOptions = useFieldOptions({ from: ds.unikate, select: unikatFields, field: "typ" }).options as Option[];
  const statusOptions = useFieldOptions({ from: ds.unikate, select: unikatFields, field: "status" })
    .options as Option[];
  const zustandOptions = useFieldOptions({ from: ds.edition, select: editionFields, field: "zustand" })
    .options as Option[];

  const kuenstlerQuery = useLinkedRecords({ from: ds.unikate, select: unikatFields, field: "kuenstler", sortOrder: "ASC" });
  const glasurQuery = useLinkedRecords({ from: ds.unikate, select: unikatFields, field: "glasur", sortOrder: "ASC" });
  const lagerortQuery = useLinkedRecords({ from: ds.unikate, select: unikatFields, field: "lagerort", sortOrder: "ASC" });
  const galerieQuery = useLinkedRecords({ from: ds.unikate, select: unikatFields, field: "galerie", sortOrder: "ASC" });
  const modellQuery = useLinkedRecords({ from: ds.edition, select: editionFields, field: "modell", sortOrder: "ASC" });
  const kuenstlerOptions = toOptions(kuenstlerQuery.data as LinkedPages);
  const glasurOptions = toOptions(glasurQuery.data as LinkedPages);
  const lagerortOptions = toOptions(lagerortQuery.data as LinkedPages);
  const galerieOptions = toOptions(galerieQuery.data as LinkedPages);
  const modellOptions = toOptions(modellQuery.data as LinkedPages);
  const [extraTypen, setExtraTypen] = useState<Option[]>([]);
  const typChoices = [...typOptions, ...extraTypen.filter((t) => !typOptions.some((o) => o.label === t.label))];
  const createGlasur = useRecordCreate({ from: ds.glasuren, fields: glasurNeu });
  const createKuenstler = useRecordCreate({ from: ds.kuenstler, fields: kuenstlerNeu });

  function addTyp(name: string): boolean {
    setExtraTypen((t) => [...t, { id: `neu-${name}`, label: name }]);
    setUnikat((s) => ({ ...s, typ: name }));
    return true;
  }

  async function addGlasur(name: string, target: Art): Promise<boolean> {
    try {
      const created = await createGlasur.mutateAsync({ name } as never);
      const id = (created as { id: string }).id;
      await glasurQuery.refetch();
      if (target === "unikat") setUnikat((s) => ({ ...s, glasur: [...s.glasur, id] }));
      else setEdition((s) => ({ ...s, glasur: id }));
      toast.success(`Glasur „${name}“ angelegt.`);
      return true;
    } catch {
      toast.error("Glasur konnte nicht angelegt werden.");
      return false;
    }
  }

  async function addKuenstler(name: string): Promise<boolean> {
    try {
      const created = await createKuenstler.mutateAsync({ name } as never);
      await kuenstlerQuery.refetch();
      setUnikat((s) => ({ ...s, kuenstler: (created as { id: string }).id }));
      toast.success(`„${name}“ angelegt.`);
      return true;
    } catch {
      toast.error("Konnte nicht angelegt werden.");
      return false;
    }
  }

  const { data: editionData, refetch: refetchEdition } = useRecords({
    from: ds.edition,
    select: editionFields,
    count: MAX_EDITION_ROWS,
  });
  const editionRows = editionData?.pages.flatMap((p) => p.items) ?? [];
  const isGlasiert = edition.zustand !== ROHLING;
  const existingRow = edition.modell
    ? editionRows.find((r) => {
        const f = r.fields as { modell?: Option; zustand?: Option; glasur?: Option };
        const sameGlasur = isGlasiert ? f.glasur?.id === edition.glasur : !f.glasur?.id;
        return f.modell?.id === edition.modell && f.zustand?.label === edition.zustand && sameGlasur;
      })
    : undefined;
  const existingCount = Number((existingRow?.fields as { anzahl?: number } | undefined)?.anzahl ?? 0);

  const setU = <K extends keyof UnikatForm>(key: K, value: UnikatForm[K]) => setUnikat((s) => ({ ...s, [key]: value }));
  const setE = <K extends keyof EditionForm>(key: K, value: EditionForm[K]) =>
    setEdition((s) => ({ ...s, [key]: value }));

  const canCreate = art === "unikat" ? createUnikat.enabled : createEdition.enabled;

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (art === "unikat") {
      if (files.length === 0) e.fotos = "Bitte mindestens ein Foto hinzufügen.";
      if (!unikat.name.trim()) e.name = "Bitte einen Namen eingeben.";
      if (!unikat.typ) e.typ = "Bitte einen Typ wählen.";
      if (!unikat.status) e.status = "Bitte einen Status wählen.";
      if (unikat.preis && Number.isNaN(Number(unikat.preis.replace(",", ".")))) e.preis = "Bitte nur eine Zahl eingeben.";
    } else {
      if (!edition.modell) e.modell = "Bitte ein Modell wählen.";
      if (!edition.zustand) e.zustand = "Bitte den Zustand wählen.";
      if (isGlasiert && !edition.glasur) e.glasur = "Bitte die Glasur wählen.";
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
    setBusy(true);
    try {
      const fotos = await uploadFiles();
      if (art === "unikat") {
        const preis = unikat.preis ? Number(unikat.preis.replace(",", ".")) : undefined;
        const created = await createUnikat.mutateAsync({
          name: unikat.name.trim(),
          typ: unikat.typ,
          status: unikat.status,
          kuenstler: link(unikat.kuenstler),
          jahr: unikat.jahr ? Number(unikat.jahr) : undefined,
          glasur: unikat.glasur,
          masse: unikat.masse.trim(),
          fotos,
          bildnachweis: unikat.bildnachweis.trim(),
          lagerort: link(unikat.lagerort),
          galerie: unikat.status === KOMMISSION || unikat.status === AUSGESTELLT ? link(unikat.galerie) : [],
          preis,
          website: unikat.website,
          notiz: unikat.notiz.trim(),
          erfasstVon: user?.fullName || user?.email || "",
        } as never);
        setSaved({ art, recordId: (created as { id: string }).id, text: `Unikat „${unikat.name.trim()}“ ist im Bestand.` });
      } else {
        const modell = modellOptions.find((m) => m.id === edition.modell)?.label ?? "";
        const glasur = glasurOptions.find((g) => g.id === edition.glasur)?.label;
        const variante = isGlasiert ? glasur ?? edition.zustand : ROHLING;
        if (existingRow) {
          const neu = existingCount + edition.anzahl;
          await updateEdition.mutateAsync({ recordId: existingRow.id, fields: { anzahl: neu } } as never);
          setSaved({ art, recordId: existingRow.id, text: `${modell} · ${variante}: jetzt ${neu} Stück.` });
        } else {
          const created = await createEdition.mutateAsync({
            bezeichnung: `${modell} · ${variante}`,
            modell: link(edition.modell),
            glasur: isGlasiert ? link(edition.glasur) : [],
            zustand: edition.zustand,
            anzahl: edition.anzahl,
            lagerort: link(edition.lagerort),
            foto: fotos,
            notiz: edition.notiz.trim(),
          } as never);
          setSaved({ art, recordId: (created as { id: string }).id, text: `${modell} · ${variante}: ${edition.anzahl} Stück angelegt.` });
        }
        await refetchEdition();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSaved(null);
    setErrors({});
    setFiles([]);
    setUnikat(emptyUnikat());
    setEdition(emptyEdition());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="container pt-6 pb-28 sm:pb-8">
      <div className="content max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Neues Stück erfassen</h1>
        <p className="text-base text-muted-foreground mb-5">Felder mit * sind Pflicht. Alles andere kann später ergänzt werden.</p>

        {saved ? (
          <SuccessCard saved={saved} onNext={reset} />
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
            <div role="tablist" aria-label="Art des Stücks" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted">
              {(
                [
                  ["unikat", "Unikat"],
                  ["edition", "Editionsware"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={art === key}
                  onClick={() => {
                    setArt(key);
                    setErrors({});
                    setFiles([]);
                  }}
                  className={`h-12 rounded-lg text-base font-medium ${
                    art === key ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {art === "unikat" ? (
              <>
                <div>
                  <FieldLabel htmlFor="foto-input" required>
                    Fotos
                  </FieldLabel>
                  <PhotoPicker files={files} onChange={setFiles} multiple error={errors.fotos} />
                </div>

                <div>
                  <FieldLabel htmlFor="u-name" required>
                    Name
                  </FieldLabel>
                  <Input
                    id="u-name"
                    value={unikat.name}
                    onChange={(e) => setU("name", e.target.value)}
                    placeholder="z. B. Mondvase „Seladon“"
                    className="h-12 text-base"
                    aria-invalid={!!errors.name}
                  />
                  <ErrorText>{errors.name}</ErrorText>
                </div>

                <div>
                  <FieldLabel required>Typ</FieldLabel>
                  <Chips name="Typ" options={typChoices} value={unikat.typ} onChange={(v) => setU("typ", v)} />
                  <div className="mt-2">
                    <AddNew label="Neuer Typ" placeholder="z. B. Krug" existing={typChoices} onAdd={addTyp} />
                  </div>
                  <ErrorText>{errors.typ}</ErrorText>
                </div>

                <div>
                  <FieldLabel required>Status</FieldLabel>
                  <Chips
                    name="Status"
                    options={statusOptions}
                    value={unikat.status}
                    onChange={(v) => setU("status", v)}
                    activeClasses={STATUS_ACTIVE}
                  />
                  <ErrorText>{errors.status}</ErrorText>
                </div>

                <div>
                  <FieldLabel htmlFor="u-lagerort">Lagerort</FieldLabel>
                  <Select
                    id="u-lagerort"
                    value={unikat.lagerort}
                    onChange={(v) => setU("lagerort", v)}
                    options={lagerortOptions}
                    placeholder="Bitte wählen"
                  />
                </div>

                {(unikat.status === KOMMISSION || unikat.status === AUSGESTELLT) && (
                  <div>
                    <FieldLabel htmlFor="u-galerie">Partner (Galerie, Museum …)</FieldLabel>
                    <Select
                      id="u-galerie"
                      value={unikat.galerie}
                      onChange={(v) => setU("galerie", v)}
                      options={galerieOptions}
                      placeholder="Partner wählen"
                    />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel htmlFor="u-kuenstler">Künstler:in</FieldLabel>
                    <Select
                      id="u-kuenstler"
                      value={unikat.kuenstler}
                      onChange={(v) => setU("kuenstler", v)}
                      options={kuenstlerOptions}
                      placeholder="Bitte wählen"
                    />
                    <div className="mt-2">
                      <AddNew label="Neue:r Künstler:in" placeholder="Vor- und Nachname" existing={kuenstlerOptions} onAdd={addKuenstler} />
                    </div>
                  </div>
                  <div>
                    <FieldLabel htmlFor="u-jahr">Jahr</FieldLabel>
                    <Input
                      id="u-jahr"
                      inputMode="numeric"
                      value={unikat.jahr}
                      onChange={(e) => setU("jahr", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Glasur</FieldLabel>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Glasur">
                    {glasurOptions.map((g) => {
                      const active = unikat.glasur.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            setU("glasur", active ? unikat.glasur.filter((x) => x !== g.id) : [...unikat.glasur, g.id])
                          }
                          className={`min-h-11 px-4 rounded-full border text-base ${
                            active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2">
                    <AddNew label="Neue Glasur" placeholder="Name der Glasur" existing={glasurOptions} onAdd={(n) => addGlasur(n, "unikat")} />
                  </div>
                  <Hint>Mehrere möglich. Fehlt eine Glasur, mit „+ Neue Glasur“ anlegen.</Hint>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel htmlFor="u-masse">Maße</FieldLabel>
                    <Input
                      id="u-masse"
                      value={unikat.masse}
                      onChange={(e) => setU("masse", e.target.value)}
                      placeholder="z. B. Ø 24 × H 8 cm"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="u-bildnachweis">Bildnachweis</FieldLabel>
                    <Input
                      id="u-bildnachweis"
                      value={unikat.bildnachweis}
                      onChange={(e) => setU("bildnachweis", e.target.value)}
                      placeholder="z. B. Foto: Name der Fotografin"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                {isAdmin && (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel htmlFor="u-preis">Preis intern (€)</FieldLabel>
                    <Input
                      id="u-preis"
                      inputMode="decimal"
                      value={unikat.preis}
                      onChange={(e) => setU("preis", e.target.value)}
                      placeholder="z. B. 480"
                      className="h-12 text-base"
                      aria-invalid={!!errors.preis}
                    />
                    <Hint>Nur intern, erscheint nie auf der Website.</Hint>
                    <ErrorText>{errors.preis}</ErrorText>
                  </div>
                  <label htmlFor="u-website" className="flex items-center justify-between gap-4 rounded-lg border p-4 min-h-12 cursor-pointer self-start sm:mt-8">
                    <span>
                      <span className="block text-base font-medium">Auf Website zeigen</span>
                      <span className="block text-sm text-muted-foreground">Nur für die spätere Website-Anbindung.</span>
                    </span>
                    <Switch id="u-website" className="scale-125 data-[state=unchecked]:bg-zinc-300" checked={unikat.website} onCheckedChange={(v) => setU("website", v)} />
                  </label>
                </div>
                )}

                <div>
                  <FieldLabel htmlFor="u-notiz">Notiz</FieldLabel>
                  <Textarea
                    id="u-notiz"
                    value={unikat.notiz}
                    onChange={(e) => setU("notiz", e.target.value)}
                    rows={3}
                    className="text-base"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <FieldLabel htmlFor="e-modell" required>
                    Modell
                  </FieldLabel>
                  <Select
                    id="e-modell"
                    value={edition.modell}
                    onChange={(v) => setE("modell", v)}
                    options={modellOptions}
                    placeholder="Modell wählen"
                  />
                  <Hint>Neue Modelle legt der Admin an.</Hint>
                  <ErrorText>{errors.modell}</ErrorText>
                </div>

                <div>
                  <FieldLabel required>Zustand</FieldLabel>
                  <Chips
                    name="Zustand"
                    options={zustandOptions}
                    value={edition.zustand}
                    onChange={(v) => setE("zustand", v)}
                  />
                  <ErrorText>{errors.zustand}</ErrorText>
                </div>

                {isGlasiert && (
                  <div>
                    <FieldLabel htmlFor="e-glasur" required>
                      Glasur
                    </FieldLabel>
                    <Select
                      id="e-glasur"
                      value={edition.glasur}
                      onChange={(v) => setE("glasur", v)}
                      options={glasurOptions}
                      placeholder="Glasur wählen"
                    />
                    <div className="mt-2">
                      <AddNew label="Neue Glasur" placeholder="Name der Glasur" existing={glasurOptions} onAdd={(n) => addGlasur(n, "edition")} />
                    </div>
                    <ErrorText>{errors.glasur}</ErrorText>
                  </div>
                )}

                <div>
                  <FieldLabel htmlFor="e-anzahl" required>
                    Anzahl
                  </FieldLabel>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-12"
                      aria-label="Eins weniger"
                      onClick={() => setE("anzahl", Math.max(1, edition.anzahl - 1))}
                    >
                      <Minus className="w-5 h-5" aria-hidden />
                    </Button>
                    <Input
                      id="e-anzahl"
                      inputMode="numeric"
                      value={String(edition.anzahl)}
                      onChange={(e) => setE("anzahl", Number(e.target.value.replace(/\D/g, "")) || 0)}
                      className="h-12 w-24 text-center text-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-12"
                      aria-label="Eins mehr"
                      onClick={() => setE("anzahl", edition.anzahl + 1)}
                    >
                      <Plus className="w-5 h-5" aria-hidden />
                    </Button>
                  </div>
                  <ErrorText>{errors.anzahl}</ErrorText>
                  {existingRow && (
                    <p className="mt-3 rounded-lg bg-muted p-3 text-base">
                      Diese Kombination gibt es schon mit <strong>{existingCount} Stück</strong>. Beim Speichern wird
                      die Anzahl dort auf <strong>{existingCount + edition.anzahl}</strong> erhöht.
                    </p>
                  )}
                </div>

                {!existingRow && (
                  <>
                    <div>
                      <FieldLabel htmlFor="e-lagerort">Lagerort</FieldLabel>
                      <Select
                        id="e-lagerort"
                        value={edition.lagerort}
                        onChange={(v) => setE("lagerort", v)}
                        options={lagerortOptions}
                        placeholder="Bitte wählen"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="foto-input">Foto</FieldLabel>
                      <PhotoPicker files={files} onChange={setFiles} multiple={false} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="e-notiz">Notiz</FieldLabel>
                      <Textarea
                        id="e-notiz"
                        value={edition.notiz}
                        onChange={(e) => setE("notiz", e.target.value)}
                        rows={3}
                        className="text-base"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {Object.keys(errors).length > 0 && (
              <p role="alert" className="text-base text-destructive">
                Bitte noch ausfüllen: {Object.keys(errors).map((k) => FIELD_NAMES[k] ?? k).join(", ")}
              </p>
            )}
            {canCreate ? (
              <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> Wird gespeichert …
                  </>
                ) : existingRow && art === "edition" ? (
                  "Anzahl erhöhen"
                ) : (
                  "Speichern"
                )}
              </Button>
            ) : (
              <p className="text-base text-muted-foreground">Du hast keine Berechtigung, Stücke zu erfassen.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

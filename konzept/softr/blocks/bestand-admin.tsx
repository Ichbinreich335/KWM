import { useEffect, useState } from "react";
import { datasource, q, useFieldOptions, useLinkedRecords, useRecord, useRecordUpdate } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({ unikate: "unikate" });

const adminFields = q.select({
  inv: "glG6V",
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
});
const writableFields = q.select({
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
});

const EVENT_ADMIN_EDIT = "kwm:unikat-admin-bearbeiten";
const EVENT_UNIKAT_CHANGED = "kwm:unikat-geaendert";
const KOMMISSION = "in Kommission";
const VERKAUFT = "verkauft";

type Opt = { id: string; label: string };
type LinkedPages = { pages: { items: { id: string; title: string }[] }[] } | undefined;

type Form = {
  name: string;
  typ: string;
  status: string;
  kuenstlerId: string;
  jahr: string;
  glasurIds: string[];
  masse: string;
  bildnachweis: string;
  lagerortId: string;
  galerieId: string;
  preis: string;
  website: boolean;
  notiz: string;
  verkauftAm: string;
};

function asOpts(v: unknown): Opt[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(asOpts);
  if (typeof v === "object" && "id" in (v as object)) {
    const o = v as { id: string; label?: string };
    return [{ id: o.id, label: o.label ?? "" }];
  }
  return [];
}

function toOptions(data: LinkedPages): Opt[] {
  return (data?.pages.flatMap((p) => p.items) ?? []).map((o) => ({ id: o.id, label: o.title }));
}

function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

function parseNumber(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function link(id: string) {
  return id ? [id] : [];
}

function toForm(f: Record<string, unknown>): Form {
  return {
    name: str(f.name),
    typ: asOpts(f.typ)[0]?.label ?? "",
    status: asOpts(f.status)[0]?.label ?? "",
    kuenstlerId: asOpts(f.kuenstler)[0]?.id ?? "",
    jahr: str(f.jahr),
    glasurIds: asOpts(f.glasur).map((g) => g.id),
    masse: str(f.masse),
    bildnachweis: str(f.bildnachweis),
    lagerortId: asOpts(f.lagerort)[0]?.id ?? "",
    galerieId: asOpts(f.galerie)[0]?.id ?? "",
    preis: str(f.preis),
    website: f.website === true,
    notiz: str(f.notiz),
    verkauftAm: str(f.verkauftAm).slice(0, 10),
  };
}

function Label({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-base font-medium mb-2">
      {children}
    </label>
  );
}

function OptionSelect({ id, value, onChange, options, placeholder }: { id: string; value: string; onChange: (v: string) => void; options: Opt[]; placeholder: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-12 rounded-md border border-input bg-background px-3 text-base">
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 px-4 rounded-full border text-base ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"}`}
    >
      {children}
    </button>
  );
}

function EditForm({ recordId, initial, inv, onDone }: { recordId: string; initial: Form; inv: string; onDone: () => void }) {
  const [form, setForm] = useState<Form>(initial);
  const [busy, setBusy] = useState(false);
  const update = useRecordUpdate({ from: ds.unikate, fields: writableFields });
  const typOptions = useFieldOptions({ from: ds.unikate, select: adminFields, field: "typ" }).options as Opt[];
  const statusOptions = useFieldOptions({ from: ds.unikate, select: adminFields, field: "status" }).options as Opt[];
  const kuenstler = toOptions(useLinkedRecords({ from: ds.unikate, select: adminFields, field: "kuenstler", sortOrder: "ASC" }).data as LinkedPages);
  const glasuren = toOptions(useLinkedRecords({ from: ds.unikate, select: adminFields, field: "glasur", sortOrder: "ASC" }).data as LinkedPages);
  const lagerorte = toOptions(useLinkedRecords({ from: ds.unikate, select: adminFields, field: "lagerort", sortOrder: "ASC" }).data as LinkedPages);
  const galerien = toOptions(useLinkedRecords({ from: ds.unikate, select: adminFields, field: "galerie", sortOrder: "ASC" }).data as LinkedPages);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((s) => ({ ...s, [k]: v }));

  async function save() {
    if (!form.name.trim()) {
      toast.error("Bitte einen Namen eingeben.");
      return;
    }
    setBusy(true);
    try {
      await update.mutateAsync({
        recordId,
        fields: {
          name: form.name.trim(),
          typ: form.typ,
          status: form.status,
          kuenstler: link(form.kuenstlerId),
          jahr: parseNumber(form.jahr),
          glasur: form.glasurIds,
          masse: form.masse.trim(),
          bildnachweis: form.bildnachweis.trim(),
          lagerort: link(form.lagerortId),
          galerie: form.status === KOMMISSION ? link(form.galerieId) : [],
          preis: parseNumber(form.preis),
          website: form.website,
          notiz: form.notiz.trim(),
          verkauftAm: form.status === VERKAUFT ? form.verkauftAm || new Date().toISOString().slice(0, 10) : null,
        },
      } as never);
      window.dispatchEvent(new CustomEvent(EVENT_UNIKAT_CHANGED, { detail: { id: recordId } }));
      toast.success("Änderungen gespeichert.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  }

  if (!update.enabled) {
    return <p className="px-4 text-base text-muted-foreground">Nur der Admin kann alle Felder bearbeiten.</p>;
  }

  return (
    <div className="px-4 pb-8 space-y-5">
      <p className="text-sm text-muted-foreground">Inventarnummer {inv} wird automatisch vergeben und lässt sich nicht ändern.</p>
      <div>
        <Label htmlFor="a-name">Name</Label>
        <Input id="a-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-12 text-base" />
      </div>
      <div>
        <p className="text-base font-medium mb-2">Typ</p>
        <div className="flex flex-wrap gap-2">
          {typOptions.map((t) => (
            <Chip key={t.id} active={form.typ === t.label} onClick={() => set("typ", t.label)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="text-base font-medium mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <Chip key={s.id} active={form.status === s.label} onClick={() => set("status", s.label)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
      {form.status === VERKAUFT && (
        <div>
          <Label htmlFor="a-verkauft">Verkauft am</Label>
          <Input id="a-verkauft" type="date" value={form.verkauftAm} onChange={(e) => set("verkauftAm", e.target.value)} className="h-12 text-base" />
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="a-lagerort">Lagerort</Label>
          <OptionSelect id="a-lagerort" value={form.lagerortId} onChange={(v) => set("lagerortId", v)} options={lagerorte} placeholder="Kein Lagerort" />
        </div>
        {form.status === KOMMISSION && (
          <div>
            <Label htmlFor="a-galerie">Galerie</Label>
            <OptionSelect id="a-galerie" value={form.galerieId} onChange={(v) => set("galerieId", v)} options={galerien} placeholder="Galerie wählen" />
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="a-kuenstler">Künstler:in</Label>
          <OptionSelect id="a-kuenstler" value={form.kuenstlerId} onChange={(v) => set("kuenstlerId", v)} options={kuenstler} placeholder="Bitte wählen" />
        </div>
        <div>
          <Label htmlFor="a-jahr">Jahr</Label>
          <Input id="a-jahr" inputMode="numeric" value={form.jahr} onChange={(e) => set("jahr", e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-12 text-base" />
        </div>
      </div>
      <div>
        <p className="text-base font-medium mb-2">Glasur</p>
        <div className="flex flex-wrap gap-2">
          {glasuren.map((g) => (
            <Chip
              key={g.id}
              active={form.glasurIds.includes(g.id)}
              onClick={() => set("glasurIds", form.glasurIds.includes(g.id) ? form.glasurIds.filter((x) => x !== g.id) : [...form.glasurIds, g.id])}
            >
              {g.label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="a-masse">Maße</Label>
          <Input id="a-masse" value={form.masse} onChange={(e) => set("masse", e.target.value)} className="h-12 text-base" />
        </div>
        <div>
          <Label htmlFor="a-preis">Preis intern (€)</Label>
          <Input id="a-preis" inputMode="decimal" value={form.preis} onChange={(e) => set("preis", e.target.value)} className="h-12 text-base" />
        </div>
      </div>
      <div>
        <Label htmlFor="a-bildnachweis">Bildnachweis</Label>
        <Input id="a-bildnachweis" value={form.bildnachweis} onChange={(e) => set("bildnachweis", e.target.value)} className="h-12 text-base" />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <label htmlFor="a-website" className="text-base font-medium">
          Auf Website zeigen
        </label>
        <Switch id="a-website" checked={form.website} onCheckedChange={(v) => set("website", v)} />
      </div>
      <div>
        <Label htmlFor="a-notiz">Notiz</Label>
        <Textarea id="a-notiz" rows={3} value={form.notiz} onChange={(e) => set("notiz", e.target.value)} className="text-base" />
      </div>
      <Button className="w-full h-12 text-base" onClick={save} disabled={busy}>
        {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
        {busy ? "Wird gespeichert …" : "Alle Änderungen speichern"}
      </Button>
    </div>
  );
}

export default function Block() {
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    const onEdit = (e: Event) => setRecordId((e as CustomEvent<{ id: string }>).detail.id);
    window.addEventListener(EVENT_ADMIN_EDIT, onEdit);
    return () => window.removeEventListener(EVENT_ADMIN_EDIT, onEdit);
  }, []);

  const { data, status } = useRecord({ from: ds.unikate, select: adminFields, recordId });
  const record = data as { id: string; fields: Record<string, unknown> } | undefined | null;

  return (
    <Sheet open={!!recordId} onOpenChange={(o) => !o && setRecordId(null)}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Alle Felder bearbeiten</SheetTitle>
          <SheetDescription>{record ? str(record.fields.name) : "Stück wird geladen …"}</SheetDescription>
        </SheetHeader>
        {status === "error" ? (
          <p role="alert" className="px-4 text-base text-destructive">
            Das Stück konnte nicht geladen werden.
          </p>
        ) : record && recordId ? (
          <EditForm key={record.id} recordId={recordId} initial={toForm(record.fields)} inv={str(record.fields.inv)} onDone={() => setRecordId(null)} />
        ) : (
          <div className="flex items-center gap-2 px-4 text-base text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Wird geladen …
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

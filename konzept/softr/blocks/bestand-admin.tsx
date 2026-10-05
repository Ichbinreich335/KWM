import { useEffect, useState } from "react";
import { datasource, q, useRecord, useRecordUpdate } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({ unikate: "unikate" });

const readFields = q.select({
  inv: "glG6V",
  name: "7IBVW",
  status: "SEUyZ",
  preis: "N9yfT",
  website: "e5hSY",
  verkauftAm: "48BXo",
});
const adminFields = q.select({ preis: "N9yfT", website: "e5hSY", verkauftAm: "48BXo" });

const EVENT_ADMIN_EDIT = "kwm:unikat-admin-bearbeiten";
const EVENT_UNIKAT_CHANGED = "kwm:unikat-geaendert";
const VERKAUFT = "verkauft";

type Form = { preis: string; website: boolean; verkauftAm: string };

function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}
function statusLabel(v: unknown): string {
  return v && typeof v === "object" && "label" in v ? String((v as { label: unknown }).label) : "";
}
function parseNumber(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function AdminForm({ recordId, initial, sold, onDone }: { recordId: string; initial: Form; sold: boolean; onDone: () => void }) {
  const [form, setForm] = useState<Form>(initial);
  const [busy, setBusy] = useState(false);
  const update = useRecordUpdate({ from: ds.unikate, fields: adminFields });

  async function save() {
    if (form.preis.trim() && parseNumber(form.preis) === null) {
      toast.error("Bitte beim Preis nur eine Zahl eingeben.");
      return;
    }
    setBusy(true);
    try {
      await update.mutateAsync({
        recordId,
        fields: { preis: parseNumber(form.preis), website: form.website, ...(sold ? { verkauftAm: form.verkauftAm || null } : {}) },
      } as never);
      window.dispatchEvent(new CustomEvent(EVENT_UNIKAT_CHANGED, { detail: { id: recordId } }));
      toast.success("Gespeichert.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  }

  if (!update.enabled) return <p className="px-4 text-base text-muted-foreground">Nur der Admin kann Preis und Website ändern.</p>;

  return (
    <div className="px-4 pb-8 space-y-5">
      <div>
        <label htmlFor="a-preis" className="block text-base font-medium mb-2">
          Preis intern (€)
        </label>
        <Input id="a-preis" inputMode="decimal" value={form.preis} onChange={(e) => setForm((s) => ({ ...s, preis: e.target.value }))} className="h-12 text-base" />
        <p className="text-sm text-muted-foreground mt-1.5">Sehen alle Mitarbeitenden, erscheint nie auf der Website.</p>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <label htmlFor="a-website" className="text-base font-medium">
            Auf Website zeigen
          </label>
          <p className="text-sm text-muted-foreground">Für die spätere Anbindung an die Website.</p>
        </div>
        <Switch id="a-website" checked={form.website} onCheckedChange={(v) => setForm((s) => ({ ...s, website: v }))} />
      </div>
      {sold && (
        <div>
          <label htmlFor="a-verkauft" className="block text-base font-medium mb-2">
            Verkauft am
          </label>
          <Input id="a-verkauft" type="date" value={form.verkauftAm} onChange={(e) => setForm((s) => ({ ...s, verkauftAm: e.target.value }))} className="h-12 text-base" />
        </div>
      )}
      <Button className="w-full h-12 text-base" onClick={save} disabled={busy}>
        {busy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden /> : null}
        {busy ? "Wird gespeichert …" : "Speichern"}
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

  const { data, status } = useRecord({ from: ds.unikate, select: readFields, recordId });
  const record = data as { id: string; fields: Record<string, unknown> } | undefined | null;
  const f = record?.fields;

  return (
    <Sheet open={!!recordId} onOpenChange={(o) => !o && setRecordId(null)}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Preis und Website</SheetTitle>
          <SheetDescription>{f ? `${str(f.name)} · ${str(f.inv)}` : "Stück wird geladen …"}</SheetDescription>
        </SheetHeader>
        {status === "error" ? (
          <p role="alert" className="px-4 text-base text-destructive">
            Das Stück konnte nicht geladen werden.
          </p>
        ) : record && f && recordId ? (
          <AdminForm
            key={record.id}
            recordId={recordId}
            sold={statusLabel(f.status) === VERKAUFT}
            initial={{ preis: str(f.preis), website: f.website === true, verkauftAm: str(f.verkauftAm).slice(0, 10) }}
            onDone={() => setRecordId(null)}
          />
        ) : (
          <div className="flex items-center gap-2 px-4 text-base text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Wird geladen …
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

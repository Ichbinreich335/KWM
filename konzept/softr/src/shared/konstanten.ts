// Fachliche Konstanten und Status-Farben. Einzige Quelle für alle Blöcke.

export const PAGE_SIZE = 100;

export const VERFUEGBAR = "verfügbar";
export const RESERVIERT = "reserviert";
export const VERKAUFT = "verkauft";
export const KOMMISSION = "in Kommission";
export const AUSGESTELLT = "ausgestellt";
export const ROHLING = "Rohling";
export const GLASIERT = "glasiert";
export const AUSSER_HAUS_ORT = "Außer Haus";

export const isAusserHaus = (status: string) => status === KOMMISSION || status === AUSGESTELLT;

export const EVENT_ADMIN_EDIT = "kwm:unikat-admin-bearbeiten";
export const EVENT_UNIKAT_CHANGED = "kwm:unikat-geaendert";

export const userProperties = { role: "z0b2k" };

// Ruhige Variante für Badges in Listen und Tabellen.
export const STATUS_BADGE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-100 text-emerald-800 border-emerald-200",
  [RESERVIERT]: "bg-amber-100 text-amber-900 border-amber-200",
  [VERKAUFT]: "bg-zinc-100 text-zinc-600 border-zinc-200",
  [KOMMISSION]: "bg-sky-100 text-sky-800 border-sky-200",
  [AUSGESTELLT]: "bg-violet-100 text-violet-800 border-violet-200",
  [ROHLING]: "bg-stone-100 text-stone-700 border-stone-200",
  [GLASIERT]: "bg-teal-50 text-teal-800 border-teal-200",
};

// Kräftige Variante für den gewählten Auswahl-Knopf.
export const STATUS_ACTIVE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-600 text-white border-emerald-600",
  [RESERVIERT]: "bg-amber-400 text-amber-950 border-amber-400",
  [VERKAUFT]: "bg-zinc-500 text-white border-zinc-500",
  [KOMMISSION]: "bg-sky-600 text-white border-sky-600",
  [AUSGESTELLT]: "bg-violet-700 text-white border-violet-700",
};

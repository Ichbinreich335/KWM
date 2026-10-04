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

// Farbe trägt nur den Status eines Unikats. Der Zustand der Editionsware (Rohling, glasiert) bleibt neutral.
export const STATUS_BADGE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-50 text-emerald-800 border-emerald-200",
  [RESERVIERT]: "bg-amber-50 text-amber-900 border-amber-200",
  [VERKAUFT]: "bg-zinc-100 text-zinc-700 border-zinc-200",
  [KOMMISSION]: "bg-sky-50 text-sky-800 border-sky-200",
  [AUSGESTELLT]: "bg-violet-50 text-violet-800 border-violet-200",
  [ROHLING]: "bg-background text-muted-foreground border-border",
  [GLASIERT]: "bg-muted text-foreground border-border",
};

// Kräftige Variante für den gewählten Status-Knopf. Weiße Schrift nur auf ausreichend dunklen Tönen.
export const STATUS_ACTIVE: Record<string, string> = {
  [VERFUEGBAR]: "bg-emerald-600 text-white border-emerald-600",
  [RESERVIERT]: "bg-amber-400 text-amber-950 border-amber-400",
  [VERKAUFT]: "bg-zinc-600 text-white border-zinc-600",
  [KOMMISSION]: "bg-sky-600 text-white border-sky-600",
  [AUSGESTELLT]: "bg-violet-700 text-white border-violet-700",
};

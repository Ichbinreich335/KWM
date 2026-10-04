// Regeln für einheitliche Bausteine. Läuft in build.mjs vor jedem Schreiben: Ein Verstoß bricht den Build ab.
// Grundsatz: Seiten (src/blocks) nutzen nur die Bausteine aus src/shared/ui.tsx. Rahmen, Felder, Knöpfe,
// Auswahllisten und Fenster werden nie auf einer Seite selbst gestaltet.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SHADCN_GEKAPSELT = ["button", "input", "textarea", "badge", "switch", "checkbox", "select", "native-select"];
const REGELN = [
  { re: new RegExp(`from "@/components/ui/(${SHADCN_GEKAPSELT.join("|")})"`), text: "shadcn-Baustein direkt importiert. Stattdessen Knopf, Feld, Textfeld, Auswahl, Etikett, SchalterFeld oder Ankreuzfeld aus ui.tsx." },
  { re: /<(select|input|textarea)\b/, text: "Rohes Formularelement. Stattdessen Auswahl oder Feld bzw. Textfeld aus ui.tsx." },
  { re: /\bLINE\b|\b(border|divide)-(neutral|gray|zinc|slate|stone|input|border|foreground|muted|black|white)\b/, text: "Rahmenfarbe auf der Seite gesetzt. Rahmen kommen nur aus den Bausteinen bzw. PANEL_CLASS." },
  { re: /["`][^"`]*\bborder(?![-\w])(?![^"`]*border-destructive)[^"`]*["`]/, text: "Rahmen von Hand gebaut. Boxen nur über PANEL_CLASS bzw. PANEL_GRID_CLASS." },
  { re: /<(DialogContent|PopoverContent|DropdownMenuContent|DrawerContent)\b(?![^>]*(DIALOG_CLASS|POPOVER_CLASS))/, text: "Fenster oder Menü ohne gemeinsamen Stil. DIALOG_CLASS bzw. POPOVER_CLASS verwenden." },
];

export function pruefeEinheitlich(root) {
  const fehler = [];
  const blocks = join(root, "src", "blocks");
  for (const datei of readdirSync(blocks).filter((f) => f.endsWith(".tsx"))) {
    readFileSync(join(blocks, datei), "utf8")
      .split("\n")
      .forEach((zeile, i) => {
        if (zeile.trimStart().startsWith("//")) return;
        for (const r of REGELN) if (r.re.test(zeile)) fehler.push(`src/blocks/${datei}:${i + 1}: ${r.text}\n    ${zeile.trim().slice(0, 140)}`);
      });
  }
  // Gestaltung (Rahmen) gehört nur in ui.tsx, nicht in die übrigen gemeinsamen Dateien.
  for (const datei of ["konstanten.ts", "daten.ts"]) {
    readFileSync(join(root, "src", "shared", datei), "utf8")
      .split("\n")
      .forEach((zeile, i) => {
        if (/\bborder-(?!bottom|top|collapse)[a-z]/.test(zeile)) fehler.push(`src/shared/${datei}:${i + 1}: Rahmenklasse außerhalb von ui.tsx.\n    ${zeile.trim().slice(0, 140)}`);
      });
  }
  // In ui.tsx: Jeder Rahmen trägt die App-Rahmenfarbe (LINE) oder eine bewusste Sonderfarbe (Status, Fehler, Auswahl).
  readFileSync(join(root, "src", "shared", "ui.tsx"), "utf8")
    .split("\n")
    .forEach((zeile, i) => {
      if (zeile.trimStart().startsWith("//") || !/\bborder(?![-\w])/.test(zeile)) return;
      if (/\$\{LINE\}|LINE\b.*=|STATUS_|CHIP_BASE|destructive|border-(primary|transparent)/.test(zeile)) return;
      fehler.push(`src/shared/ui.tsx:${i + 1}: Rahmen ohne App-Rahmenfarbe (LINE).\n    ${zeile.trim().slice(0, 140)}`);
    });
  // In ui.tsx darf jeder gekapselte shadcn-Baustein nur einmal vorkommen: in seiner Hülle.
  const ui = readFileSync(join(root, "src", "shared", "ui.tsx"), "utf8")
    .split("\n")
    .filter((z) => !z.trimStart().startsWith("//"))
    .join("\n");
  for (const tag of ["Button", "Input", "Textarea", "Badge", "Switch", "Checkbox", "select"]) {
    const n = (ui.match(new RegExp(`<${tag}\\b`, "g")) ?? []).length;
    if (n !== 1) fehler.push(`src/shared/ui.tsx: <${tag}> kommt ${n}-mal vor, erlaubt ist genau einmal (in der Hülle). Sonst den Baustein nutzen.`);
  }
  return fehler;
}

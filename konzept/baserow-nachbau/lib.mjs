// Gemeinsame Helfer für die Aufbau-Skripte: .env lesen, anmelden, REST-Aufrufe.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HIER = path.dirname(fileURLToPath(import.meta.url));
export const WURZEL = path.resolve(HIER, "../..");
const IDS_DATEI = path.join(HIER, "ids.local.json");

function leseEnv() {
  const datei = path.join(WURZEL, ".env");
  if (!existsSync(datei)) throw new Error(".env fehlt im Worktree, siehe README.md");
  const env = {};
  for (const zeile of readFileSync(datei, "utf8").split("\n")) {
    const m = zeile.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

export const ENV = leseEnv();
const BASIS = ENV.BASEROW_URL;
let jwt = null;

export async function anmelden() {
  const r = await fetch(`${BASIS}/api/user/token-auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ENV.BASEROW_EMAIL, password: ENV.BASEROW_PASSWORD }),
  });
  if (!r.ok) throw new Error(`Anmeldung fehlgeschlagen: ${r.status} ${await r.text()}`);
  jwt = (await r.json()).access_token;
}

// Baserow sperrt eine Tabelle kurz, solange ein Schemawechsel läuft. Dann kurz warten und neu versuchen.
const SPERRE = "ERROR_FAILED_TO_LOCK_TABLE_DUE_TO_CONFLICT";
const MAX_VERSUCHE = 8;
const WARTEZEIT_MS = 500;

export async function api(methode, pfad, body, { erlaubtFehler = false } = {}) {
  const istForm = body instanceof FormData;
  let r;
  let text;
  for (let versuch = 1; ; versuch++) {
    r = await fetch(`${BASIS}/api${pfad}`, {
      method: methode,
      headers: {
        Authorization: `JWT ${jwt}`,
        ...(body && !istForm ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? (istForm ? body : JSON.stringify(body)) : undefined,
    });
    text = await r.text();
    if (r.status !== 409 || !text.includes(SPERRE) || versuch === MAX_VERSUCHE) break;
    await new Promise((weiter) => setTimeout(weiter, WARTEZEIT_MS * versuch));
  }
  const daten = text ? JSON.parse(text) : null;
  if (!r.ok) {
    if (erlaubtFehler) return { fehler: r.status, daten };
    throw new Error(`${methode} ${pfad} → ${r.status}: ${text.slice(0, 800)}`);
  }
  return daten;
}

export function ladeIds() {
  return existsSync(IDS_DATEI) ? JSON.parse(readFileSync(IDS_DATEI, "utf8")) : {};
}

export function speichereIds(ids) {
  writeFileSync(IDS_DATEI, JSON.stringify(ids, null, 2));
}

/** CSV mit Semikolon und Anführungszeichen (Softr-Export) lesen. */
export function leseCsv(datei) {
  const text = readFileSync(path.join(WURZEL, "konzept/softr/export", datei), "utf8").replace(/^﻿/, "");
  const zeilen = [];
  let feld = "";
  let zeile = [];
  let inZitat = false;
  for (let i = 0; i < text.length; i++) {
    const z = text[i];
    if (inZitat) {
      if (z === '"' && text[i + 1] === '"') { feld += '"'; i++; }
      else if (z === '"') inZitat = false;
      else feld += z;
    } else if (z === '"') inZitat = true;
    else if (z === ";") { zeile.push(feld); feld = ""; }
    else if (z === "\n") { zeile.push(feld); zeilen.push(zeile); zeile = []; feld = ""; }
    else if (z !== "\r") feld += z;
  }
  if (feld || zeile.length) { zeile.push(feld); zeilen.push(zeile); }
  const [kopf, ...rest] = zeilen;
  return rest.map((w) => Object.fromEntries(kopf.map((k, i) => [k, w[i] ?? ""])));
}

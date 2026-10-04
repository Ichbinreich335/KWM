// Gemeinsamer Zugriff auf die Softr-Datenbank-API und auf Cloudflare R2 (S3-kompatibel).
// Zugangsdaten nur aus Umgebungsvariablen, nie aus Dateien im Repo.
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const API = "https://tables-api.softr.io/api/v1";
const PAGE = 200; // Höchstwert der API je Abruf

export function env(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Umgebungsvariable ${name} fehlt.`);
  return v;
}

// Softr begrenzt auf 40 Lese- bzw. 30 Schreibzugriffe je Sekunde. Bei 429 oder 5xx kurz warten und erneut versuchen.
export async function softr(path, { method = "GET", body } = {}) {
  for (let versuch = 1; ; versuch++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { "Softr-Api-Key": env("SOFTR_API_KEY"), "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.status === 204 ? null : res.json();
    if ((res.status === 429 || res.status >= 500) && versuch < 5) {
      await new Promise((r) => setTimeout(r, 1000 * versuch));
      continue;
    }
    throw new Error(`Softr ${method} ${path}: ${res.status} ${await res.text()}`);
  }
}

// Die API liefert Listen je nach Endpunkt unter data, records, tables oder items.
export function liste(body) {
  return body?.data ?? body?.records ?? body?.tables ?? body?.items ?? [];
}

export async function alleDatensaetze(db, tableId) {
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const seite = liste(await softr(`/databases/${db}/tables/${tableId}/records?limit=${PAGE}&offset=${offset}`));
    out.push(...seite);
    if (seite.length < PAGE) return out;
  }
}

export function r2() {
  // R2_ENDPOINT nur für Tests mit einem lokalen S3-Ersatz.
  const endpoint = process.env.R2_ENDPOINT ?? `https://${env("R2_ACCOUNT_ID")}.${process.env.R2_JURISDICTION === "eu" ? "eu." : ""}r2.cloudflarestorage.com`;
  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: !!process.env.R2_ENDPOINT,
    credentials: { accessKeyId: env("R2_ACCESS_KEY_ID"), secretAccessKey: env("R2_SECRET_ACCESS_KEY") },
  });
}

export async function r2Exists(client, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
    return true;
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NotFound") return false;
    throw err;
  }
}

export async function r2Put(client, key, body, contentType) {
  await client.send(new PutObjectCommand({ Bucket: env("R2_BUCKET"), Key: key, Body: body, ContentType: contentType }));
}

export async function r2GetJson(client, key) {
  const res = await client.send(new GetObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
  return JSON.parse(await res.Body.transformToString());
}

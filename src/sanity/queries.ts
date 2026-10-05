// Alle GROQ-Abfragen der Website an einer Stelle. Nur freigegebene Felder, kein `...`;
// `_id` und `_type` stehen immer dabei, damit sich die Inhalte später im Studio anklicken lassen.
// Nie Preise, Bestand, Lagerorte, Verfügbarkeit oder Inventarnummern abfragen (öffentliches Dataset).
import { defineQuery } from 'groq';

const BILD = /* groq */ `{
  "asset": asset->{ _id, url, "breite": metadata.dimensions.width, "hoehe": metadata.dimensions.height },
  alt,
  hotspot { x, y, width, height },
  crop { top, bottom, left, right }
}`;

const BILD_MIT_NACHWEIS = /* groq */ `{
  "asset": asset->{ _id, url, "breite": metadata.dimensions.width, "hoehe": metadata.dimensions.height },
  alt,
  bildunterschrift,
  nachweis,
  hotspot { x, y, width, height },
  crop { top, bottom, left, right }
}`;

export const SEITEN_QUERY = defineQuery(/* groq */ `*[_type == "seite"]{
  _id, _type, titel, einleitung, beschreibung
}`);

export const HINWEISE_QUERY = defineQuery(/* groq */ `*[_type == "hinweis"] | order(gueltigVon asc){
  _id, _type, text,
  "von": gueltigVon,
  "bis": gueltigBis
}`);

export const AUSSTELLUNGEN_QUERY = defineQuery(/* groq */ `*[_type == "ausstellung"] | order(start asc){
  _id, _type, titel, art, haus, adresse, start, ende, spotlight,
  eroeffnung, oeffnungszeiten, oeffnungszeitenBezeichnung, kooperation,
  beschreibung,
  link { text, url },
  "ort": ort->{ _id, _type, stadt, land },
  "galerie": galerie->{ _id, _type, name },
  hauptbild ${BILD_MIT_NACHWEIS},
  bilder[] ${BILD_MIT_NACHWEIS}
}`);

export const ORTE_QUERY = defineQuery(/* groq */ `*[_type == "ort"] | order(reihenfolge asc){
  _id, _type, stadt, land, kurztext, reihenfolge, haeuser,
  bild ${BILD}
}`);

export const ARCHIV_QUERY = defineQuery(/* groq */ `*[_type == "archivEintrag"] | order(jahr desc, reihenfolge asc){
  _id, _type, jahr, beginnJahr, reihenfolge, inListe, titel, ortszeile, datum,
  link { text, url },
  haus,
  "ortId": ort._ref,
  "galerie": galerie->{ _id, _type, name }
}`);

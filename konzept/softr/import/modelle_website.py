"""Maße und Fotos der Modelle aus der Manufaktur-Seite der Website (site/manufaktur.html, Bilder in site/img/kwm).
Geschirr über die Artikelnummer, Edition über den Namen. Ein Bild gilt für alle Modelle, die in seiner Bildunterschrift stehen;
das erste Vorkommen gewinnt. Unsichere Zuordnungen (Kugelvasen H ca. 20 cm, Zylindervase groß) bleiben weg.
Ausgabe: Liste {id, fields} für database_update_record (nur leere Felder werden gefüllt)."""
import json
import re
import sys

BILD_URL = "https://raw.githubusercontent.com/Ichbinreich335/KWM/5ad2295fbab53b65191bad2a9d32396b1bbbce14/site/img/kwm/"
EDITION_NAMEN = {  # Name auf der Website → Artikelnr. im Katalog
    "Zylindervase, klein": "2022", "Kugelvase, klein": "2021", "Tulpenvase": "2003",
    "Plattenteller, lang": "2019", "Plattenteller, klein": "2015", "Plattenteller, mittel": "2016",
    "Plattenteller, groß": "2017", "Plattenteller, extragroß": "2018",
    "Pflanzenübertopf, klein": "2012", "Pflanzenübertopf, mittel": "2013", "Pflanzenübertopf, groß": "2014",
    "Große Schale": "55",
}


def eintraege(html: str):
    for fig in re.findall(r'<figure class="set[^"]*">(.*?)</figure>', html, re.S):
        bild = re.search(r'src="img/kwm/([^"]+)"', fig)
        for name, masse, nr in re.findall(r"<li[^>]*><span>(.*?)</span><span>(.*?)</span><span>(.*?)</span></li>", fig):
            if "<em>" in name:
                continue
            nr = nr.removeprefix("Nr. ").strip() or EDITION_NAMEN.get(name, "")
            if nr:
                yield nr, masse, bild.group(1) if bild else None


def main(modelle_json: str) -> None:
    modelle = {m["fields"]["BNpSN"]: m for m in json.load(open(modelle_json))}
    html = open("site/manufaktur.html", encoding="utf-8").read()
    updates: dict[str, dict] = {}
    for nr, masse, bild in eintraege(html):
        m = modelle.get(nr)
        if not m:
            continue
        f = updates.setdefault(m["id"], {})
        if masse and not m["fields"].get("h65qx") and "h65qx" not in f:
            f["h65qx"] = masse
        if bild and not m["fields"].get("GbUfa") and "GbUfa" not in f:
            f["GbUfa"] = [{"url": BILD_URL + bild, "filename": bild}]
    print(json.dumps([{"id": i, "fields": f} for i, f in updates.items() if f], ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1])

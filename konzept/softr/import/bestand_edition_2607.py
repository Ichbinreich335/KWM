"""Editionsbestand aus der handschriftlichen Preisliste VK, Stand 31.07.2026 (Spalten „fertig“ und „geschrüht“).
„fertig“ wird als glasiert erfasst. Glasur und Brand stehen nicht auf der Liste und bleiben leer, außer bei Craquelée (Name des Modells).
Der Posten 2001 glasiert ersetzt den bisherigen Demo-Posten (wird per Update angeglichen, nicht neu angelegt)."""
import json

CRAQ = "YszeHciwl8nyPR"
NOTIZ = "Bestandsliste vom 31.07.2026"

MODELLE = {  # Nr oder Name → (Modell-ID, Anzeigename)
    "2002": ("TJ92bepqFKOhb3", "2002 · Zylindervase Craquelée"),
    "2003": ("0rEygBOjiwC0EV", "2003 · Tulpenvase"),
    "2012": ("ExwbTUsWR8bdIs", "2012 · Pflanzenübertopf, klein"),
    "2013": ("7Mlmb3HSgYY4Oj", "2013 · Pflanzenübertopf, mittel"),
    "2014": ("Ay4CNYh170PRlM", "2014 · Pflanzenübertopf, groß"),
    "2015": ("5AQnpQwI6ejvQ8", "2015 · Plattenteller, klein"),
    "2016": ("m37FO2Vntvu7HJ", "2016 · Plattenteller, mittel"),
    "2017": ("LENXTrIcWpKylo", "2017 · Plattenteller, groß"),
    "2018": ("rEo8YBjovbAGgQ", "2018 · Plattenteller, extragroß"),
    "2018a": ("PjULmwQdTkIVrh", "2018a · Plattenteller, extragroß, neu"),
    "2019": ("QHCaaJDoUpceTG", "2019 · Plattenteller, lang"),
    "2021": ("SghlAg0lVviNKP", "2021 · Kugelvase, klein"),
    "2022": ("LOD9eGn4g8vf2G", "2022 · Zylindervase, klein"),
    "2028": ("9KuPrTzqqME0GX", "2028 · BB-Teller, groß"),
    "2029": ("ItHvTHuTT24FfM", "2029 · BB-Teller, klein"),
    "sushi-klein": ("LBsMkHKnF7E9TT", "Sushi-Teller, klein"),
    "sushi-mittel": ("JnnEjVWrBS2tKy", "Sushi-Teller, mittel"),
    "roehre": ("8hUiBvcGu0OIBf", "Röhrenvase"),
}

LISTE = [  # Schlüssel, fertig, geschrüht
    ("2002", 15, 26), ("2003", 92, 57), ("2012", 55, 24), ("2013", 2, 13), ("2014", 2, 3),
    ("2015", 70, 280), ("2016", 103, 200), ("2017", 25, 180), ("2018", 0, 73), ("2018a", 10, 57),
    ("2019", 5, 100), ("2021", 67, 0), ("2022", 28, 0), ("2028", 18, 60), ("2029", 25, 89),
    ("sushi-klein", 33, 0), ("sushi-mittel", 38, 35), ("roehre", 200, 60),
]


def posten(key: str, zustand: str, anzahl: int) -> dict:
    modell_id, name = MODELLE[key]
    glasur = CRAQ if zustand == "glasiert" and "Craquelée" in name else None
    f = {"jxN6x": [modell_id], "WUkN3": zustand, "Ciiwp": anzahl, "lyJky": NOTIZ, "LFUIR": f"{name} · {'Craquelée' if glasur else zustand}"}
    if glasur:
        f["pbGEk"] = [glasur]
    return {"fields": f}


records = [posten(k, z, n) for k, fertig, geschrueht in LISTE for z, n in (("glasiert", fertig), ("geschrüht", geschrueht)) if n > 0]

if __name__ == "__main__":
    print(json.dumps(records, ensure_ascii=False, separators=(",", ":")))

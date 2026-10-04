"""Katalog der Werkstatt aus den Anfrageformularen (Stand 04/2026) für die Tabelle „Modelle“.
VK-Preise der Editionen aus der gedruckten Preisliste VK (Stand 01/2024). Bestandsmengen werden nicht importiert."""
import json

CRAQ = "YszeHciwl8nyPR"
GESCHIRR_GLASUREN = ["kwoFt5vnkagLhc", "wADu0BAVSRusGF", "JsHGhEPTbznnBC", "6NbflckOY60tXa", "MVRtC1UzGVndn7", "AiDlu3d4lUFWq6"]

EDITIONEN = [  # Nr, Name, englisch, Typ, VK
    ("2001", "Kugelvase Craquelée", "spherical vase Craquelée", "Vase", 400),
    ("2002", "Zylindervase Craquelée", "cylindrical vase Craquelée", "Vase", 400),
    ("2003", "Tulpenvase", "tulip vase", "Vase", 400),
    ("2004", "Enghalsvase", "flat-necked vase", "Vase", 500),
    ("2012", "Pflanzenübertopf, klein", "plant pot, small", "Übertopf", 400),
    ("2013", "Pflanzenübertopf, mittel", "plant pot, medium", "Übertopf", 500),
    ("2014", "Pflanzenübertopf, groß", "plant pot, large", "Übertopf", 600),
    ("2015", "Plattenteller, klein", "flat dish, small", "Teller", 50),
    ("2016", "Plattenteller, mittel", "flat dish, medium", "Teller", 95),
    ("2017", "Plattenteller, groß", "flat dish, large", "Teller", 160),
    ("2018", "Plattenteller, extragroß", "flat dish, extra large", "Teller", 310),
    ("2018a", "Plattenteller, extragroß, neu", "flat dish, extra large, new", "Teller", 250),
    ("2019", "Plattenteller, lang", "flat dish, long", "Teller", 200),
    ("2020", "Kugeldose", "spherical jar", "Dose", 110),
    ("2021", "Kugelvase, klein", "spherical vase, small", "Vase", 120),
    ("2022", "Zylindervase, klein", "cylindrical vase, small", "Vase", 120),
    ("2026", "Fußschale", "footed bowl", "Schale", 250),
    ("2028", "BB-Teller, groß", "BB-plate, large", "Teller", 155),
    ("2029", "BB-Teller, klein", "BB-plate, small", "Teller", 70),
    ("2030", "Mi-Kaffeebecher, groß", "Mi-coffee cup, large", "Becher", 50),
    ("2031", "Mi-Kaffeebecher, klein", "Mi-coffee cup, small", "Becher", 35),
    ("2032", "Blätter, klein", "leaves, small", "Blatt", 65),
    ("2033", "Blätter, groß", "leaves, large", "Blatt", 120),
    ("2034", "Blätter, flach", "leaves, flat", "Blatt", 95),
    ("2037", "Zwiebeltopf, mittel", "", "Topf", None),
    ("2038", "Zwiebeltopf, groß", "", "Topf", None),
    ("2039", "Tulpenvase, klein", "", "Vase", None),
]

GESCHIRR = [  # Nr, Name, englisch, Typ
    ("1", "Salatschüssel", "salad bowl", "Schale"),
    ("2", "Salatschüssel, mittel", "salad bowl, medium", "Schale"),
    ("3", "Koreanische Suppenschale", "Korean soup bowl", "Schale"),
    ("4", "Sieb, groß", "colander, large", "Sieb"),
    ("5", "Sieb, klein", "colander, small", "Sieb"),
    ("6", "Müslischale, spitz", "muesli bowl, pointed", "Schale"),
    ("6a", "Müslischale, spitz, klein", "muesli bowl, pointed, small", "Schale"),
    ("7", "Müslischale, spitz, groß", "muesli bowl, pointed, large", "Schale"),
    ("8", "Müslischale, spitz, flach", "muesli bowl, pointed, flat", "Schale"),
    ("9", "Schüssel, spitz", "bowl, pointed", "Schale"),
    ("10", "Spaghetti-Teller", "spaghetti bowl", "Teller"),
    ("11", "Müslischale, breit", "cereal, wide", "Schale"),
    ("13", "Unterteller", "saucer", "Teller"),
    ("14", "Brotteller", "bread plate", "Teller"),
    ("15", "Brotschmierteller", "plate for buttering bread", "Teller"),
    ("16", "Essteller", "dinner plate", "Teller"),
    ("17", "Platzteller", "ground-plate", "Teller"),
    ("18", "Viereckteller, groß", "square plate, large", "Teller"),
    ("19", "Viereckteller, mittel", "square plate, medium", "Teller"),
    ("20", "Viereckteller, klein", "square plate, small", "Teller"),
    ("21", "Rechteckteller", "rectangle plate", "Teller"),
    ("22", "Teebecher, groß", "teacup, large", "Becher"),
    ("23", "Teebecher", "teacup", "Becher"),
    ("24", "Trinkbecher, klein", "drinking cup, small", "Becher"),
    ("25", "Krug, 2 l mit Deckel", "jug, 2 l with lid", "Krug"),
    ("26", "Krug, 1 l mit Deckel", "jug, 1 l with lid", "Krug"),
    ("26a", "Krug, 0,75 l mit Deckel", "jug, 0,75 l with lid", "Krug"),
    ("27", "Krug, 0,5 l", "jug, 0,5 l", "Krug"),
    ("28", "Milch", "milk bowl", "Schale"),
    ("29", "Zucker", "sugar bowl", "Dose"),
    ("30", "Kaffeetasse", "coffee cup", "Tasse"),
    ("35", "Teekanne, klein", "teapot, small", "Kanne"),
    ("35a", "Teekanne, extra klein", "teapot, extra small", "Kanne"),
    ("36", "Teekanne, groß", "teapot, large", "Kanne"),
    ("37", "Flasche, klein", "bottle, small", "Flasche"),
    ("38", "Flasche, groß", "bottle, large", "Flasche"),
    ("39", "Deckeldose", "lidded jar", "Dose"),
    ("39a", "Deckeldose, extra klein", "lidded jar, extra small", "Dose"),
    ("40", "Deckeltopf, klein", "lidded pot, small", "Topf"),
    ("40a", "Deckeltopf, mittel", "lidded pot, medium", "Topf"),
    ("41", "Deckeltopf, groß", "lidded pot, large", "Topf"),
    ("42", "Koreanische Dose", "Korean jar", "Dose"),
    ("43", "Suppentopf, klein", "soup pot, small", "Topf"),
    ("43a", "Suppentopf, extra klein", "soup pot, extra small", "Topf"),
    ("44", "Suppentopf, mittel", "soup pot, medium", "Topf"),
    ("48", "Salatschüssel flach", "salad bowl, flat", "Schale"),
    ("48a", "Salatschüssel flach, mittel", "salad bowl, flat, middle", "Schale"),
    ("48b", "Salatschüssel flach, klein", "salad bowl, flat, small", "Schale"),
    ("50", "Dessertschale, hoch", "dessert bowl, deep", "Schale"),
    ("51", "Dessertschale, flach", "dessert bowl, flat", "Schale"),
    ("53", "Essteller", "dinner plate", "Teller"),
    ("54", "Großer Anrichteteller", "serving platter", "Teller"),
    ("55", "Große Schale", "large bowl", "Schale"),
    ("56", "Soja-Saucen-Schale", "soya sauce bowl", "Schale"),
]

records = []
for nr, name, en, typ, vk in EDITIONEN:
    f = {"eXo5w": name, "BNpSN": nr, "gCX7K": typ, "Mrgtb": "Edition", "CyPYU": en, "3tlrw": False}
    if vk is not None:
        f["772dM"] = vk
    if "Craquelée" in name:
        f["EazCZ"] = [CRAQ]
    records.append({"fields": f})
for nr, name, en, typ in GESCHIRR:
    records.append({"fields": {"eXo5w": name, "BNpSN": nr, "gCX7K": typ, "Mrgtb": "Manufakturprogramm", "CyPYU": en, "EazCZ": GESCHIRR_GLASUREN, "3tlrw": False}})

if __name__ == "__main__":
    print(len(EDITIONEN), len(GESCHIRR), len(records))
    print(json.dumps(records, ensure_ascii=False, separators=(",", ":")))

from common import *
import os
T=ids["T"]
KD="/home/user/KWM/keramik/"
up={}
for k,fn in {"A":"01-seladon-gefaess.png","B":"02-schalen-ensemble.png","C":"03-glasur-detail.png","D":"05-haende-beim-formen.png","E":"06-werkstatt-morgenlicht.png","F":"07-schalen-streiflicht.png","G":"08-keramik-im-raum.png"}.items():
    r=S.post(B+"/api/user-files/upload-file/",files={"file":(fn,open(KD+fn,"rb"),"image/png")})
    assert r.status_code==200,r.text
    up[k]=r.json()["name"]; print(k,up[k])
json.dump(up,open("uploads.json","w"))
def ph(*ks): return [{"name":up[k]} for k in ks]
def fid(tname):
    return {f["name"]:f["id"] for f in api("GET",f"/api/database/fields/table/{T[tname]}/")}
def rows(tname,items):
    r=api("POST",f"/api/database/rows/table/{T[tname]}/batch/?user_field_names=true",json={"items":items})
    return [x["id"] for x in r["items"]]
lag=rows("Lagerorte",[
 {"Name":"Regal A – Schauraum","Beschreibung":"Unikate im Verkaufsraum, 3 Fachböden"},
 {"Name":"Regal B – Lager","Beschreibung":"Reserve und verpackte Ware"},
 {"Name":"Vitrine Eingang","Beschreibung":"Ausgewählte Stücke, abschließbar"},
 {"Name":"Ofenraum","Beschreibung":"Rohlinge und Brandgut"},
 {"Name":"Galerie Nord (Kommission)","Beschreibung":"Leihgabe bis 31.12.2026"}])
gl=rows("Glasuren",[
 {"Name":"Seladon Nebel","Farbe":"Seladon","Foto":ph("C")},
 {"Name":"Eisenbraun matt","Farbe":"Eisenbraun","Foto":ph("F")},
 {"Name":"Wolkenweiß","Farbe":"Wolkenweiß","Foto":ph("B")},
 {"Name":"Pflaumenblau","Farbe":"Pflaumenblau","Foto":ph("C")},
 {"Name":"Aubergine-Eisen","Farbe":"Aubergine","Foto":ph("B")}])
mo=rows("Modelle",[
 {"Name":"Teetasse „Hana“","Typ":"Becher","Ton":"Steinzeug weiß, 1280 °C","Maße":"Ø 8 × H 7 cm","Foto":ph("F")},
 {"Name":"Reisschale „Kome“","Typ":"Schale","Ton":"Steinzeug hell","Maße":"Ø 12 × H 6 cm","Foto":ph("B")},
 {"Name":"Frühstücksteller „Tsuki“","Typ":"Teller","Ton":"Steinzeug weiß, 1280 °C","Maße":"Ø 21 × H 2 cm","Foto":ph("G")},
 {"Name":"Sakeflasche „Shizuku“","Typ":"Karaffe","Ton":"Steinzeug dunkel","Maße":"Ø 9 × H 18 cm","Foto":ph("A")},
 {"Name":"Tischvase „Take“","Typ":"Vase","Ton":"Steinzeug hell","Maße":"Ø 10 × H 24 cm","Foto":ph("A")},
 {"Name":"Teeschale „Cha“","Typ":"Schale","Ton":"Steinzeug weiß, 1280 °C","Maße":"Ø 11 × H 7 cm","Foto":ph("C")}])
U=[
 ("Mondvase „Seladon“","Vase","Mira Hoffmann",2026,"Seladon Nebel","Ø 34 × H 30 cm",["A"],"verfügbar",2,980,True),
 ("Schalen-Trio „Nebel“","Schale","Jonas Reiter",2026,"Seladon / Aubergine / Wolkenweiß","Ø 14–22 cm",["B"],"verfügbar",0,640,True),
 ("Teeschale „Pflaume“","Schale","Mira Hoffmann",2025,"Pflaumenblau","Ø 12 × H 7 cm",["C","F"],"reserviert",2,180,True),
 ("Große Schale „Morgenlicht“","Schale","Anna Keller",2026,"Eisenbraun matt","Ø 32 × H 11 cm",["F"],"verfügbar",0,420,True),
 ("Obertopf „Wolke“","Obertopf","Jonas Reiter",2025,"Wolkenweiß","Ø 26 × H 22 cm",["G"],"in Kommission",4,560,True),
 ("Karaffe „Eisenquelle“","Karaffe","Anna Keller",2026,"Eisenbraun / Seladon","Ø 12 × H 28 cm",["G","C"],"verfügbar",1,310,False),
 ("Becher „Rauch“","Becher","Mira Hoffmann",2026,"Aschenglasur","Ø 8 × H 9 cm",["B"],"verfügbar",1,85,True),
 ("Teller „Salzbrand“","Teller","Jonas Reiter",2025,"Salzglasur","Ø 26 × H 3 cm",["F"],"reserviert",0,150,False),
 ("Vase „Stille“","Vase","Anna Keller",2024,"Seladon Nebel","Ø 16 × H 38 cm",["A","C"],"verkauft",1,720,True),
 ("Schale „Pflaumenblüte“","Schale","Mira Hoffmann",2026,"Pflaumenblau / Wolkenweiß","Ø 18 × H 8 cm",["B","F"],"verfügbar",0,260,True),
 ("Mondvase klein „Mondschein“","Vase","Jonas Reiter",2025,"Seladon Nebel","Ø 20 × H 18 cm",["A"],"in Kommission",4,390,True),
 ("Teller „Aschenglasur“","Teller","Anna Keller",2024,"Aschenglasur","Ø 28 × H 3 cm",["G"],"verkauft",2,170,False),
]
rows("Unikate",[{"Name":n,"Inventarnummer":f"U-2026-{i+1:03d}","Typ":t,"Künstler:in":k,"Jahr":j,"Glasur":g,"Maße":m,"Fotos":ph(*p),"Status":s,"Lagerort":[lag[l]],"Preis intern":str(pr),"Auf Website":w} for i,(n,t,k,j,g,m,p,s,l,pr,w) in enumerate(U)])
au=rows("Aufträge",[
 {"Kunde":"Teehaus Lindenhof","Modell":[mo[2]],"Glasur":[gl[1]],"Menge":24,"Status":"in Glasur","Termin":"2026-10-15"},
 {"Kunde":"Restaurant Sakura","Modell":[mo[3]],"Glasur":[gl[3]],"Menge":12,"Status":"gebrannt","Termin":"2026-10-09"},
 {"Kunde":"Galerie am Markt","Modell":[mo[0]],"Glasur":[gl[0]],"Menge":30,"Status":"offen","Termin":"2026-11-05"}])
def b(d,art,m,g,menge,bruch,a,ma,notiz=""):
    x={"Datum":d,"Art":art,"Modell":[mo[m]],"Mitarbeiter:in":ma,"Notiz":notiz}
    if g is not None: x["Glasur"]=[gl[g]]
    if menge is not None: x["Menge"]=menge
    if bruch is not None: x["Bruch"]=bruch
    if a is not None: x["Auftrag"]=[au[a]]
    return x
rows("Buchungen",[
 b("2026-08-18","Zugang Rohlinge",0,None,60,None,None,"Anna K.","Lieferung Rohlinge aus dem Trockenraum"),
 b("2026-08-25","Glasurbrand",0,0,40,2,None,"Jonas R.","Brand 3, zwei Tassen mit Riss"),
 b("2026-09-02","Zugang Rohlinge",1,None,80,None,None,"Anna K.",""),
 b("2026-09-09","Glasurbrand",1,2,48,3,None,"Mira H.","Brand 4"),
 b("2026-09-12","Zugang Rohlinge",2,None,30,None,None,"Jonas R.",""),
 b("2026-09-16","Glasurbrand",2,1,24,1,0,"Jonas R.","Für Teehaus Lindenhof"),
 b("2026-09-20","Verkauf",0,0,12,None,None,"Mira H.","Wochenmarkt Samstag"),
 b("2026-09-23","Bruch",1,None,None,4,None,"Anna K.","Beim Ausräumen heruntergefallen"),
 b("2026-09-28","Zugang Rohlinge",3,None,24,None,None,"Anna K.",""),
 b("2026-09-30","Glasurbrand",3,3,12,0,1,"Mira H.","Für Restaurant Sakura"),
 b("2026-10-01","Zugang Rohlinge",4,None,20,None,None,"Jonas R.",""),
 b("2026-10-01","Zugang Rohlinge",5,None,40,None,None,"Jonas R.","")])
print("done")

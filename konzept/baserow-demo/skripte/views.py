from common import *
T=ids["T"]
def F(t): return {f["name"]:f for f in api("GET",f"/api/database/fields/table/{T[t]}/")}
U=F("Unikate"); M=F("Modelle"); Bk=F("Buchungen")
def fo(vid,opts): api("PATCH",f"/api/database/views/{vid}/field-options/",json={"field_options":{str(k):v for k,v in opts.items()}})
# --- Unikate grid
gv=296
api("PATCH",f"/api/database/views/{gv}/",json={"name":"Alle Unikate"})
order=["Name","Fotos","Typ","Status","Inventarnummer","Künstler:in","Jahr","Glasur","Maße","Lagerort","Preis intern","Auf Website"]
widths={"Name":260,"Fotos":200,"Typ":120,"Status":150,"Inventarnummer":150,"Künstler:in":160,"Jahr":80,"Glasur":240,"Maße":160,"Lagerort":210,"Preis intern":130,"Auf Website":120}
opts={U[n]["id"]:{"width":widths[n],"order":i,"hidden":False} for i,n in enumerate(order)}
fo(gv,opts)
try:
    print(api("PATCH",f"/api/database/views/{gv}/",ok=True,json={"row_height_size":"large"}) and "rowheight ok")
except Exception as e: print(e)
# sort by Inventarnummer
api("POST",f"/api/database/views/{gv}/sortings/",ok=True,json={"field":U["Inventarnummer"]["id"],"order":"ASC"})
# --- gallery
gal=api("POST",f"/api/database/views/table/{T['Unikate']}/",json={"name":"Werkschau","type":"gallery"})
api("PATCH",f"/api/database/views/{gal['id']}/",json={"card_cover_image_field":U["Fotos"]["id"]})
vis={"Name":0,"Typ":1,"Status":2,"Künstler:in":3}
opts={}
for n,f in U.items():
    opts[f["id"]]={"hidden":n not in vis,"order":vis.get(n,50)}
fo(gal["id"],opts)
print("gallery",gal["id"])
# --- verfügbar
av=api("POST",f"/api/database/views/table/{T['Unikate']}/",json={"name":"Verfügbar","type":"grid"})
sid=[o["id"] for o in U["Status"]["select_options"] if o["value"]=="verfügbar"][0]
api("POST",f"/api/database/views/{av['id']}/filters/",json={"field":U["Status"]["id"],"type":"single_select_equal","value":str(sid)})
o2={U[n]["id"]:{"width":widths[n],"order":i,"hidden":n in("Inventarnummer","Maße","Preis intern","Lagerort","Auf Website")} for i,n in enumerate(order)}
fo(av["id"],o2)
try: api("PATCH",f"/api/database/views/{av['id']}/",ok=True,json={"row_height_size":"large"})
except: pass
# --- Form Unikat
fm=api("POST",f"/api/database/views/table/{T['Unikate']}/",json={"name":"Neues Unikat erfassen","type":"form"})
api("PATCH",f"/api/database/views/{fm['id']}/",json={"title":"Neues Unikat erfassen","description":"Bitte füllen Sie die Felder aus und fügen Sie mindestens ein Foto hinzu. Pflichtfelder sind mit * markiert. Das Stück erscheint danach sofort im Lager.","submit_text":"Unikat speichern","public":True})
hints={
 "Name":("Name des Stücks","z. B. Mondvase „Seladon“",True),
 "Inventarnummer":("Inventarnummer","Format U-Jahr-Nummer, z. B. U-2026-013. Steht auf dem Etikett an der Unterseite.",True),
 "Typ":("Typ","Bitte die passende Gefäßform wählen.",True),
 "Künstler:in":("Künstler:in","Wer hat das Stück gefertigt?",True),
 "Jahr":("Jahr","Entstehungsjahr, vierstellig, z. B. 2026.",False),
 "Glasur":("Glasur","Name der Glasur wie in der Glasurliste, z. B. Seladon Nebel.",False),
 "Maße":("Maße","Durchmesser × Höhe in cm, z. B. Ø 18 × H 8 cm.",False),
 "Fotos":("Fotos","Mindestens ein Foto, am besten bei Tageslicht vor neutralem Hintergrund.",True),
 "Status":("Status","Neue Stücke starten meist als „verfügbar“.",True),
 "Lagerort":("Lagerort","Wo steht das Stück gerade? Bitte aus der Liste wählen.",False),
 "Preis intern":("Preis intern (€)","Nur für interne Zwecke, nicht für die Website.",False),
 "Auf Website":("Auf der Website zeigen","Haken setzen, wenn das Stück online sichtbar sein soll.",False)}
o={}
for i,(n,(lab,desc,req)) in enumerate(hints.items()):
    o[U[n]["id"]]={"enabled":True,"name":lab,"description":desc,"required":req,"order":i}
fo(fm["id"],o)
print("form",fm["id"],api("GET",f"/api/database/views/{fm['id']}/")["slug"])
# --- Buchungen Form
fb=api("POST",f"/api/database/views/table/{T['Buchungen']}/",json={"name":"Brand buchen","type":"form"})
api("PATCH",f"/api/database/views/{fb['id']}/",json={"title":"Brand buchen","description":"Hier tragen Sie Zugänge, Glasurbrände, Verkäufe und Bruch ein. Der Bestand der Rohlinge wird automatisch berechnet.","submit_text":"Buchung speichern","public":True})
bh={
 "Datum":("Datum","Tag des Brandes oder der Lieferung.",True),
 "Art":("Art der Buchung","Zugang Rohlinge, Glasurbrand, Verkauf oder Bruch.",True),
 "Modell":("Modell","Welches Modell wurde gebrannt oder geliefert?",True),
 "Glasur":("Glasur","Nur bei Glasurbrand oder Verkauf ausfüllen.",False),
 "Menge":("Menge (Stück)","Anzahl der Stücke in dieser Buchung.",True),
 "Bruch":("Davon Bruch (Stück)","Wie viele Stücke sind kaputt gegangen? Sonst leer lassen.",False),
 "Auftrag":("Zu Auftrag (optional)","Falls der Brand für einen Kundenauftrag war.",False),
 "Mitarbeiter:in":("Wer bucht?","Ihr Vorname genügt.",True),
 "Notiz":("Notiz","Besonderheiten, z. B. Ofen-Nr. oder Risse.",False)}
o={}
for i,(n,(lab,desc,req)) in enumerate(bh.items()):
    o[Bk[n]["id"]]={"enabled":True,"name":lab,"description":desc,"required":req,"order":i}
fo(fb["id"],o)
print("bform",fb["id"],api("GET",f"/api/database/views/{fb['id']}/")["slug"])
# --- Modelle grid
mv=295
api("PATCH",f"/api/database/views/{mv}/",json={"name":"Modelle mit Bestand"})
mo={"Name":(0,280),"Foto":(1,200),"Typ":(2,120),"Rohlinge vor Ort":(3,170),"Ton":(4,200),"Maße":(5,150),"Buchungen":(6,260),"Aufträge":(7,200)}
o={M[n]["id"]:{"order":v[0],"width":v[1],"hidden":False} for n,v in mo.items()}
fo(mv,o)
try: api("PATCH",f"/api/database/views/{mv}/",ok=True,json={"row_height_size":"large"})
except: pass

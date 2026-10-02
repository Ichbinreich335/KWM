import requests, json, sys, os
B="http://localhost:8090"
S=requests.Session()
def die(r):
    print("ERR",r.status_code,r.text[:800]); sys.exit(1)
EMAIL="admin@example.com"; PW="KwmDemo2026!"
r=S.post(B+"/api/user/",json={"name":"Werkstatt Admin","email":EMAIL,"password":PW,"language":"de","authenticate":True})
if r.status_code!=200:
    r=S.post(B+"/api/user/token-auth/",json={"email":EMAIL,"password":PW})
    if r.status_code!=200: die(r)
j=r.json(); tok=j.get("access_token") or j.get("token")
S.headers["Authorization"]="JWT "+tok
print("login ok", list(j.keys()))
def api(m,p,**kw):
    r=S.request(m,B+p,**kw)
    if r.status_code>=300: print(m,p); die(r)
    return r.json() if r.text else None
# language
try:
    print(api("PATCH","/api/user/account/",json={"language":"de"}).get("language"))
except SystemExit: print("language patch failed")
ws=api("GET","/api/workspaces/")
print("workspaces",[(w["id"],w["name"]) for w in ws])
if not ws:
    ws=[api("POST","/api/workspaces/",json={"name":"Keramik Werkstatt"})]
wsid=ws[0]["id"]
apps=api("GET",f"/api/applications/workspace/{wsid}/")
print("apps",[(a["id"],a["name"],a["type"]) for a in apps])
db=api("POST",f"/api/applications/workspace/{wsid}/",json={"name":"Keramik-Lager KWM","type":"database"})
dbid=db["id"]
T={}
def table(name):
    t=api("POST",f"/api/database/tables/database/{dbid}/",json={"name":name,"data":[["Name"]],"first_row_header":True})
    T[name]=t["id"]; return t["id"]
def fields(tid): return api("GET",f"/api/database/fields/table/{tid}/")
def field(tid,**kw):
    return api("POST",f"/api/database/fields/table/{tid}/",json=kw)
def so(*opts): return [{"value":v,"color":c} for v,c in opts]
F={}
# Lagerorte, Glasuren, Modelle
for n in ["Lagerorte","Glasuren","Modelle","Unikate","Aufträge","Buchungen"]: table(n)
print(T)
# primary renames
def prim(tid,name,**extra):
    f=[x for x in fields(tid) if x["primary"]][0]
    api("PATCH",f"/api/database/fields/{f['id']}/",json=dict(name=name,**extra)); return f["id"]
# Lagerorte
field(T["Lagerorte"],name="Beschreibung",type="text")
# Glasuren
F["gl_farbe"]=field(T["Glasuren"],name="Farbe",type="single_select",select_options=so(("Seladon","light-green"),("Eisenbraun","dark-brown"),("Wolkenweiß","light-gray"),("Pflaumenblau","dark-blue"),("Aubergine","dark-red")))["id"]
field(T["Glasuren"],name="Foto",type="file")
# Modelle
mt=T["Modelle"]
F["mo_typ"]=field(mt,name="Typ",type="single_select",select_options=so(("Teller","light-blue"),("Schale","light-green"),("Becher","light-orange"),("Vase","light-red"),("Karaffe","light-cyan"),("Obertopf","light-purple")))["id"]
field(mt,name="Ton",type="text"); field(mt,name="Maße",type="text"); field(mt,name="Foto",type="file")
# Unikate
ut=T["Unikate"]
fu={}
fu["inv"]=field(ut,name="Inventarnummer",type="text")["id"]
fu["typ"]=field(ut,name="Typ",type="single_select",select_options=so(("Teller","light-blue"),("Schale","light-green"),("Becher","light-orange"),("Vase","light-red"),("Karaffe","light-cyan"),("Obertopf","light-purple")))["id"]
fu["kue"]=field(ut,name="Künstler:in",type="text")["id"]
fu["jahr"]=field(ut,name="Jahr",type="number",number_decimal_places=0,number_negative=False)["id"]
fu["gla"]=field(ut,name="Glasur",type="text")["id"]
fu["mass"]=field(ut,name="Maße",type="text")["id"]
fu["foto"]=field(ut,name="Fotos",type="file")["id"]
fu["status"]=field(ut,name="Status",type="single_select",select_options=so(("verfügbar","green"),("reserviert","yellow"),("verkauft","gray"),("in Kommission","blue")))["id"]
fu["lager"]=field(ut,name="Lagerort",type="link_row",link_row_table_id=T["Lagerorte"])["id"]
fu["preis"]=field(ut,name="Preis intern",type="number",number_decimal_places=2,number_negative=False,number_prefix="",number_suffix="")["id"]
fu["web"]=field(ut,name="Auf Website",type="boolean")["id"]
# Aufträge
at=T["Aufträge"]
prim(at,"Kunde")
fa={}
fa["modell"]=field(at,name="Modell",type="link_row",link_row_table_id=mt)["id"]
fa["glasur"]=field(at,name="Glasur",type="link_row",link_row_table_id=T["Glasuren"])["id"]
fa["menge"]=field(at,name="Menge",type="number",number_decimal_places=0)["id"]
fa["status"]=field(at,name="Status",type="single_select",select_options=so(("offen","light-red"),("in Glasur","light-orange"),("gebrannt","light-blue"),("abgeholt","light-green")))["id"]
fa["termin"]=field(at,name="Termin",type="date",date_format="EU")["id"]
# Buchungen
bt=T["Buchungen"]
fb={}
fb["datum"]=field(bt,name="Datum",type="date",date_format="EU")["id"]
fb["art"]=field(bt,name="Art",type="single_select",select_options=so(("Zugang Rohlinge","light-blue"),("Glasurbrand","orange"),("Verkauf","green"),("Bruch","red")))["id"]
fb["modell"]=field(bt,name="Modell",type="link_row",link_row_table_id=mt)["id"]
fb["glasur"]=field(bt,name="Glasur",type="link_row",link_row_table_id=T["Glasuren"])["id"]
fb["menge"]=field(bt,name="Menge",type="number",number_decimal_places=0)["id"]
fb["bruch"]=field(bt,name="Bruch",type="number",number_decimal_places=0)["id"]
fb["auftrag"]=field(bt,name="Auftrag",type="link_row",link_row_table_id=at)["id"]
fb["ma"]=field(bt,name="Mitarbeiter:in",type="text")["id"]
fb["notiz"]=field(bt,name="Notiz",type="long_text")["id"]
# primary of Buchungen as formula
try:
    prim(bt,"Buchung",type="formula",formula="concat(totext(field('Art')), ' – ', totext(field('Modell')))")
    print("primary formula ok")
except SystemExit:
    prim(bt,"Buchung")
# rename related fields in Modelle
for f in fields(mt):
    print(f["id"],f["name"],f["type"])
json.dump({"T":T,"F":F,"fu":fu,"fa":fa,"fb":fb,"wsid":wsid,"dbid":dbid},open("ids.json","w"))

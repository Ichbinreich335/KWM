from common import *
T=ids["T"]; up=json.load(open("uploads.json"))
def F(t): return {f["name"]:f for f in api("GET",f"/api/database/fields/table/{T[t]}/")}
U=F("Unikate"); M=F("Modelle")
newc={"Teller":"blue","Schale":"green","Becher":"orange","Vase":"red","Karaffe":"cyan","Obertopf":"purple"}
for f in (U["Typ"],M["Typ"]):
    opts=[{"id":o["id"],"value":o["value"],"color":newc[o["value"]]} for o in f["select_options"]]
    r=api("PATCH",f"/api/database/fields/{f['id']}/",ok=True,json={"select_options":opts}); print(bool(r))
# widths
widths={"Name":230,"Fotos":130,"Typ":110,"Status":140,"Inventarnummer":130,"Künstler:in":140,"Jahr":70,"Glasur":180,"Maße":120,"Lagerort":180,"Preis intern":110,"Auf Website":100}
api("PATCH","/api/database/views/296/field-options/",json={"field_options":{str(U[n]["id"]):{"width":w} for n,w in widths.items()}})
for v in (296,295):
    print(api("PATCH",f"/api/database/views/{v}/",ok=True,json={"row_height_size":"medium"}) and "ok")
# form covers
for v,k in ((864,"E"),(875,"D")):
    r=api("PATCH",f"/api/database/views/{v}/",ok=True,json={"cover_image":{"name":up[k]}}); print(bool(r))

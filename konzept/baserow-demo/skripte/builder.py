from common import *
T=ids["T"]
app=api("POST",f"/api/applications/workspace/{ids['wsid']}/",json={"name":"Werkstatt","type":"builder"})
print(app["id"],[p for p in app.get("pages",[])])
bid=app["id"]
pages=api("GET",f"/api/applications/workspace/{ids['wsid']}/")
pg=[p for p in pages if p["id"]==bid][0]["pages"]
print(pg)
pid=pg[0]["id"]
print(json.dumps(api("GET",f"/api/builder/{bid}/pages/") if False else "", ))
ds=api("POST",f"/api/builder/page/{pid}/data-sources/",json={"name":"Unikate","type":"list_rows","table_id":T["Unikate"],"view_id":None},ok=True)
print(ds)
types=api("GET",f"/api/builder/page/{pid}/elements/",ok=True); print(types)

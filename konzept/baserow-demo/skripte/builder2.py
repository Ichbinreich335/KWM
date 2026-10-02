from common import *
T=ids["T"]; bid=122
pg=api("POST",f"/api/builder/{bid}/pages/",json={"name":"Lagerübersicht","path":"/"})
pid=pg["id"]; print("page",pid)
U={f["name"]:f for f in api("GET",f"/api/database/fields/table/{T['Unikate']}/")}
ds=api("POST",f"/api/builder/page/{pid}/data-sources/",ok=True,json={"name":"Unikate","type":"list_rows","table_id":T["Unikate"],"view_id":None})
print(ds)
json.dump({"bid":bid,"pid":pid,"ds":ds and ds["id"]},open("bld.json","w"))

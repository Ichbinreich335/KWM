from common import *
T=ids["T"]; bid=122; pid=212
integ=api("POST",f"/api/application/{bid}/integrations/",ok=True,json={"type":"local_baserow","name":"Lager"})
print(integ)
iid=integ["id"]
ds=api("POST",f"/api/builder/page/{pid}/data-sources/",ok=True,json={"name":"Unikate","type":"local_baserow_list_rows","table_id":T["Unikate"],"integration_id":iid,"view_id":None})
print(ds and ds["id"])
U={f["name"]:f["id"] for f in api("GET",f"/api/database/fields/table/{T['Unikate']}/")}
print(U)
json.dump({"bid":bid,"pid":pid,"iid":iid,"ds":ds and ds["id"],"U":U},open("bld.json","w"))

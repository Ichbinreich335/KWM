from common import *
b=json.load(open("bld.json")); pid=b["pid"]; ds=b["ds"]; U=b["U"]
def el(**kw): return api("POST",f"/api/builder/page/{pid}/elements/",ok=True,json=kw)
#,level=1,value="'Werkstatt – Lagerübersicht'") and "h1")
#,value="'Alle Unikate auf einen Blick. Stand: live aus der Datenbank.'") and "text")
def f(name,expr): return {"name":name,"type":"text","config":{"value":expr}}
r=el(type="table",data_source_id=ds,items_per_page=12,fields=[
 f("Inventarnr.",f"get('current_record.field_{U['Inventarnummer']}')"),
 f("Name",f"get('current_record.field_{U['Name']}')"),
 f("Typ",f"get('current_record.field_{U['Typ']}.value')"),
 f("Status",f"get('current_record.field_{U['Status']}.value')"),
 f("Künstler:in",f"get('current_record.field_{U['Künstler:in']}')"),
 f("Maße",f"get('current_record.field_{U['Maße']}')")])
print(r and r["id"])

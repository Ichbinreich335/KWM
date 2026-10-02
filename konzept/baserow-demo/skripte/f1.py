from common import *
mt=ids["T"]["Modelle"]
f="sum(filter(lookup('Buchungen','Menge'), totext(lookup('Buchungen','Art'))='Zugang Rohlinge')) - sum(filter(lookup('Buchungen','Menge'), totext(lookup('Buchungen','Art'))='Glasurbrand')) - sum(lookup('Buchungen','Bruch'))"
r=api("POST",f"/api/database/fields/table/{mt}/",ok=True,json={"name":"Rohlinge vor Ort","type":"formula","formula":f,"number_decimal_places":0})
print(r)

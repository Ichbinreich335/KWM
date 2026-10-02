import requests, json, sys
B="http://localhost:8090"
S=requests.Session()
r=S.post(B+"/api/user/token-auth/",json={"email":"admin@example.com","password":"KwmDemo2026!"})
S.headers["Authorization"]="JWT "+r.json()["access_token"]
ids=json.load(open("/tmp/claude-0/-home-user-KWM/7b601fd8-d1d4-5ede-885d-1afaffd71343/scratchpad/ids.json"))
def api(m,p,ok=False,**kw):
    r=S.request(m,B+p,**kw)
    if r.status_code>=300:
        print("ERR",m,p,r.status_code,r.text[:600])
        if ok: return None
        sys.exit(1)
    return r.json() if r.text else None

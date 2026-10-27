import urllib.request
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://dbdiagram.io/assets/index-Bv4Nh494.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as resp:
    js = resp.read().decode('utf-8')

# Search for occurrences of query or graphql or post
for kw in ['/query', '/graphql', 'getDiagram', 'fetchDiagram', 'loadDiagram', 'query ']:
    count = js.count(kw)
    print(f"'{kw}': {count}")
    if 0 < count < 20:
        pos = 0
        while True:
            idx = js.find(kw, pos)
            if idx == -1: break
            print(js[max(0, idx-50):min(len(js), idx+100)])
            pos = idx + len(kw)

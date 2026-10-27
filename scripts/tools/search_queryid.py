import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://dbdiagram.io/assets/index-Bv4Nh494.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as resp:
    js = resp.read().decode('utf-8')

for m in re.finditer(r'queryid', js, re.IGNORECASE):
    s = max(0, m.start() - 100)
    e = min(len(js), m.end() + 150)
    print("MATCH queryid:", js[s:e])
    print("-" * 30)


with open("check_js.py") as f: pass
import urllib.request, ssl, re
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://dbdiagram.io/assets/index-Bv4Nh494.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as resp:
    js = resp.read().decode('utf-8')

# Search for /d/:id or route definition for /d/
for m in re.finditer(r'/d/|path:\s*[`"']/d', js):
    start = max(0, m.start() - 150)
    end = min(len(js), m.end() + 250)
    print("ROUTE MATCH:")
    print(js[start:end])
    print("="*40)

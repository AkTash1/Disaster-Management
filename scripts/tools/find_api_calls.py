import re

with open("check_js.py", "r") as f:
    pass

import urllib.request
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://dbdiagram.io/assets/index-Bv4Nh494.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as resp:
    js = resp.read().decode('utf-8')

# Search for api.dbdiagram.io in the JS
pos = 0
while True:
    idx = js.find('api.dbdiagram.io', pos)
    if idx == -1:
        break
    start = max(0, idx - 100)
    end = min(len(js), idx + 200)
    print("--- MATCH ---")
    print(js[start:end])
    pos = idx + len('api.dbdiagram.io')

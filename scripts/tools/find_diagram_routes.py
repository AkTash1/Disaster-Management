import re

with open("find_api_calls.py") as f:
    pass

import urllib.request
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://dbdiagram.io/assets/index-Bv4Nh494.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as resp:
    js = resp.read().decode('utf-8')

# Search for get( or post( or url paths
endpoints = re.findall(r'[`"\'](/[a-zA-Z0-9_\-/]+)[`"\']', js)
interesting = [e for e in endpoints if any(k in e for k in ['diagram', 'project', 'share', 'public', 'view', 'doc'])]
print("Interesting endpoints:")
for ep in set(interesting):
    print(" ", ep)

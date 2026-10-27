import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    "https://dbdiagram.io/assets/index-Bv4Nh494.js",
    headers={'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req, context=ctx) as resp:
    js = resp.read().decode('utf-8')

matches = re.findall(r'["\'](/api/[^"\']+)["\']', js)
print("API endpoints in JS:")
for m in list(set(matches))[:30]:
    print(m)

# Find where /d/ or diagram is loaded
urls = re.findall(r'https?://[a-zA-Z0-9\.\-_/]+', js)
for u in set(urls):
    if 'api' in u or 'backend' in u or 'holistics' in u:
        print("URL:", u)

import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://dbdiagram.io/d/6aad6b426d586d617e6bd187"
req = urllib.request.Request(
    url,
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8')
        print(f"Fetched {len(html)} bytes")
        with open("dbdiagram_page.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Saved to dbdiagram_page.html")
except Exception as e:
    print("Error:", e)

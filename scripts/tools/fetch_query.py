import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    "https://api.dbdiagram.io/query/6aad6b426d586d617e6bd187",
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://dbdiagram.io',
        'Referer': 'https://dbdiagram.io/'
    }
)

try:
    with urllib.request.urlopen(req, context=ctx) as resp:
        print("Status:", resp.status)
        data = resp.read().decode('utf-8')
        print("Data length:", len(data))
        obj = json.loads(data)
        print("Keys:", obj.keys())
        with open("schema_dbml_fetched.json", "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2)
        print("Saved to schema_dbml_fetched.json")
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)

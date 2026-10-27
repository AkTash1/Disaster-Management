import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    "https://api.dbdiagram.io/query/6aad6b426d586d617e6bd187",
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://dbdiagram.io',
        'Referer': 'https://dbdiagram.io/'
    },
    data=json.dumps({}).encode('utf-8'),
    method='POST'
)

with urllib.request.urlopen(req, context=ctx) as resp:
    data = resp.read().decode('utf-8')
    obj = json.loads(data)
    with open("dbdiagram_schema.json", "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    if 'content' in obj:
        with open("dbdiagram_schema.dbml", "w", encoding="utf-8") as f:
            f.write(obj['content'])
        print(f"Successfully saved schema! Diagram Name: {obj.get('name')}, DBML length: {len(obj['content'])}")

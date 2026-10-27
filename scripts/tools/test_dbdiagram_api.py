import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://dbdiagram.io/d/6aad6b426d586d617e6bd187'
}

endpoints = [
    "https://dbdiagram.io/api/diagrams/6aad6b426d586d617e6bd187",
    "https://dbdiagram.io/api/diagram/6aad6b426d586d617e6bd187",
    "https://dbdiagram.io/api/public/diagrams/6aad6b426d586d617e6bd187",
    "https://dbdiagram.io/api/d/6aad6b426d586d617e6bd187",
    "https://api.dbdiagram.io/v1/diagrams/6aad6b426d586d617e6bd187",
    "https://api.dbdiagram.io/query/6aad6b426d586d617e6bd187",
]

for ep in endpoints:
    try:
        req = urllib.request.Request(ep, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as resp:
            data = resp.read().decode('utf-8')
            print(f"SUCCESS {ep} -> {len(data)} bytes")
            print(data[:300])
            with open("dbdiagram_api_response.json", "w", encoding="utf-8") as out:
                out.write(data)
            break
    except Exception as e:
        print(f"FAIL {ep} -> {e}")

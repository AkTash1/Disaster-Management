import re

with open(r'./data/pdf_extracted_texts/DB_Tables.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace broken characters and normalize space
text = re.sub(r' +', ' ', text)

sections = re.split(r'\n(?=[0-9]+[a-z]?\.\s+)', text)
print(f'Total sections: {len(sections)}\n')

for s in sections:
    lines = [l.strip() for l in s.strip().split('\n') if l.strip()]
    if not lines:
        continue
    first_line = lines[0]
    
    desc_match = re.search(r'Description:\s*(.*?)(?=\n\s*JSON|\n\s*NOTE|\n\s*[0-9]+[a-z]?\.|$)', s, re.DOTALL)
    desc = ' '.join(desc_match.group(1).split()) if desc_match else ''
    
    json_match = re.search(r'JSON\s*\{(.*?)\}', s, re.DOTALL)
    keys = []
    if json_match:
        raw_json = json_match.group(1)
        keys = re.findall(r'\"([a-zA-Z_0-9]+)\"\s*:', raw_json)
        
    print(f'=== {first_line} ===')
    if desc:
        print(f'  Description: {desc}')
    if keys:
        print(f'  Fields ({len(keys)}): {", ".join(keys)}')
    print()

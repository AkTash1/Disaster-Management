import re

with open("dbdiagram_schema.dbml", "r", encoding="utf-8") as f:
    lines = f.readlines()

tables = []
enums = []
refs = []

for line in lines:
    line = line.strip()
    if line.startswith("Table "):
        # Table name or Table "schema"."name"
        m = re.match(r'Table\s+([a-zA-Z0-9_\.\"]+)', line)
        if m:
            tables.append(m.group(1))
    elif line.startswith("Enum "):
        m = re.match(r'Enum\s+([a-zA-Z0-9_]+)', line)
        if m:
            enums.append(m.group(1))
    elif line.startswith("Ref:"):
        refs.append(line)

print(f"Total Enums: {len(enums)}")
print(f"Total Tables: {len(tables)}")
print(f"Total Refs: {len(refs)}")
print("\nTables list:")
for i, t in enumerate(tables, 1):
    print(f"{i:2d}. {t}")

import json

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

matches = []
for idx, r in enumerate(master):
    if 'good girl' in str(r).lower() or '212' in str(r).lower() or 'sauvage' in str(r).lower():
        matches.append((idx, r))

print(f"Total matches in Keywords Master: {len(matches)}")
for idx, r in matches[:20]:
    print(f"Row {idx}: {list(r.values())[:6]}")

import json
import re

with open('scratch/excel_extracted/12 Dados Concorrente.json', 'r', encoding='utf-8') as f:
    concorrente = json.load(f)

# Reconstruct rows
headers = list(concorrente[2].values())
rows = concorrente[3:]

results = []
pattern = re.compile(r'brand collection \d+')
for r in rows:
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    
    keyword = row_dict.get('Keyword', '')
    url = row_dict.get('URL SEMrush', '')
    
    if keyword and pattern.search(str(keyword).lower()):
        results.append((keyword, url))

print(f"Total numbered Brand Collection entries in Concorrente: {len(results)}")
print("First 30:")
for idx, (kw, url) in enumerate(results[:30]):
    print(f"  {idx+1}. KW: '{kw}' | URL: '{url}'")

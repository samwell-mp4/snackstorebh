import json
import re

with open('scratch/excel_extracted/12 Dados Concorrente.json', 'r', encoding='utf-8') as f:
    concorrente = json.load(f)

# Reconstruct rows
headers = list(concorrente[2].values())
rows = concorrente[3:]

results = []
pattern = re.compile(r'\d+')
for idx, r in enumerate(rows):
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    
    keyword = row_dict.get('Keyword', '')
    if keyword and pattern.search(str(keyword)):
        results.append((idx+4, keyword))

print(f"Total rows with numbers in Concorrente: {len(results)}")
for r_num, kw in results[:50]:
    print(f"Row {r_num}: {kw}")

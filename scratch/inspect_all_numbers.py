import json
import re

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# Reconstruct rows
headers = list(master[2].values())
rows = master[3:]

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

print(f"Total rows with numbers: {len(results)}")
for r_num, kw in results:
    print(f"Row {r_num}: {kw}")

import json
import re

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# Reconstruct rows
headers = list(master[2].values())
rows = master[3:]

results = []
pattern = re.compile(r'brand collection \d+')
for r in rows:
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    
    keyword = row_dict.get('Keyword', '')
    target_url = row_dict.get('Página-alvo', '')
    page_type = row_dict.get('Tipo de página', '')
    title_sug = row_dict.get('Título sugerido', '')
    
    if keyword and (pattern.search(str(keyword).lower()) or 'brand-collection-' in str(target_url)):
        results.append((keyword, target_url, page_type, title_sug))

print(f"Total numbered Brand Collection entries found in Master: {len(results)}")
print("First 30:")
for idx, (kw, url, t, title) in enumerate(results[:30]):
    print(f"  {idx+1}. KW: '{kw}' | URL: '{url}' | Type: '{t}' | Sug. Title: '{title}'")

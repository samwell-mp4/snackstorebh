import json

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# Reconstruct rows
headers = list(master[2].values())
rows = master[3:]

print(f"Total rows in Keywords Master: {len(rows)}")
brand_keywords = []
for r in rows:
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    
    keyword = row_dict.get('Keyword', '')
    target_url = row_dict.get('Target URL', '') or row_dict.get('URL final', '') or row_dict.get('URL', '')
    
    # Try to find target URL if header was different
    if not target_url:
        for k, v in row_dict.items():
            if 'url' in str(k).lower():
                target_url = v
                break
                
    if keyword and ('brand collection' in str(keyword).lower() or 'brand' in str(keyword).lower()):
        brand_keywords.append((keyword, target_url))

print(f"Total brand keywords in master: {len(brand_keywords)}")
for idx, (kw, url) in enumerate(brand_keywords[:40]):
    print(f"  {idx+1}. Keyword: '{kw}' | URL: '{url}'")

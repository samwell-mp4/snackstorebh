import json
import re

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# Reconstruct rows
headers = list(master[2].values())
rows = master[3:]

# Load implemented slugs
with open('src/seoPagesData.js', 'r', encoding='utf-8') as f:
    seo_data_content = f.read()

# Simple regex to extract slugs
slugs = re.findall(r"slug:\s*'([^']+)'", seo_data_content)

with open('src/brandCollectionSeoPages.js', 'r', encoding='utf-8') as f:
    bc_content = f.read()
slugs += re.findall(r"slug:\s*'([^']+)'", bc_content)

# Remove duplicates
slugs = set(slugs)

print(f"Total slugs in code: {len(slugs)}")

# Now find all keywords in Keywords Master and check if their target URL is in slugs
missing_keywords = []
for idx, r in enumerate(rows):
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    
    keyword = row_dict.get('Keyword', '')
    url = row_dict.get('Página-alvo', '')
    priority = row_dict.get('Prioridade', '')
    
    if not url:
        continue
        
    clean_url = url.strip().strip('/')
    if not clean_url:
        continue
        
    # Check if url starts with blog/ or is just a slug
    if clean_url not in slugs:
        missing_keywords.append({
            'row_num': idx + 4,
            'keyword': keyword,
            'url': url,
            'priority': priority
        })

print(f"Total missing URLs in code: {len(missing_keywords)}")
print("First 20 missing:")
for idx, m in enumerate(missing_keywords[:20]):
    print(f"  Row {m['row_num']}: '{m['keyword']}' | URL: '{m['url']}' | Priority: {m['priority']}")

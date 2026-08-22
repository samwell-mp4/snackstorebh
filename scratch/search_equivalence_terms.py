import json
import os

extracted_dir = 'scratch/excel_extracted'
files = [f for f in os.listdir(extracted_dir) if f.endswith('.json')]

terms = ["la vie est belle", "coco mademoiselle", "attraction men", "good girl", "sauvage", "invictus", "212 vip"]

for f_name in files:
    with open(os.path.join(extracted_dir, f_name), 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    matches = []
    for idx, row in enumerate(data):
        row_str = str(row).lower()
        if any(t in row_str for t in terms):
            matches.append((idx, row))
            
    if len(matches) > 0:
        print(f"File: {f_name} | Matches: {len(matches)}")
        for idx, r in matches[:5]:
            print(f"  Row {idx}: {list(r.values())[:6]}")

import json
import os
import re

extracted_dir = 'scratch/excel_extracted'
files = [f for f in os.listdir(extracted_dir) if f.endswith('.json')]

brands = ["dior", "chanel", "carolina herrera", "paco rabanne", "lancôme", "lancome", "versace", "jean paul", "gaultier", "gucci", "hugo boss", "creed", "tom ford"]

for f_name in files:
    with open(os.path.join(extracted_dir, f_name), 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Count rows containing brands and numbers
    matching_rows = []
    for idx, row in enumerate(data):
        row_str = str(row).lower()
        has_brand = any(b in row_str for b in brands)
        has_num = re.search(r'\b\d{3}\b', row_str) # Look for 3-digit numbers
        if has_brand and has_num:
            matching_rows.append((idx, row))
            
    if len(matching_rows) > 0:
        print(f"File: {f_name} has {len(matching_rows)} rows matching brand + 3-digit number!")
        # Print first 5 matches
        for idx, row in matching_rows[:5]:
            print(f"  Row {idx}: {list(row.values())[:5]}")

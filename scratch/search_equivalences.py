import json
import os

extracted_dir = 'scratch/excel_extracted'
files = [f for f in os.listdir(extracted_dir) if f.endswith('.json')]

for f_name in files:
    with open(os.path.join(extracted_dir, f_name), 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"File: {f_name} | Rows: {len(data)}")
    if len(data) > 0:
        # print first row keys
        print("  Keys:", list(data[0].keys()))
        # Check if "equival" or "inspira" or "original" appears in the keys or values
        found = False
        for row in data[:20]:
            row_str = str(row).lower()
            if 'equival' in row_str or 'inspir' in row_str or 'good girl' in row_str:
                found = True
                break
        if found:
            print("  -> Found related terms in first 20 rows of this sheet!")

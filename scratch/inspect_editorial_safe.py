import json
import os

extracted_dir = 'scratch/excel_extracted'
files = os.listdir(extracted_dir)

cal_file = None
for f in files:
    if 'calend' in f.lower() or 'editorial' in f.lower():
        cal_file = f
        break

if cal_file:
    print("Found file:", cal_file)
    with open(os.path.join(extracted_dir, cal_file), 'r', encoding='utf-8') as f:
        cal = json.load(f)
    
    headers = list(cal[2].values())
    rows = cal[3:]
    print("Total rows:", len(rows))
    print("Headers:", headers)
    for idx, r in enumerate(rows[:10]):
        # print keys and values
        print(f"Row {idx+4}: {list(r.values())[:6]}")
else:
    print("Calendario file not found!")

import json

with open('scratch/excel_extracted/07 Calendrio Editorial.json', 'r', encoding='utf-8') as f:
    cal = json.load(f)

# Reconstruct rows
headers = list(cal[2].values())
rows = cal[3:]

print(f"Total rows in Calendario Editorial: {len(rows)}")
print("Headers:", headers)
for idx, r in enumerate(rows[:10]):
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    print(f"Row {idx+4}: {row_dict.get('Tema / Assunto', '')} | URL: {row_dict.get('URL sugerida', '')} | Keyword: {row_dict.get('Keyword Principal', '')}")

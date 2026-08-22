import json

with open('scratch/excel_extracted/13 Dados Estratégia.json', 'r', encoding='utf-8') as f:
    estrat = json.load(f)

# Reconstruct rows
headers = list(estrat[2].values())
rows = estrat[3:]

print(f"Total rows in Dados Estrategia: {len(rows)}")
for idx, r in enumerate(rows):
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    print(f"Row {idx+4}: {row_dict}")

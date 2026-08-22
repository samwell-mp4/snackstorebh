import json

with open('scratch/excel_extracted/12 Dados Concorrente.json', 'r', encoding='utf-8') as f:
    concorrente = json.load(f)

# Reconstruct list of dicts with correct headers
headers = list(concorrente[2].values())
rows = concorrente[3:]

print(f"Total rows: {len(rows)}")
for idx, r in enumerate(rows[:30]):
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    print(f"Row {idx+3}: {row_dict['Keyword']} | Intent: {row_dict['Intent']} | Pos: {row_dict['Posição']} | URL: {row_dict['URL SEMrush']}")

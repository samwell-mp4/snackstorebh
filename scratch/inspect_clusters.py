import json

with open('scratch/excel_extracted/03 Clusters e Arquitetura.json', 'r', encoding='utf-8') as f:
    clusters = json.load(f)

# Reconstruct rows
for idx, r in enumerate(clusters[:30]):
    print(f"Row {idx+1}: {r}")

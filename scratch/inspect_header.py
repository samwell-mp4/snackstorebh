import json

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    keywords = json.load(f)

# Print first 10 rows as formatted JSON to see metadata header
print(json.dumps(keywords[:10], indent=2, ensure_ascii=False))

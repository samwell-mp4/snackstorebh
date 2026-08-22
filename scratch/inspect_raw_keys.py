import json

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# Reconstruct rows
print("Row 0:", master[0])
print("Row 1:", master[1])
print("Row 2:", master[2])
print("Row 3:", master[3])
print("Row 4:", master[4])

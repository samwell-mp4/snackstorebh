import pandas as pd
import json
import os

excel_path = 'Plano_SEO_Gigante_Snack_Store_BH_2026.xlsx'

if not os.path.exists(excel_path):
    print(f"Error: {excel_path} not found.")
    exit(1)

xl = pd.ExcelFile(excel_path)
print("Available sheets:", xl.sheet_names)

# We want to export sheet contents as JSON or clean text to read them
output_dir = 'scratch/excel_extracted'
os.makedirs(output_dir, exist_ok=True)

for sheet_name in xl.sheet_names:
    print(f"Parsing sheet: {sheet_name}")
    try:
        df = xl.parse(sheet_name)
        # Convert to list of dicts or handle empty
        data = df.to_dict(orient='records')
        # Handle nan values for JSON compatibility
        # We can clean it by replacing NaN with None
        df_cleaned = df.where(pd.notnull(df), None)
        data_cleaned = df_cleaned.to_dict(orient='records')
        
        with open(os.path.join(output_dir, f"{sheet_name}.json"), 'w', encoding='utf-8') as f:
            json.dump(data_cleaned, f, ensure_ascii=False, indent=2)
        print(f"Saved {sheet_name} as JSON.")
    except Exception as e:
        print(f"Failed parsing {sheet_name}: {e}")

print("Done exporting!")

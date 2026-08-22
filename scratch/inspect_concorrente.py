import json
import os

with open('scratch/excel_extracted/12 Dados Concorrente.json', 'r', encoding='utf-8') as f:
    concorrente = json.load(f)

print(f"Total rows in Dados Concorrente: {len(concorrente)}")
if len(concorrente) > 0:
    print("Concorrente keys:", list(concorrente[0].keys()))
    print("Concorrente header (row 1):", concorrente[0])
    print("Concorrente row 2:", concorrente[1])
    print("Concorrente row 3:", concorrente[2])
    print("Concorrente row 4:", concorrente[3])

with open('scratch/excel_extracted/13 Dados Estratégia.json', 'r', encoding='utf-8') as f:
    estrat = json.load(f)

print(f"\nTotal rows in Dados Estrategia: {len(estrat)}")
if len(estrat) > 0:
    print("Estrategia keys:", list(estrat[0].keys()))
    print("Estrategia row 1:", estrat[0])
    print("Estrategia row 2:", estrat[1])
    print("Estrategia row 3:", estrat[2])

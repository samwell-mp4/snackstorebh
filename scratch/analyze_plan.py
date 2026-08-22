import json
import os

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    keywords = json.load(f)

with open('scratch/excel_extracted/03 Clusters e Arquitetura.json', 'r', encoding='utf-8') as f:
    arch = json.load(f)

with open('scratch/excel_extracted/09 SEO Técnico.json', 'r', encoding='utf-8') as f:
    tecnico = json.load(f)

out = []
out.append(f"Total rows in Keywords Master: {len(keywords)}")
if len(keywords) > 0:
    out.append(f"Keys in first row of Keywords Master: {list(keywords[0].keys())}")

# Let's inspect some values of 'Keyword' or the key name
# Sometimes Excel exports columns with spaces or in different casing, let's see.
kw_key = None
for k in ['Keyword', 'keyword', 'Palavra-chave', 'Palavra Chave']:
    if len(keywords) > 0 and k in keywords[0]:
        kw_key = k
        break

if not kw_key:
    # default to whatever looks like keyword
    if len(keywords) > 0:
        kw_key = list(keywords[0].keys())[0]

out.append(f"Using keyword key: {kw_key}")

valid_kw = [k for k in keywords if k.get(kw_key) is not None]
out.append(f"Valid keywords count: {len(valid_kw)}")

# Let's group priorities
priorities = {}
for k in valid_kw:
    p = k.get('Prioridade')
    priorities[p] = priorities.get(p, 0) + 1
out.append(f"Priorities distribution: {priorities}")

# Let's print unique 'Cluster' and page types
clusters = {}
for k in valid_kw:
    c = k.get('Cluster')
    clusters[c] = clusters.get(c, 0) + 1
out.append(f"Clusters: {len(clusters)}")

page_types = {}
for k in valid_kw:
    pt = k.get('Tipo de página') or k.get('Tipo de Página')
    page_types[pt] = page_types.get(pt, 0) + 1
out.append(f"Page types: {page_types}")

# Let's extract target pages
target_pages = {}
for k in valid_kw:
    tp = k.get('Página-alvo') or k.get('Página Alvo') or k.get('URL')
    if tp:
        target_pages[tp] = target_pages.get(tp, [])
        target_pages[tp].append(k)
out.append(f"Unique Target Pages count: {len(target_pages)}")

# Print details of target pages
out.append("\n=== Unique Target Pages and their Keywords ===")
for tp, kws in sorted(target_pages.items(), key=lambda x: len(x[1]), reverse=True):
    kw_samples = [f"{k.get(kw_key)} ({k.get('Prioridade')})" for k in kws[:5]]
    out.append(f"Target URL: {tp} | Total Keywords: {len(kws)}")
    out.append(f"  Samples: {', '.join(kw_samples)}")

# Print some rows from architecture
out.append("\n=== Architecture Details ===")
out.append(json.dumps(arch, indent=2, ensure_ascii=False))

# Print technical SEO details
out.append("\n=== Technical SEO Details ===")
out.append(json.dumps(tecnico, indent=2, ensure_ascii=False))

with open('scratch/analyze_output.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))

print("Analysis written to scratch/analyze_output.txt")

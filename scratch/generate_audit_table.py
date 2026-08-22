import json
import os

# Load raw JSONs
with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    kw_raw = json.load(f)

# The columns are at index 2 (row 3)
headers = list(kw_raw[2].values())
rows = kw_raw[3:]

# Reconstruct list of dicts with correct headers
keywords = []
for r in rows:
    kw_dict = {}
    for idx, (k, v) in enumerate(r.items()):
        if idx < len(headers):
            kw_dict[headers[idx]] = v
    keywords.append(kw_dict)

valid_kw = [k for k in keywords if k.get('Keyword') is not None]

# Target URLs and their keywords
target_urls = {}
for k in valid_kw:
    url = k.get('Página-alvo')
    if url:
        # Strip trailing slash for consistency in mapping
        clean_url = url.strip()
        target_urls[clean_url] = target_urls.get(clean_url, [])
        target_urls[clean_url].append(k)

# Let's inspect current pages from App.jsx and seoPagesData.js
# We can hardcode the current routes we found or read them dynamically.
# Current static routes in App.jsx:
# /
# /politica-de-privacidade
# /trocas-e-devolucoes
# /termos-de-servico
# /perguntas-frequentes
# /cidades
# Dynamic Categories in categorySlugs / shown in CategoryPage:
# /mini-perfumes-importados
# /mini-perfumes-femininos
# /mini-perfumes-masculinos
# /mini-perfumes-unissex
# /brand-collection
# /arabic-collection
# /mini-perfumes-para-presente
# /mini-perfumes-em-bh
# SEO Landing Pages (seoPagesData.js):
# /comprar-mini-perfumes-importados
# /kit-perfume-feminino
# /kit-perfume-masculino
# /perfumes-importados-masculinos-25ml
# /perfumes-importados-femininos-25ml
# /perfumes-importados-unissex-25ml
# /mini-perfumes-importados-originais

# Let's match the proposed target URLs in the plan with current URLs to decide on Action ( FASE 1 - Auditoria )
# Let's map target URLs to keywords to list them in the report.

out = []
out.append("# MAPEAMENTO KEYWORD -> URL GIGANTE SEO GIGANTE\n")
out.append("| Cluster / Página-Alvo Planilha | URL Sugerida | URL Existente Equivalente | Decisão | Ação Proposta | Prioridade Máxima |")
out.append("|---|---|---|---|---|---|")

# Let's define current routes mapping table
current_routes_map = {
    '/brand-collection/': '/brand-collection',
    '/brand-collection/catalogo/': 'Não existe',
    '/brand-collection/equivalencias/': 'Não existe',
    '/mini-perfumes-25ml/': '/mini-perfumes-importados', # or /mini-perfumes-25ml (we don't have it, but /mini-perfumes-importados is similar)
    '/perfumes-femininos/': '/mini-perfumes-femininos',
    '/perfumes-masculinos/': '/mini-perfumes-masculinos',
    '/perfumes-arabes/': '/arabic-collection', # we have /arabic-collection
    '/blog/brand-collection-e-original/': 'Não existe',
    '/atacado-revenda-perfumes/': 'Não existe',
    '/blog/perfumes/': 'Não existe',
}

# Add product pages dynamic sample
# We'll parse which target pages belong to blog, product, categories.

for url, kws in sorted(target_urls.items(), key=lambda x: len(x[1]), reverse=True):
    # Find max priority in keywords for this URL
    max_p = 'P3'
    for k in kws:
        p = k.get('Prioridade')
        if p == 'P0':
            max_p = 'P0'
            break
        elif p == 'P1' and max_p != 'P0':
            max_p = 'P1'
        elif p == 'P2' and max_p not in ['P0', 'P1']:
            max_p = 'P2'

    cluster = kws[0].get('Cluster', 'N/A')
    
    # Match proposed URL
    existing = 'Não existe'
    decision = 'Criar'
    action = 'Criar nova rota no React Router e componente correspondente'
    
    # Simple logic to determine mapping
    if url == '/':
        existing = '/'
        decision = 'Manter e Otimizar'
        action = 'Otimizar H1, SEO Head e conteúdo da Home'
    elif 'produto/' in url:
        existing = '/produto/:slug'
        decision = 'Manter e Otimizar'
        action = 'Otimizar SEO Head dinâmico de produtos e descrições olfativas no JSON de dados'
    elif url in current_routes_map:
        existing = current_routes_map[url]
        if existing != 'Não existe':
            decision = 'Mapear e Otimizar'
            action = f"Ajustar rota de {existing} para {url} (ou usar redirect se necessário para manter histórico)"
    
    out.append(f"| {cluster} | `{url}` | `{existing}` | {decision} | {action} | {max_p} |")

# Let's count some metrics
p0_count = len([k for k in valid_kw if k.get('Prioridade') == 'P0'])
p1_count = len([k for k in valid_kw if k.get('Prioridade') == 'P1'])
p2_count = len([k for k in valid_kw if k.get('Prioridade') == 'P2'])
p3_count = len([k for k in valid_kw if k.get('Prioridade') == 'P3'])

metrics = f"""
## Estatísticas do Plano
- **Total de Palavras-Chave:** {len(valid_kw)}
- **Palavras P0:** {p0_count}
- **Palavras P1:** {p1_count}
- **Palavras P2:** {p2_count}
- **Palavras P3:** {p3_count}
- **Páginas-alvo Únicas mapeadas:** {len(target_urls)}
"""

with open('scratch/audit_table.md', 'w', encoding='utf-8') as f:
    f.write(metrics + '\n' + '\n'.join(out))

print("Audit table written to scratch/audit_table.md")

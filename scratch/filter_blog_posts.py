import json

with open('scratch/excel_extracted/01 Keywords Master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# Reconstruct rows
headers = list(master[2].values())
rows = master[3:]

blog_posts = []
for idx, r in enumerate(rows):
    row_dict = {}
    for col_idx, (k, v) in enumerate(r.items()):
        if col_idx < len(headers):
            row_dict[headers[col_idx]] = v
    
    keyword = row_dict.get('Keyword', '')
    url = row_dict.get('Página-alvo', '')
    p_type = row_dict.get('Tipo de página', '')
    priority = row_dict.get('Prioridade', '')
    title = row_dict.get('Título sugerido', '')
    
    # If target URL starts with /blog/ or type is Artigo/guia
    if url and '/blog/' in url:
        blog_posts.append({
            'row_num': idx + 4,
            'keyword': keyword,
            'url': url,
            'priority': priority,
            'title': title
        })

print(f"Total blog posts found: {len(blog_posts)}")
# Group by priority
p0_posts = [p for p in blog_posts if p['priority'] == 'P0']
p1_posts = [p for p in blog_posts if p['priority'] == 'P1']
p2_posts = [p for p in blog_posts if p['priority'] == 'P2']

print(f"P0: {len(p0_posts)} | P1: {len(p1_posts)} | P2: {len(p2_posts)}")
print("\nTop 15 P0/P1 blog posts from Keywords Master:")
for idx, p in enumerate((p0_posts + p1_posts)[:15]):
    print(f"  {idx+1}. Row: {p['row_num']} | Keyword: '{p['keyword']}' | URL: '{p['url']}' | Priority: {p['priority']} | Title: '{p['title']}'")

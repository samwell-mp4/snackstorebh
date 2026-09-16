import os
import re
import pandas as pd

# Caminhos das planilhas
SHEET1_PATH = r"C:\Users\Usuario\Documents\Snack store\scraper\brandcollection_25ml_scraper\perfumes_25ml.xlsx"
SHEET2_PATH = r"C:\Users\Usuario\Documents\Snack store\scraper\brand_collection_produtos.xlsx"

# Caminhos de destino dos JS
DEST1_PATH = r"c:\Users\Usuario\Snack Store\catalog_extension\perfumes_25ml.js"
DEST2_PATH = r"c:\Users\Usuario\Snack Store\catalog_extension\brand_collection_produtos.js"

# Termos de grifes famosas restritas (ignorar produtos que os contenham)
RESTRICTED_KEYWORDS = [
    'dior', 'chanel', 'gucci', 'prada', 'hermes', 'hermès', 'versace', 'armani', 
    'dolce', 'gabbana', 'yves saint laurent', 'ysl', 'tom ford', 'louis vuitton', 
    'carolina herrera', 'paco rabanne', 'creed'
]

def contains_restricted_brand(name):
    name_lower = name.lower()
    for kw in RESTRICTED_KEYWORDS:
        if kw in name_lower:
            return True
    return False

def clean_and_format_name(name):
    # Remove sufixo de preço se houver (comum na planilha 2)
    # Exemplo: ...R$ 89,97no pix...
    name = re.sub(r'R\$\s*\d+,\d+.*$', '', name)
    
    # Extrai o número do produto (ex: 517, 056, etc.)
    num_match = re.search(r'\b\d{3}\b|\b\d{2}\b|\b\d+\b', name)
    
    # Limpa referências a Brand Collection/Brandcollection
    cleaned = re.sub(r'\bBrand\s*collection\b', '', name, flags=re.IGNORECASE)
    
    if num_match:
        num = num_match.group(0)
        # Remove o número da parte restante
        rest = cleaned.replace(num, "", 1)
    else:
        num = ""
        rest = cleaned

    # Remove hifens, espaços duplos e pontuações do início/fim
    rest = re.sub(r'\s+', ' ', rest)
    rest = re.sub(r'^\s*[-–—\s]+\s*', '', rest)
    rest = re.sub(r'\s*[-–—\s]+\s*$', '', rest)
    rest = rest.strip()
    
    # Garante a informação de 25ml no restante
    if not re.search(r'\b25\s*ml\b', rest, re.IGNORECASE):
        rest = f"{rest} - 25ml"
    else:
        # Padroniza a terminação de 25ml
        rest = re.sub(r'\s*[-–—\s]*\b25\s*ml\b', ' - 25ml', rest, flags=re.IGNORECASE)
    
    # Reconstrói o nome no padrão solicitado
    if num:
        formatted_name = f"Perfumes Brandcollection {num} - {rest}"
    else:
        formatted_name = f"Perfumes Brandcollection - {rest}"
        
    return formatted_name, num

def process_images_url(url_string):
    if not isinstance(url_string, str):
        return ""
    # Divide por vírgula ou quebra de linha
    urls = re.split(r'[,\n]', url_string)
    # Limpa e filtra urls válidas
    cleaned_urls = []
    for u in urls:
        u_clean = u.strip()
        if u_clean.startswith("http"):
            cleaned_urls.append(u_clean)
    return ",".join(cleaned_urls)

def extract_price_from_text(name_text):
    # Procura por R$ XX,XX na string
    price_match = re.search(r'R\$\s*(\d+,\d+)', name_text)
    if price_match:
        try:
            return float(price_match.group(1).replace(',', '.'))
        except ValueError:
            pass
    return 79.0

def convert_sheet(sheet_path, dest_path, col_mapping):
    print(f"Lendo planilha: {sheet_path}...")
    if not os.path.exists(sheet_path):
        print(f"Erro: Planilha não encontrada em {sheet_path}")
        return
        
    df = pd.read_excel(sheet_path)
    
    # Substituir NaNs por string vazia ou valores padrão
    df = df.fillna("")
    
    processed_products = []
    skipped_count = 0
    seen_keys = set()
    
    for index, row in df.iterrows():
        raw_name = str(row[col_mapping['name']]).strip()
        
        # Filtra grifes famosas
        if contains_restricted_brand(raw_name):
            skipped_count += 1
            continue
            
        # Limpa e formata o nome e extrai o código
        formatted_name, code = clean_and_format_name(raw_name)
        
        # Se não extraiu o código do nome, podemos gerar um sequencial
        if not code:
            code = f"BC{index + 1:03d}"
            
        # Determina o preço
        if col_mapping.get('price_from_name'):
            price = extract_price_from_text(raw_name)
        else:
            price = 79.0
            
        # Descrição
        description = str(row[col_mapping['description']]).strip()
        
        # URLs de Imagens
        image_url = process_images_url(str(row[col_mapping['images']]))
        
        # URL do produto
        product_url = str(row[col_mapping['product_url']]).strip()
        
        # Evita itens sem imagem ou com erro na URL de imagem
        if not image_url or "erro" in image_url.lower():
            continue
            
        # Chave de unicidade (código + nome formatado)
        unique_key = (code, formatted_name)
        if unique_key in seen_keys:
            continue
        seen_keys.add(unique_key)
        
        product_data = {
            "code": code,
            "name": formatted_name,
            "brand": "Brand Collection",
            "price": price,
            "description": description,
            "image_url": image_url,
            "product_url": product_url
        }
        
        processed_products.append(product_data)
        
    # Escreve o arquivo JS no formato ESM
    print(f"Escrevendo {len(processed_products)} produtos (filtrados {skipped_count} itens de grifes restritas) para {dest_path}...")
    
    import json
    # Converte para string formatada
    json_str = json.dumps(processed_products, indent=2, ensure_ascii=False)
    
    # Cria o arquivo JS exportável
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(f"export const products = {json_str};\n")
        
    print("Sucesso!")

def main():
    # Planilha 1: perfumes_25ml.xlsx
    col_mapping1 = {
        'name': 'Nome do Produto',
        'description': 'Descrição',
        'images': 'URL das Imagens (Separadas por quebra de linha)',
        'product_url': 'URL do Produto',
        'price_from_name': False
    }
    
    # Devido a possível decodificação do nome da coluna "Descrição", vamos mapear dinamicamente caso mude
    # Tratando encoding
    try:
        df1 = pd.read_excel(SHEET1_PATH)
        for col in df1.columns:
            if 'descri' in col.lower():
                col_mapping1['description'] = col
    except Exception as e:
        print(f"Erro ao verificar colunas da planilha 1: {e}")
        
    convert_sheet(SHEET1_PATH, DEST1_PATH, col_mapping1)
    
    # Planilha 2: brand_collection_produtos.xlsx
    col_mapping2 = {
        'name': 'Nome',
        'description': 'Descricao',
        'images': 'Imagens',
        'product_url': 'URL Produto',
        'price_from_name': True
    }
    
    try:
        df2 = pd.read_excel(SHEET2_PATH)
        for col in df2.columns:
            if 'descri' in col.lower():
                col_mapping2['description'] = col
    except Exception as e:
        print(f"Erro ao verificar colunas da planilha 2: {e}")
        
    convert_sheet(SHEET2_PATH, DEST2_PATH, col_mapping2)

if __name__ == "__main__":
    main()

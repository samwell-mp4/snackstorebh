from PIL import Image
import os
import glob

source_dir = r"C:\Users\Usuario\Snack Store\fotos_perfumes\Arabic_25ml\1\r"
dest_dir = r"C:\Users\Usuario\Snack Store\public\assets\campaign"

images = sorted(glob.glob(os.path.join(source_dir, "*.png")))

for i, img_path in enumerate(images):
    img = Image.open(img_path)
    # Convert to RGB just in case
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    
    # Save as webp
    dest_name = f"scrolly_mobile_{i+1}.webp"
    dest_path = os.path.join(dest_dir, dest_name)
    
    # High quality, optimized
    img.save(dest_path, "WEBP", quality=85, optimize=True)
    print(f"Saved {dest_name} ({os.path.getsize(dest_path)} bytes)")


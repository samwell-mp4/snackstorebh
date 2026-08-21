from PIL import Image
import os
import glob

source_dir = r"C:\Users\Usuario\Snack Store\fotos_perfumes\Arabic_25ml\1\r"
dest_dir = r"C:\Users\Usuario\Snack Store\public\scrollytelling\mobile"

images = sorted(glob.glob(os.path.join(source_dir, "*.png")))

for i, img_path in enumerate(images):
    img = Image.open(img_path)
    
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
        # Create a background image (Snack cream color)
        bg = Image.new('RGBA', img.size, (245, 241, 232, 255))
        bg.paste(img, (0, 0), img)
        img = bg.convert('RGB')
    else:
        img = img.convert('RGB')
        
    dest_name = f"0{i+1}.webp"
    dest_path = os.path.join(dest_dir, dest_name)
    
    img.save(dest_path, "WEBP", quality=85, optimize=True)
    print(f"Saved {dest_name} with white background")


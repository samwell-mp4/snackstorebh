from PIL import Image
import os
import glob

source_dir = r"C:\Users\Usuario\Snack Store\fotos_perfumes\Arabic_25ml\1\r"
dest_dir = r"C:\Users\Usuario\Snack Store\public\scrollytelling\mobile"

images = sorted(glob.glob(os.path.join(source_dir, "*.png")))

for i, img_path in enumerate(images):
    img = Image.open(img_path)
    
    # Do NOT force conversion to RGB if it's RGBA.
    # WebP supports RGBA natively.
    if img.mode == 'P':
        img = img.convert('RGBA')
        
    dest_name = f"0{i+1}.webp"
    dest_path = os.path.join(dest_dir, dest_name)
    
    # Save as webp with alpha support
    img.save(dest_path, "WEBP", quality=85, optimize=True)
    print(f"Saved {dest_name} ({os.path.getsize(dest_path)} bytes)")


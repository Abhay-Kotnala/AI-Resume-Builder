import sys
from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    data = img.getdata()

    new_data = []
    # If a pixel's RGB is very close to pure black, make it completely transparent
    for item in data:
        # Check if R, G, B are all very dark (e.g., less than 15)
        if item[0] < 15 and item[1] < 15 and item[2] < 15:
            # Change to completely transparent exactly preserving original RGB but with 0 Alpha
            new_data.append((item[0], item[1], item[2], 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    make_transparent("C:/Users/abhay/Downloads/AI_Resume_Builder/frontend/public/logo.png", "C:/Users/abhay/Downloads/AI_Resume_Builder/frontend/public/logo_transparent.png")

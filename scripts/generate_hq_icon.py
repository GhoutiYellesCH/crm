import math
import os
from PIL import Image, ImageDraw, ImageFilter

MASTER_SIZE = 1024
SCALE = 2  # Render at 2048x2048 supersampled for ultra crispness
W = MASTER_SIZE * SCALE
H = MASTER_SIZE * SCALE
cx, cy = W // 2, H // 2 - 20

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 1. Radiant Ambient Outer Glow
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g_draw = ImageDraw.Draw(glow)
for r in range(750, 420, -20):
    alpha = int(45 * (1.0 - (r - 420) / 330))
    g_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(14, 165, 233, alpha))
glow = glow.filter(ImageFilter.GaussianBlur(radius=60))
img = Image.alpha_composite(img, glow)
draw = ImageDraw.Draw(img)

# 2. Modern Rounded Aegis Shield Outline
shield_top_y = 220
shield_shoulder_y = 560
shield_bottom_y = H - 240
shield_left_x = 300
shield_right_x = W - 300

outer_pts = [
    (cx, shield_top_y),
    (shield_right_x - 70, shield_top_y + 80),
    (shield_right_x, shield_shoulder_y),
    (shield_right_x - 60, 1140),
    (cx, shield_bottom_y),
    (shield_left_x + 60, 1140),
    (shield_left_x, shield_shoulder_y),
    (shield_left_x + 70, shield_top_y + 80),
]

# Outer metallic rim with cyan highlight
draw.polygon(outer_pts, fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=32)

# Bevel layer (subtle inner metallic edge)
bevel_pts = [
    (cx, shield_top_y + 36),
    (shield_right_x - 70 - 18, shield_top_y + 80 + 20),
    (shield_right_x - 22, shield_shoulder_y),
    (shield_right_x - 60 - 20, 1120),
    (cx, shield_bottom_y - 36),
    (shield_left_x + 60 + 20, 1120),
    (shield_left_x + 22, shield_shoulder_y),
    (shield_left_x + 70 + 18, shield_top_y + 80 + 20),
]
draw.polygon(bevel_pts, fill=(11, 19, 38, 255), outline=(99, 102, 241, 200), width=16)

# Deep inner shield chamber
inset = 72
inner_pts = [
    (cx, shield_top_y + inset + 20),
    (shield_right_x - 70 - inset//2, shield_top_y + 80 + inset),
    (shield_right_x - inset, shield_shoulder_y),
    (shield_right_x - 60 - inset, 1100),
    (cx, shield_bottom_y - inset - 30),
    (shield_left_x + 60 + inset, 1100),
    (shield_left_x + inset, shield_shoulder_y),
    (shield_left_x + 70 + inset//2, shield_top_y + 80 + inset),
]
draw.polygon(inner_pts, fill=(7, 10, 22, 255), outline=(30, 41, 59, 255), width=12)

# 3. Flow Dynamic Rings & Security Workflow Core
core_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cdraw = ImageDraw.Draw(core_layer)

# Hub coordinates
top_hub = (cx, cy - 240)
left_hub = (cx - 280, cy + 140)
right_hub = (cx + 280, cy + 140)
center_hub = (cx, cy + 320)

def draw_laser_beam(p1, p2, color, w):
    # Outer beam
    cdraw.line([p1, p2], fill=(*color, 50), width=w + 30)
    # Mid beam
    cdraw.line([p1, p2], fill=(*color, 140), width=w + 14)
    # Core sharp beam
    cdraw.line([p1, p2], fill=(255, 255, 255, 240), width=w)

# Draw connecting flow circuit
draw_laser_beam(top_hub, left_hub, (56, 189, 248), 18)
draw_laser_beam(top_hub, right_hub, (129, 140, 248), 18)
draw_laser_beam(left_hub, center_hub, (168, 85, 247), 18)
draw_laser_beam(right_hub, center_hub, (236, 72, 153), 18)
draw_laser_beam(left_hub, right_hub, (56, 189, 248), 12)
draw_laser_beam(top_hub, center_hub, (255, 255, 255), 14)

# Central Aegis Core Energy Orb
def draw_pulsing_orb(pos, radius, core_color, ring_color):
    x, y = pos
    # Outer halo
    cdraw.ellipse([x - radius - 20, y - radius - 20, x + radius + 20, y + radius + 20], fill=(*ring_color, 70))
    # Ring
    cdraw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=core_color, outline=(255, 255, 255, 240), width=10)
    # Specular lens highlight
    cdraw.ellipse([x - radius//2, y - radius//2, x + radius//2, y + radius//2], fill=(255, 255, 255, 230))

draw_pulsing_orb(top_hub, 64, (14, 165, 233), (56, 189, 248))
draw_pulsing_orb(left_hub, 56, (99, 102, 241), (129, 140, 248))
draw_pulsing_orb(right_hub, 56, (168, 85, 247), (192, 132, 252))
draw_pulsing_orb(center_hub, 72, (6, 182, 212), (255, 255, 255))

img = Image.alpha_composite(img, core_layer)

# Downsample to 1024x1024 with high quality Lanczos filter
master_icon = img.resize((MASTER_SIZE, MASTER_SIZE), Image.Resampling.LANCZOS)

# Save Master Assets
master_icon.save("app-icon.png", "PNG")
master_icon.save("public/logo.png", "PNG")

# Generate Tauri icon sizes
tauri_icons_dir = "src-tauri/icons"
os.makedirs(tauri_icons_dir, exist_ok=True)

sizes = {
    "32x32.png": (32, 32),
    "64x64.png": (64, 64),
    "128x128.png": (128, 128),
    "128x128@2x.png": (256, 256),
    "icon.png": (512, 512),
    "Square30x30Logo.png": (30, 30),
    "Square44x44Logo.png": (44, 44),
    "Square71x71Logo.png": (71, 71),
    "Square89x89Logo.png": (89, 89),
    "Square107x107Logo.png": (107, 107),
    "Square142x142Logo.png": (142, 142),
    "Square150x150Logo.png": (150, 150),
    "Square284x284Logo.png": (284, 284),
    "Square310x310Logo.png": (310, 310),
    "StoreLogo.png": (50, 50),
}

for filename, sz in sizes.items():
    resized = master_icon.resize(sz, Image.Resampling.LANCZOS)
    resized.save(os.path.join(tauri_icons_dir, filename), "PNG")

# Save multi-size .ico (Windows icon)
ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
master_icon.save(os.path.join(tauri_icons_dir, "icon.ico"), format="ICO", sizes=ico_sizes)
master_icon.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

print("Successfully regenerated ultra high-quality app icons and .ico files!")

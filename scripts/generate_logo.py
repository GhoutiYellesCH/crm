import math
from PIL import Image, ImageDraw, ImageFilter

WIDTH, HEIGHT = 512, 512
SCALE = 2
W, H = WIDTH * SCALE, HEIGHT * SCALE

# Create supersampled RGBA image for ultra crisp anti-aliasing
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Center and dimensions
cx, cy = W // 2, H // 2 - 20

# Draw background shield polygon
# Shield control points
shield_top_y = 120
shield_shoulder_y = 280
shield_bottom_y = 900
shield_left_x = 160
shield_right_x = W - 160

# Background glow
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
for r in range(320, 200, -15):
    alpha = int(35 * (1.0 - (r - 200) / 120))
    glow_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(14, 165, 233, alpha))
glow = glow.filter(ImageFilter.GaussianBlur(radius=40))
img = Image.alpha_composite(img, glow)
draw = ImageDraw.Draw(img)

# Outer Shield Path
shield_pts = [
    (cx, shield_top_y),
    (shield_right_x - 40, shield_top_y + 40),
    (shield_right_x, shield_shoulder_y),
    (shield_right_x - 30, 560),
    (cx, shield_bottom_y),
    (shield_left_x + 30, 560),
    (shield_left_x, shield_shoulder_y),
    (shield_left_x + 40, shield_top_y + 40),
]

# Outer rim
draw.polygon(shield_pts, fill=(15, 23, 42, 250), outline=(56, 189, 248, 230), width=18)

# Inner shield
inset = 36
inner_pts = [
    (cx, shield_top_y + inset + 10),
    (shield_right_x - 40 - inset//2, shield_top_y + 40 + inset),
    (shield_right_x - inset, shield_shoulder_y),
    (shield_right_x - 30 - inset, 550),
    (cx, shield_bottom_y - inset - 20),
    (shield_left_x + 30 + inset, 550),
    (shield_left_x + inset, shield_shoulder_y),
    (shield_left_x + 40 + inset//2, shield_top_y + 40 + inset),
]
draw.polygon(inner_pts, fill=(7, 12, 26, 255), outline=(99, 102, 241, 180), width=8)

# Central Emblem: Intersecting Workflow Nodes (Aegis + Flow)
# Draw connected circuit/flow lines
# 3 Main Hubs: Top (Security/Audit), Left (CRM/Clients), Right (Finance/MRR)
top_hub = (cx, cy - 130)
left_hub = (cx - 150, cy + 90)
right_hub = (cx + 150, cy + 90)
center_hub = (cx, cy + 180)

# Flow connection paths with cyan / violet glow
flow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
fdraw = ImageDraw.Draw(flow_layer)

def draw_glowing_line(p1, p2, color, width):
    fdraw.line([p1, p2], fill=(*color, 60), width=width + 16)
    fdraw.line([p1, p2], fill=(*color, 120), width=width + 8)
    fdraw.line([p1, p2], fill=(*color, 255), width=width)

# Connect hubs in dynamic loop
draw_glowing_line(top_hub, left_hub, (56, 189, 248), 12)
draw_glowing_line(top_hub, right_hub, (129, 140, 248), 12)
draw_glowing_line(left_hub, center_hub, (168, 85, 247), 12)
draw_glowing_line(right_hub, center_hub, (236, 72, 153), 12)
draw_glowing_line(left_hub, right_hub, (56, 189, 248), 8)
draw_glowing_line(top_hub, center_hub, (255, 255, 255), 10)

# Nodes circles
def draw_node(center, r, fill_col, ring_col):
    x, y = center
    fdraw.ellipse([x - r - 8, y - r - 8, x + r + 8, y + r + 8], fill=(*ring_col, 80))
    fdraw.ellipse([x - r, y - r, x + r, y + r], fill=fill_col, outline=ring_col, width=6)
    # Highlight
    fdraw.ellipse([x - r//2, y - r//2, x + r//2, y + r//2], fill=(255, 255, 255, 220))

draw_node(top_hub, 38, (14, 165, 233), (56, 189, 248))
draw_node(left_hub, 34, (99, 102, 241), (129, 140, 248))
draw_node(right_hub, 34, (168, 85, 247), (192, 132, 252))
draw_node(center_hub, 42, (6, 182, 212), (255, 255, 255))

img = Image.alpha_composite(img, flow_layer)

# Downsample with Lanczos for super smooth anti-aliased output
final_icon = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
final_icon.save("app-icon.png", "PNG")
final_icon.save("public/logo.png", "PNG")
print("Successfully generated app-icon.png & public/logo.png (512x512 RGBA)")

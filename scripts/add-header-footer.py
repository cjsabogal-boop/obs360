#!/usr/bin/env python3
"""
Script para agregar header y footer OBS360 a todos los artículos del blog
También asegura que todos tengan meta noindex, nofollow para privacidad
"""

import os
import re

BLOG_DIR = "/Users/carlossabogal/Desktop/Obs 2025 - Blog/blog"

# Lista de archivos a procesar
FILES = [
    "r-7wve3grv.html",
    "r-9bmh2k5t.html",
    "r-9p5p4kez.html",
    "r-bozoi772.html",
    "r-ewdkxo7h.html",
    "r-kdg51xre.html",
    "r-lkg9kvu6.html",
    "r-n6ppru77.html",
    "r-ntf1jphh.html",
    "r-ta8mpgnb.html",
    "r-teria1y3.html",
    "r-yk7khrld.html"
]

META_TAGS = '''    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />'''

CSS_STYLES = '''
    /* OBS360 Header Styles */
    .obs-header {
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 15px 0;
        position: sticky;
        top: 0;
        z-index: 1100;
    }
    .obs-header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .obs-logo img {
        height: 45px;
        width: auto;
    }
    .obs-back-link {
        color: #28529a;
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 25px;
        background: #f3f6fa;
        font-size: 14px;
        transition: all 0.3s ease;
    }
    .obs-back-link:hover {
        background: #28529a;
        color: white;
    }
    .obs-footer {
        background: linear-gradient(135deg, #1f2937 0%, #28529a 100%);
        padding: 40px 0;
        text-align: center;
        margin-top: 60px;
    }
    .obs-footer img {
        height: 50px;
        margin-bottom: 15px;
        filter: brightness(0) invert(1);
    }
    .obs-footer p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
    }
    .obs-footer-btn {
        display: inline-block;
        background: #84cc16;
        color: white;
        padding: 12px 30px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 20px;
        transition: all 0.3s ease;
    }
    .obs-footer-btn:hover {
        background: #65a30d;
        transform: translateY(-2px);
    }
'''

HEADER_HTML = '''
    <!-- OBS360 Header -->
    <header class="obs-header">
        <div class="obs-header-content">
            <a href="index.html" class="obs-logo">
                <img src="../Logo-Obs360.co_.webp" alt="OBS360 Logo" />
            </a>
            <a href="index.html" class="obs-back-link">
                ← Volver a Recursos
            </a>
        </div>
    </header>
'''

FOOTER_HTML = '''
    <!-- OBS360 Footer -->
    <footer class="obs-footer">
        <div class="max-w-7xl mx-auto px-4">
            <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
            <p>Recurso exclusivo para clientes de OBS360</p>
            <a href="https://wa.me/19803370518" target="_blank" class="obs-footer-btn">Contactar a OBS360</a>
        </div>
    </footer>
'''

def process_file(filepath):
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # 1. Add meta noindex, nofollow if not present
    if 'noindex, nofollow' not in content:
        # Find viewport meta tag and add after it
        viewport_pattern = r'(<meta\s+name="viewport"[^>]*>)'
        match = re.search(viewport_pattern, content, re.IGNORECASE)
        if match:
            content = content.replace(match.group(0), match.group(0) + '\n' + META_TAGS)
            modified = True
            print(f"  ✅ Agregado meta noindex, nofollow")
    else:
        print(f"  ℹ️  Ya tiene meta noindex, nofollow")
    
    # 2. Add CSS styles if not present
    if 'obs-header' not in content:
        # Add CSS before </style>
        content = content.replace('</style>', CSS_STYLES + '\n    </style>')
        modified = True
        print(f"  ✅ Agregado CSS de OBS360")
    else:
        print(f"  ℹ️  Ya tiene CSS de OBS360")
    
    # 3. Add header HTML if not present
    if 'obs-header' not in content or '<header class="obs-header">' not in content:
        # Find <body...> tag and add header after it
        body_pattern = r'(<body[^>]*>)'
        match = re.search(body_pattern, content, re.IGNORECASE)
        if match and 'class="obs-header"' not in content:
            content = content.replace(match.group(0), match.group(0) + HEADER_HTML)
            modified = True
            print(f"  ✅ Agregado header HTML")
    
    # 4. Add footer HTML if not present
    if 'obs-footer' not in content:
        # Add footer before </body>
        content = content.replace('</body>', FOOTER_HTML + '\n</body>')
        modified = True
        print(f"  ✅ Agregado footer HTML")
    else:
        print(f"  ℹ️  Ya tiene footer de OBS360")
    
    # Save changes
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  💾 Guardado: {filename}")
        return True
    else:
        print(f"  ⏭️  Sin cambios necesarios")
        return False

# Main
print("🚀 Procesando artículos del blog...\n")

modified_count = 0
for filename in FILES:
    filepath = os.path.join(BLOG_DIR, filename)
    if os.path.exists(filepath):
        print(f"📄 {filename}:")
        if process_file(filepath):
            modified_count += 1
        print()
    else:
        print(f"❌ No existe: {filename}\n")

print(f"\n✅ Proceso completado. {modified_count} archivos modificados de {len(FILES)} totales.")

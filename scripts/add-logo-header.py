#!/usr/bin/env python3
"""
Script para agregar header con SOLO el logo (sin botón Volver a Recursos)
"""

import os
import re

BLOG_DIR = "/Users/carlossabogal/Desktop/Obs 2025 - Blog/blog"

# Header con solo el logo (sin botón de navegación)
HEADER_HTML = '''
    <!-- OBS360 Header -->
    <header class="obs-header">
        <div class="obs-header-content">
            <div class="obs-logo">
                <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
            </div>
        </div>
    </header>
'''

# CSS para el header (solo logo)
HEADER_CSS = '''
    /* OBS360 Header */
    .obs-header {
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 15px 0;
    }
    .obs-header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    .obs-logo img {
        height: 45px;
        width: auto;
    }
'''

def process_file(filepath):
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # 1. Agregar CSS del header si no existe
    if '.obs-header {' not in content:
        # Buscar </style> y agregar antes
        if '</style>' in content:
            content = content.replace('</style>', HEADER_CSS + '\n    </style>')
            modified = True
            print(f"  ✅ Agregado CSS del header")
    else:
        print(f"  ℹ️  Ya tiene CSS del header")
    
    # 2. Agregar header HTML si no existe
    if '<header class="obs-header">' not in content:
        # Agregar después de <body...>
        body_match = re.search(r'(<body[^>]*>)', content, re.IGNORECASE)
        if body_match:
            content = content.replace(body_match.group(0), body_match.group(0) + HEADER_HTML)
            modified = True
            print(f"  ✅ Agregado header con logo")
    else:
        print(f"  ℹ️  Ya tiene header")
    
    # Guardar cambios
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  💾 Guardado: {filename}")
        return True
    else:
        print(f"  ⏭️  Sin cambios")
        return False

# Main
print("🚀 Agregando header con solo logo a todos los artículos...\n")

# Obtener todos los archivos r-*.html
files = [f for f in os.listdir(BLOG_DIR) if f.startswith('r-') and f.endswith('.html')]

modified_count = 0
for filename in sorted(files):
    filepath = os.path.join(BLOG_DIR, filename)
    print(f"📄 {filename}:")
    if process_file(filepath):
        modified_count += 1
    print()

print(f"\n✅ Proceso completado. {modified_count} archivos modificados de {len(files)} totales.")

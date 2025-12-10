#!/usr/bin/env python3
"""
Script para quitar el header con "Volver a Recursos" de todos los artículos
Los clientes solo deben ver su documento, no navegar al índice
"""

import os
import re

BLOG_DIR = "/Users/carlossabogal/Desktop/Obs 2025 - Blog/blog"

def process_file(filepath):
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # 1. Remover el header OBS360 completo (incluye el botón "Volver a Recursos")
    header_pattern = r'\s*<!-- OBS360 Header -->.*?</header>'
    if re.search(header_pattern, content, re.DOTALL):
        content = re.sub(header_pattern, '', content, flags=re.DOTALL)
        modified = True
        print(f"  ✅ Removido header con botón 'Volver a Recursos'")
    
    # 2. Remover CSS del header (ya no se necesita)
    css_header_pattern = r'/\* OBS360 Header Styles \*/.*?\.obs-back-link:hover \{[^}]*\}'
    if re.search(css_header_pattern, content, re.DOTALL):
        content = re.sub(css_header_pattern, '', content, flags=re.DOTALL)
        modified = True
        print(f"  ✅ Removido CSS del header")
    
    # Guardar cambios
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  💾 Guardado: {filename}")
        return True
    else:
        print(f"  ⏭️  Sin cambios (ya no tiene header)")
        return False

# Main
print("🚀 Quitando header 'Volver a Recursos' de todos los artículos...\n")

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

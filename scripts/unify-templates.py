#!/usr/bin/env python3
"""
Script para UNIFICAR todos los headers y footers de los artículos del blog
Asegura que TODOS tengan exactamente el mismo header y footer
"""

import os
import re

BLOG_DIR = "/Users/carlossabogal/Desktop/Obs 2025 - Blog/blog"

# Template estándar del footer (TEXTO ÚNICO PARA TODOS)
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

# Template estándar del header
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

def process_file(filepath):
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # 1. Remover cualquier footer existente y agregar el estándar
    # Buscar y eliminar footers existentes
    footer_pattern = r'<!-- OBS360 Footer -->.*?</footer>'
    if re.search(footer_pattern, content, re.DOTALL):
        content = re.sub(footer_pattern, '', content, flags=re.DOTALL)
        modified = True
        print(f"  🔄 Removido footer existente")
    
    # Buscar footers con clase obs-footer sin comentario
    footer_pattern2 = r'<footer class="obs-footer">.*?</footer>'
    if re.search(footer_pattern2, content, re.DOTALL):
        content = re.sub(footer_pattern2, '', content, flags=re.DOTALL)
        modified = True
        print(f"  🔄 Removido footer alternativo")
    
    # Agregar footer estándar antes de </body>
    if '</body>' in content:
        content = content.replace('</body>', FOOTER_HTML + '\n</body>')
        modified = True
        print(f"  ✅ Agregado footer estándar")
    
    # 2. Verificar que el header esté presente
    if '<header class="obs-header">' not in content:
        # Agregar header después de <body...>
        body_match = re.search(r'(<body[^>]*>)', content, re.IGNORECASE)
        if body_match:
            content = content.replace(body_match.group(0), body_match.group(0) + HEADER_HTML)
            modified = True
            print(f"  ✅ Agregado header estándar")
    else:
        print(f"  ℹ️  Ya tiene header")
    
    # 3. Verificar meta noindex
    if 'noindex, nofollow' not in content:
        viewport_pattern = r'(<meta\s+name="viewport"[^>]*>)'
        match = re.search(viewport_pattern, content, re.IGNORECASE)
        if match:
            meta_tags = '''    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />'''
            content = content.replace(match.group(0), match.group(0) + '\n' + meta_tags)
            modified = True
            print(f"  ✅ Agregado meta noindex")
    
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
print("🚀 Unificando headers y footers...\n")

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

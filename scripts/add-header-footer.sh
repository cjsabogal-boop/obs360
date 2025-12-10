#!/bin/bash
# Script para agregar header y footer OBS360 a todos los artículos

BLOG_DIR="/Users/carlossabogal/Desktop/Obs 2025 - Blog/blog"

# Lista de archivos sin header
FILES=(
    "r-7wve3grv.html"
    "r-9bmh2k5t.html"
    "r-9p5p4kez.html"
    "r-bozoi772.html"
    "r-ewdkxo7h.html"
    "r-kdg51xre.html"
    "r-lkg9kvu6.html"
    "r-n6ppru77.html"
    "r-ntf1jphh.html"
    "r-ta8mpgnb.html"
    "r-teria1y3.html"
    "r-yk7khrld.html"
)

# CSS a agregar antes de </style>
CSS_CONTENT='
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
'

# Header HTML
HEADER_HTML='
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
'

# Footer HTML
FOOTER_HTML='
    <!-- OBS360 Footer -->
    <footer class="obs-footer">
        <div class="max-w-7xl mx-auto px-4">
            <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
            <p>Recurso exclusivo para clientes de OBS360</p>
            <a href="https://wa.me/19803370518" target="_blank" class="obs-footer-btn">Contactar a OBS360</a>
        </div>
    </footer>
'

for file in "${FILES[@]}"; do
    filepath="$BLOG_DIR/$file"
    
    if [ ! -f "$filepath" ]; then
        echo "❌ No existe: $file"
        continue
    fi
    
    # Check if already has header
    if grep -q "obs-header" "$filepath"; then
        echo "⏭️  Ya tiene header: $file"
        continue
    fi
    
    echo "📄 Procesando: $file"
    
    # Create temp file
    tmpfile=$(mktemp)
    
    # Process the file
    awk -v css="$CSS_CONTENT" -v header="$HEADER_HTML" -v footer="$FOOTER_HTML" '
    /<\/style>/ && !css_added {
        print css
        css_added = 1
    }
    /<body[^>]*>/ && !header_added {
        print
        print header
        header_added = 1
        next
    }
    /<\/body>/ && !footer_added {
        print footer
        footer_added = 1
    }
    { print }
    ' "$filepath" > "$tmpfile"
    
    # Replace original file
    mv "$tmpfile" "$filepath"
    
    echo "✅ Completado: $file"
done

echo ""
echo "🎉 Proceso terminado!"

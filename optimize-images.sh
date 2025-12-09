#!/bin/bash

# Script de Optimización de Imágenes para OBS360 Blog
# Este script convierte y optimiza imágenes para mejorar el rendimiento

echo "🚀 Iniciando optimización de imágenes para OBS360 Blog..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}⚠️  ImageMagick no está instalado.${NC}"
    echo "Para instalar ImageMagick en macOS:"
    echo "  brew install imagemagick"
    echo ""
    echo "Después de instalar, ejecuta este script nuevamente."
    exit 1
fi

# Contador de archivos procesados
count=0

echo -e "${BLUE}📁 Buscando imágenes PNG y JPG...${NC}"
echo ""

# Procesar archivos PNG
for file in *.png; do
    if [ -f "$file" ]; then
        # Obtener nombre sin extensión
        filename="${file%.*}"
        
        # Verificar si ya existe la versión WebP
        if [ ! -f "${filename}.webp" ]; then
            echo -e "${GREEN}✓${NC} Convirtiendo: $file → ${filename}.webp"
            
            # Convertir a WebP con calidad 85 (buen balance calidad/tamaño)
            convert "$file" -quality 85 "${filename}.webp"
            
            # Mostrar reducción de tamaño
            original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            new_size=$(stat -f%z "${filename}.webp" 2>/dev/null || stat -c%s "${filename}.webp" 2>/dev/null)
            
            if [ ! -z "$original_size" ] && [ ! -z "$new_size" ]; then
                reduction=$((100 - (new_size * 100 / original_size)))
                echo "  📊 Reducción: ${reduction}% ($(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size))"
            fi
            
            ((count++))
        else
            echo -e "${YELLOW}⊘${NC} Ya existe: ${filename}.webp (omitiendo)"
        fi
        echo ""
    fi
done

# Procesar archivos JPG/JPEG
for file in *.jpg *.jpeg; do
    if [ -f "$file" ]; then
        filename="${file%.*}"
        
        if [ ! -f "${filename}.webp" ]; then
            echo -e "${GREEN}✓${NC} Convirtiendo: $file → ${filename}.webp"
            
            convert "$file" -quality 85 "${filename}.webp"
            
            original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            new_size=$(stat -f%z "${filename}.webp" 2>/dev/null || stat -c%s "${filename}.webp" 2>/dev/null)
            
            if [ ! -z "$original_size" ] && [ ! -z "$new_size" ]; then
                reduction=$((100 - (new_size * 100 / original_size)))
                echo "  📊 Reducción: ${reduction}% ($(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size))"
            fi
            
            ((count++))
        else
            echo -e "${YELLOW}⊘${NC} Ya existe: ${filename}.webp (omitiendo)"
        fi
        echo ""
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Optimización completada!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📈 Archivos procesados: $count"
echo ""
echo -e "${BLUE}💡 Próximos pasos:${NC}"
echo "1. Actualiza tus archivos HTML para usar las imágenes .webp"
echo "2. Ejemplo: <img src=\"imagen.webp\" alt=\"descripción\">"
echo "3. Para compatibilidad con navegadores antiguos, usa:"
echo "   <picture>"
echo "     <source srcset=\"imagen.webp\" type=\"image/webp\">"
echo "     <img src=\"imagen.jpg\" alt=\"descripción\">"
echo "   </picture>"
echo ""

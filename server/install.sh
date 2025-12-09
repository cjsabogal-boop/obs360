#!/bin/bash

# Script de instalación del Backend CMS - OBS360

echo "🚀 Instalando Backend CMS para OBS360 Blog..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}📦 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js no está instalado.${NC}"
    echo "Por favor instala Node.js desde: https://nodejs.org/"
    echo "O en el servidor, contacta a tu proveedor de hosting."
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js instalado: $NODE_VERSION"
echo ""

# Verificar npm
echo -e "${BLUE}📦 Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm no está instalado.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} npm instalado: $NPM_VERSION"
echo ""

# Navegar al directorio del servidor
cd "$(dirname "$0")"

# Instalar dependencias
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Dependencias instaladas correctamente"
else
    echo -e "${YELLOW}⚠️  Error al instalar dependencias${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Instalación completada!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}💡 Próximos pasos:${NC}"
echo ""
echo "1. Configurar variables de entorno:"
echo "   cp .env.example .env"
echo "   nano .env  # Editar si es necesario"
echo ""
echo "2. Iniciar el servidor:"
echo "   npm start"
echo ""
echo "3. O en modo desarrollo:"
echo "   npm run dev"
echo ""
echo "El servidor correrá en: http://localhost:3000"
echo ""

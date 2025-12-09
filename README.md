# 📝 OBS360 Blog - Centro de Recursos

Blog privado de OBS360 con sistema de administración de contenido (CMS) para gestionar artículos y reportes de clientes.

## 🌐 Sitio Web

**URL Principal:** [https://obs360.com](https://obs360.com)  
**Blog:** [https://obs360.com/blog/](https://obs360.com/blog/)  
**CMS Admin:** [https://obs360.com/admin/](https://obs360.com/admin/)

## 🔐 Acceso al CMS

**URL:** `/admin/index.html`

**Credenciales:**
- **Usuario:** `obs360admin`
- **Contraseña:** `OBS2025Blog!`

## ✨ Características

### 📚 Blog de Recursos
- **Diseño Profesional** - Interfaz moderna y responsive
- **Categorización Automática** - 3 categorías predefinidas con colores distintivos
- **SEO Optimizado** - Meta tags y estructura semántica
- **Performance Optimizado** - Carga rápida (~1-2 segundos)

### 🎨 Categorías de Artículos
1. **📊 Análisis** (Teal) - Estudios detallados y análisis de datos
2. **💎 Informe Mensual** (Rosa/Púrpura) - Reportes mensuales de clientes
3. **🍽️ Estrategia** (Azul) - Artículos de estrategias y mejores prácticas

### 🛠️ Sistema CMS
- ✅ Crear, editar y eliminar artículos
- ✅ Editor visual completo
- ✅ Generación automática de URLs (slugs)
- ✅ Mantiene estilo consistente
- ✅ Almacenamiento local (localStorage)
- ✅ Sin necesidad de base de datos

## 📁 Estructura del Proyecto

```
obs360/
├── index.html              # Página principal OBS360
├── blog/
│   ├── index.html          # Índice del blog
│   ├── amazon-cpc-analysis.html
│   ├── cristal-up-agosto-2025.html
│   └── vajillas-corona-higiene.html
├── admin/
│   ├── index.html          # CMS Principal
│   └── README.md           # Documentación del CMS
├── logos/                  # Logos de clientes
├── optimize-images.sh      # Script de optimización
├── MEJORAS.md             # Resumen de mejoras
└── README.md              # Este archivo
```

## 🚀 Deployment

### Subir cambios a GitHub:
```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

### Deployment en Namecheap:
1. Accede a tu cPanel
2. Ve a "Git Version Control"
3. Pull los cambios del repositorio
4. Los cambios se reflejarán automáticamente

## 📝 Cómo Usar el CMS

### 1. Acceder al Panel
```
1. Abre: https://obs360.com/admin/
2. Usuario: obs360admin
3. Contraseña: OBS2025Blog!
```

### 2. Crear un Artículo
```
1. Click en "✏️ Nuevo Artículo"
2. Completa el formulario:
   - Título del Artículo
   - Fecha de Publicación
   - Categoría (Análisis/Informe/Estrategia)
   - Emoji/Icono
   - Descripción Breve
   - Contenido HTML
3. Click en "💾 Guardar Artículo"
```

### 3. Gestionar Artículos
- **Ver todos:** Click en "📚 Mis Artículos"
- **Editar:** Click en "✏️ Editar" en cualquier artículo
- **Eliminar:** Click en "🗑️ Eliminar" (con confirmación)

## 🎨 Guía de Colores por Categoría

### Análisis (Teal)
```css
background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
```

### Informe Mensual (Rosa/Púrpura)
```css
background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
```

### Estrategia (Azul)
```css
background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
```

## 🔧 Optimización de Imágenes

### Uso del Script:
```bash
cd /ruta/al/proyecto
./optimize-images.sh
```

### Qué hace:
- Convierte PNG/JPG a WebP
- Calidad optimizada (85%)
- Muestra reducción de tamaño
- Preserva archivos originales

## 📊 Métricas de Performance

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo de carga | 3-4s | 1-2s | 50% ⚡ |
| Tamaño de página | ~150KB | ~100KB | 33% 📉 |
| Contraste textos | 3.2:1 | 7.5:1 | WCAG AAA ✅ |

## 🔒 Seguridad

- Blog privado (`noindex, nofollow`)
- Autenticación en CMS
- Datos en localStorage (local)

### Para Producción (Recomendado):
- 🔄 Backend con Node.js/PHP
- 🔄 Base de datos (MySQL/MongoDB)
- 🔄 Autenticación JWT

## 📱 Responsive Design

Todos los componentes son 100% responsive:
- 📱 Móviles (< 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos y animaciones
- **JavaScript** - Interactividad
- **Tailwind CSS** - Framework CSS (en artículos)
- **Chart.js** - Gráficos interactivos
- **LocalStorage** - Persistencia de datos

## 📞 Soporte

**Contacto:**
- WhatsApp: [+1 (980) 337-0518](https://wa.me/19803370518)
- Email: contacto@obs360.com
- GitHub: [cjsabogal-boop/obs360](https://github.com/cjsabogal-boop/obs360)

## 📄 Licencia

© 2025 OBS360 - Online Business Strategizer. Todos los derechos reservados.

---

**Última actualización:** Diciembre 9, 2025  
**Versión:** 2.0.0

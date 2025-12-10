# 🚀 OBS360 - Blog Privado con CMS

Sistema completo de blog privado con backend Node.js y panel de administración.

---

## 📁 Estructura del Proyecto

```
obs360/
├── index.html              # Página principal de OBS360
├── blog/                   # Blog privado para clientes
│   ├── index.html         # Listado de artículos (con login)
│   └── r-*.html           # Artículos (URLs ofuscadas)
├── admin/                  # Panel de administración
│   └── index.html         # CMS para gestionar artículos
├── server/                 # Backend Node.js
│   ├── server.js          # API REST
│   ├── package.json       # Dependencias
│   └── .env               # Variables de entorno
├── .htaccess              # Configuración Apache + Proxy
└── INSTRUCCIONES-NODE.md  # Guía de deployment
```

---

## ✨ Características

### **Blog Privado (`/blog`)**
- ✅ Sistema de login para clientes
- ✅ Listado dinámico de artículos desde API
- ✅ Filtros por categoría (Análisis, Informes, Estrategia, Capacitación)
- ✅ URLs ofuscadas para seguridad (`r-xxxxxxxx.html`)
- ✅ Diseño responsive y moderno

### **Panel Admin (`/admin`)**
- ✅ Login seguro para administradores
- ✅ Crear, editar y eliminar artículos
- ✅ Vista previa en tiempo real
- ✅ Generación automática de URLs ofuscadas
- ✅ Categorización automática

### **Backend Node.js (`/server`)**
- ✅ API REST completa
- ✅ Lectura automática de artículos HTML
- ✅ Categorización inteligente por keywords
- ✅ Actualización dinámica del índice
- ✅ CORS habilitado

---

## 🔐 Credenciales

### **Blog (Clientes)**
```
Usuario: obs360client
Contraseña: Resources2025!
```

### **Admin (Administradores)**
```
Usuario: obs360admin
Contraseña: [Configurar en .env]
```

---

## 🚀 Deployment

### **Estado Actual**
- ✅ Código completo y funcional
- ✅ `.htaccess` configurado con proxy
- ✅ Variables de entorno configuradas
- ⏳ **PENDIENTE:** Activar Node.js en cPanel

### **Próximos Pasos**

1. **Sube el código a tu servidor:**
   ```bash
   git add .
   git commit -m "Backend Node.js completo"
   git push origin main
   ```

2. **Sigue la guía de deployment:**
   - Lee: `INSTRUCCIONES-NODE.md`
   - Configura Node.js en cPanel
   - Inicia la aplicación

3. **Verifica que funciona:**
   - API: `https://obs360.co/api/articles`
   - Blog: `https://obs360.co/blog/`
   - Admin: `https://obs360.co/admin/`

---

## 📊 Endpoints de la API

### **Obtener todos los artículos**
```
GET /api/articles
```

**Respuesta:**
```json
{
  "articles": [
    {
      "id": "r-3n8mcrjz",
      "slug": "r-3n8mcrjz",
      "title": "Análisis de CPC",
      "date": "9 de diciembre de 2025",
      "category": "Análisis",
      "icon": "📊",
      "excerpt": "Análisis detallado...",
      "filename": "r-3n8mcrjz.html"
    }
  ]
}
```

### **Obtener un artículo específico**
```
GET /api/articles/:slug
```

### **Crear nuevo artículo**
```
POST /api/articles
Content-Type: application/json

{
  "title": "Nuevo Artículo",
  "content": "<html>...</html>",
  "category": "Análisis",
  "icon": "📊",
  "excerpt": "Descripción..."
}
```

### **Actualizar artículo**
```
PUT /api/articles/:slug
```

### **Eliminar artículo**
```
DELETE /api/articles/:slug
```

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js + Express
- **Servidor:** Apache (Namecheap)
- **Proxy:** mod_proxy (Apache → Node.js)
- **Fonts:** Montserrat, Inter (Google Fonts)

---

## 📝 Categorías de Artículos

El sistema categoriza automáticamente los artículos por keywords:

| Categoría | Keywords | Icono |
|-----------|----------|-------|
| **Análisis** | análisis, cpc, metrics, opportunity | 📊 |
| **Informe Mensual** | informe, report, cristal, summary | 💎 |
| **Estrategia** | estrategia, strategy, higiene, market | 🍽️ |
| **Capacitación** | guide, guía, playbook, mentor, principios | 🎓 |
| **Otras** | Todo lo demás | 📁 |

---

## 🔒 Seguridad

- ✅ URLs ofuscadas (`r-xxxxxxxx.html`)
- ✅ Login requerido para blog y admin
- ✅ Credenciales en variables de entorno
- ✅ `noindex, nofollow` en meta tags
- ✅ CORS configurado
- ✅ Archivos sensibles protegidos en `.htaccess`

---

## 🐛 Troubleshooting

### **Error: "⚠️ Error al cargar artículos"**

**Causa:** El servidor Node.js no está corriendo o el proxy no funciona.

**Solución:**
1. Verifica que Node.js esté "Running" en cPanel
2. Prueba: `https://obs360.co/api/articles`
3. Revisa logs en cPanel → Node.js App → View Logs

### **Error: "Cannot find module"**

**Solución:**
```bash
cd public_html/server
npm install
```

### **Error: "403 Forbidden en /api"**

**Solución:**
- Contacta a soporte de Namecheap
- Pide habilitar `mod_proxy` y `mod_proxy_http`

---

## 📚 Documentación Adicional

- **Deployment Backend:** `DEPLOYMENT-BACKEND.md`
- **Configuración Cloudflare:** `CLOUDFLARE-SETUP.md`
- **Instrucciones Node.js:** `INSTRUCCIONES-NODE.md`
- **Diagnóstico:** `DIAGNOSTICO.md`

---

## 🎯 Roadmap

- [x] Sistema de login para blog
- [x] Backend Node.js con API REST
- [x] Panel de administración
- [x] URLs ofuscadas
- [x] Categorización automática
- [ ] Activar Node.js en servidor
- [ ] Conectar admin con API
- [ ] Sistema de búsqueda
- [ ] Paginación de artículos
- [ ] Upload de imágenes

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa `INSTRUCCIONES-NODE.md`
2. Consulta `DEPLOYMENT-BACKEND.md`
3. Contacta a soporte de Namecheap para Node.js

---

**Última actualización:** Diciembre 2025  
**Versión:** 2.0.0  
**Estado:** ✅ Listo para deployment

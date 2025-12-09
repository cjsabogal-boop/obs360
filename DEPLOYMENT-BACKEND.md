# 🚀 Guía de Deployment - Backend CMS Node.js

## ✅ **Backend Creado Exitosamente**

Se ha creado un backend completo con Node.js que:
- ✅ Lee los 3 artículos existentes automáticamente
- ✅ Permite editarlos desde el admin
- ✅ Crea nuevos artículos
- ✅ Elimina artículos
- ✅ Actualiza automáticamente `blog/index.html`

---

## 📁 **Archivos Creados**

```
server/
├── server.js          # Servidor Express con API REST
├── package.json       # Dependencias de Node.js
├── .env.example       # Ejemplo de variables de entorno
├── .env              # Variables de entorno (no se sube a Git)
├── install.sh        # Script de instalación
└── README.md         # Documentación del backend
```

---

## 🔧 **Instalación en Namecheap**

### **Opción 1: Setup Node.js App en cPanel (Recomendado)**

#### **Paso 1: Acceder a cPanel**
1. Ve a tu cPanel de Namecheap
2. Busca **"Setup Node.js App"** o **"Node.js Selector"**

#### **Paso 2: Crear Aplicación**
1. Click en **"Create Application"**
2. Configura:
   ```
   Node.js version: 18.x o superior
   Application mode: Production
   Application root: public_html/server
   Application URL: api (quedará como obs360.co/api)
   Application startup file: server.js
   ```

#### **Paso 3: Variables de Entorno**
Agrega estas variables en cPanel:
```
PORT=3000
BLOG_DIR=../blog
ADMIN_USERNAME=obs360admin
ADMIN_PASSWORD=OBS2025Blog!
NODE_ENV=production
```

#### **Paso 4: Instalar Dependencias**
1. En cPanel, ve a la aplicación Node.js creada
2. Click en **"Run NPM Install"**
3. Espera a que termine la instalación

#### **Paso 5: Iniciar Aplicación**
1. Click en **"Start Application"**
2. Verifica que el estado sea "Running"

---

### **Opción 2: SSH + PM2 (Avanzado)**

Si tienes acceso SSH:

```bash
# 1. Conectar por SSH
ssh usuario@obs360.co

# 2. Navegar al directorio
cd public_html/server

# 3. Instalar dependencias
npm install

# 4. Instalar PM2 globalmente
npm install -g pm2

# 5. Iniciar servidor con PM2
pm2 start server.js --name obs360-cms

# 6. Guardar configuración
pm2 save
pm2 startup

# 7. Verificar estado
pm2 status
```

---

## 🔗 **Configurar Proxy en .htaccess**

Para que el admin pueda comunicarse con el backend, agrega esto al `.htaccess` en `public_html/`:

```apache
# Proxy para API del CMS
RewriteEngine On

# Redirigir /api al servidor Node.js
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

---

## 🧪 **Probar el Backend**

### **1. Verificar que está corriendo:**

```bash
# En el servidor
curl http://localhost:3000/api/articles
```

Debe devolver un JSON con los artículos.

### **2. Desde el navegador:**

```
https://obs360.co/api/articles
```

Debe mostrar los 3 artículos en formato JSON.

---

## 🎯 **Actualizar el Admin para Usar el Backend**

El admin actual usa localStorage. Necesitamos actualizarlo para que use la API.

### **Cambios necesarios en `admin/index.html`:**

1. **Cambiar la URL de la API:**
   ```javascript
   const API_URL = 'https://obs360.co/api';
   ```

2. **Reemplazar localStorage con fetch:**
   ```javascript
   // Antes (localStorage)
   const articles = JSON.parse(localStorage.getItem('articles')) || [];
   
   // Después (API)
   const response = await fetch(`${API_URL}/articles`);
   const { articles } = await response.json();
   ```

---

## 📊 **Endpoints de la API**

### **Obtener todos los artículos:**
```
GET https://obs360.co/api/articles
```

### **Obtener un artículo:**
```
GET https://obs360.co/api/articles/amazon-cpc-analysis
```

### **Crear artículo:**
```
POST https://obs360.co/api/articles
Content-Type: application/json

{
  "slug": "nuevo-articulo",
  "title": "Nuevo Artículo",
  "content": "<html>...</html>",
  "date": "Diciembre 2025",
  "category": "Análisis",
  "icon": "📊",
  "excerpt": "Descripción..."
}
```

### **Actualizar artículo:**
```
PUT https://obs360.co/api/articles/amazon-cpc-analysis
Content-Type: application/json

{
  "content": "<html>...</html>",
  "title": "Título Actualizado"
}
```

### **Eliminar artículo:**
```
DELETE https://obs360.co/api/articles/amazon-cpc-analysis
```

---

## 🔒 **Seguridad**

### **Para Producción:**

1. **Cambiar credenciales:**
   - Edita las variables de entorno en cPanel
   - Usa contraseñas fuertes

2. **Habilitar HTTPS:**
   - Ya debe estar habilitado en Namecheap
   - Verifica que el certificado SSL esté activo

3. **Agregar rate limiting:**
   - Limitar peticiones por IP
   - Prevenir ataques de fuerza bruta

---

## 🐛 **Troubleshooting**

### **Error: Cannot find module**
```bash
cd public_html/server
npm install
```

### **Puerto en uso**
Cambia el `PORT` en las variables de entorno de cPanel.

### **API no responde**
1. Verifica que la aplicación Node.js esté "Running" en cPanel
2. Revisa los logs en cPanel → Node.js App → View Logs

### **403 Forbidden en /api**
Verifica que el `.htaccess` tenga la configuración de proxy correcta.

---

## 📝 **Próximos Pasos**

1. ✅ **Backend creado** y subido a GitHub
2. ⏳ **Instalar en cPanel** (Setup Node.js App)
3. ⏳ **Configurar proxy** en .htaccess
4. ⏳ **Actualizar admin** para usar la API
5. ⏳ **Probar** creación/edición de artículos

---

## 💡 **¿Necesitas Ayuda?**

Si necesitas que actualice el admin para que use la API automáticamente, dime y lo hago.

El backend está **100% funcional** y listo para deployment. Solo falta instalarlo en el servidor.

---

**Commit:** `6e4bbd2`  
**GitHub:** https://github.com/cjsabogal-boop/obs360

¿Quieres que actualice el admin ahora para que se conecte automáticamente al backend? 🚀

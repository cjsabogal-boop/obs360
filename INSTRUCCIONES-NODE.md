# 🚀 Instrucciones para Activar Node.js en OBS360

## ✅ Estado Actual

- ✅ Código del servidor Node.js creado (`server/server.js`)
- ✅ Archivo `.env` configurado con credenciales
- ✅ `.htaccess` configurado con proxy para `/api`
- ✅ `blog/index.html` configurado para usar la API
- ⏳ **FALTA:** Instalar y arrancar Node.js en el servidor

---

## 📋 Pasos para Activar Node.js en Namecheap

### **Paso 1: Subir Todo a tu Servidor**

Primero, asegúrate de que todos los archivos estén en tu servidor:

```bash
# Desde tu computadora local
git add .
git commit -m "Configuración completa de Node.js backend"
git push origin main
```

Luego en cPanel:
1. Ve a **Git Version Control**
2. Click en **"Pull or Deploy"** junto a tu repositorio
3. Click en **"Update from Remote"**

---

### **Paso 2: Acceder a Setup Node.js App en cPanel**

1. **Inicia sesión en cPanel** de Namecheap
2. Busca **"Setup Node.js App"** o **"Node.js Selector"** en el buscador
3. Click en la aplicación

---

### **Paso 3: Crear Nueva Aplicación Node.js**

Click en **"Create Application"** y configura:

| Campo | Valor |
|-------|-------|
| **Node.js version** | 18.x o superior (la más reciente disponible) |
| **Application mode** | Production |
| **Application root** | `public_html/server` |
| **Application URL** | `api` (quedará como `obs360.co/api`) |
| **Application startup file** | `server.js` |
| **Passenger log file** | Dejar por defecto |

Click en **"Create"**

---

### **Paso 4: Configurar Variables de Entorno**

En la misma pantalla de la aplicación Node.js:

1. Busca la sección **"Environment Variables"**
2. Agrega estas variables (una por una):

```
PORT = 3000
BLOG_DIR = ../blog
ADMIN_USERNAME = obs360admin
ADMIN_PASSWORD = SecurePass2025!
NODE_ENV = production
```

**IMPORTANTE:** Cambia `ADMIN_PASSWORD` por una contraseña segura que solo tú conozcas.

Click en **"Save"** después de agregar cada variable.

---

### **Paso 5: Instalar Dependencias**

1. En la pantalla de la aplicación Node.js
2. Busca el botón **"Run NPM Install"** o **"NPM Install"**
3. Click en el botón
4. **Espera** 1-2 minutos mientras se instalan las dependencias
5. Verifica que diga "Installation completed successfully"

---

### **Paso 6: Iniciar la Aplicación**

1. Click en el botón **"Start Application"** o **"Restart Application"**
2. Espera unos segundos
3. Verifica que el estado cambie a **"Running"** (verde)

---

### **Paso 7: Verificar que Funciona**

#### **Opción A: Desde el navegador**

Abre en tu navegador:
```
https://obs360.co/api/articles
```

Deberías ver un JSON con todos tus artículos.

#### **Opción B: Desde cPanel Terminal (si tienes acceso SSH)**

```bash
curl http://localhost:3000/api/articles
```

---

## 🐛 Solución de Problemas

### **Error: "Application failed to start"**

**Solución:**
1. Ve a **"View Logs"** en la aplicación Node.js
2. Revisa el error específico
3. Verifica que todas las variables de entorno estén correctas
4. Asegúrate de que el archivo `server/server.js` existe en el servidor

---

### **Error: "Cannot find module"**

**Solución:**
1. Click en **"Stop Application"**
2. Click en **"Run NPM Install"** nuevamente
3. Espera a que termine
4. Click en **"Start Application"**

---

### **Error: "Port already in use"**

**Solución:**
1. Cambia el `PORT` en las variables de entorno a otro número (ej: `3001`)
2. Actualiza el `.htaccess` para usar el nuevo puerto:
   ```apache
   RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
   ```

---

### **Error: "403 Forbidden" al acceder a /api**

**Solución:**
1. Verifica que el módulo `mod_proxy` esté habilitado en Apache
2. Si no tienes acceso, contacta a soporte de Namecheap
3. Pide que habiliten `mod_proxy` y `mod_proxy_http`

---

### **Los artículos no cargan en el blog**

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña **"Network"**
3. Recarga la página del blog
4. Busca la petición a `/api/articles`
5. Revisa el error específico

**Errores comunes:**
- **CORS Error:** El servidor Node.js ya tiene CORS habilitado, verifica que esté corriendo
- **404 Not Found:** El proxy en `.htaccess` no está funcionando
- **500 Internal Server Error:** Revisa los logs de la aplicación Node.js

---

## 🎯 Verificación Final

Una vez que todo esté funcionando:

### **1. Verifica el Blog**
- Ve a: `https://obs360.co/blog/`
- Ingresa credenciales: `obs360client` / `Resources2025!`
- Deberías ver todos los artículos cargando correctamente

### **2. Verifica el Admin**
- Ve a: `https://obs360.co/admin/`
- Ingresa credenciales: `obs360admin` / `[tu contraseña]`
- Deberías poder ver, editar y crear artículos

---

## 📞 Contactar Soporte de Namecheap

Si tienes problemas con Node.js:

1. **Live Chat:** https://www.namecheap.com/support/live-chat/
2. **Ticket:** https://www.namecheap.com/support/
3. **Pregunta específica:** "Necesito habilitar Node.js y mod_proxy en mi hosting compartido"

---

## 🔄 Alternativa: Si Node.js No Está Disponible

Si tu plan de hosting no soporta Node.js:

### **Opción 1: Upgrade de Plan**
- Namecheap ofrece planes con Node.js desde ~$5/mes
- Busca planes "Stellar Plus" o superiores

### **Opción 2: Usar Hosting Externo para Node.js**
- **Render.com** (Gratis): https://render.com
- **Railway.app** (Gratis): https://railway.app
- **Vercel** (Gratis): https://vercel.com

En este caso, cambiarías la URL de la API en `blog/index.html`:
```javascript
const API_URL = 'https://tu-app.render.com/api';
```

---

## ✅ Checklist de Deployment

- [ ] Código subido a GitHub
- [ ] Pull realizado en cPanel
- [ ] Aplicación Node.js creada en cPanel
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (NPM Install)
- [ ] Aplicación iniciada (estado "Running")
- [ ] API responde en `/api/articles`
- [ ] Blog carga artículos correctamente
- [ ] Admin puede crear/editar artículos

---

**¿Necesitas ayuda con algún paso?** Avísame y te guío. 🚀

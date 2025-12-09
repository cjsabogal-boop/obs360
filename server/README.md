# 🚀 Backend CMS - OBS360 Blog

Backend Node.js/Express para gestionar el blog de OBS360.

## 📋 Características

- ✅ API REST completa
- ✅ Lectura de artículos existentes
- ✅ Crear, editar y eliminar artículos
- ✅ Actualización automática del índice del blog
- ✅ Autenticación simple
- ✅ CORS habilitado

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd server
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Variables:
```
PORT=3000
BLOG_DIR=../blog
ADMIN_USERNAME=obs360admin
ADMIN_PASSWORD=OBS2025Blog!
NODE_ENV=development
```

### 3. Iniciar el servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor correrá en `http://localhost:3000`

## 📡 API Endpoints

### Autenticación

**POST** `/api/login`
```json
{
  "username": "obs360admin",
  "password": "OBS2025Blog!"
}
```

### Artículos

**GET** `/api/articles`
- Obtiene todos los artículos

**GET** `/api/articles/:slug`
- Obtiene un artículo específico

**POST** `/api/articles`
```json
{
  "slug": "mi-articulo",
  "title": "Mi Artículo",
  "content": "<html>...</html>",
  "date": "Diciembre 2025",
  "category": "Análisis",
  "icon": "📊",
  "excerpt": "Descripción breve..."
}
```

**PUT** `/api/articles/:slug`
```json
{
  "content": "<html>...</html>",
  "title": "Título Actualizado"
}
```

**DELETE** `/api/articles/:slug`
- Elimina un artículo

## 🏗️ Estructura

```
server/
├── server.js          # Servidor principal
├── package.json       # Dependencias
├── .env              # Variables de entorno
├── .env.example      # Ejemplo de variables
└── README.md         # Este archivo
```

## 🚀 Deployment en Namecheap

### Opción 1: Node.js Application (cPanel)

1. **Ve a cPanel → Setup Node.js App**
2. **Create Application:**
   - Node.js version: 18.x o superior
   - Application mode: Production
   - Application root: `/home/usuario/obs360/server`
   - Application URL: `obs360.co/api`
   - Application startup file: `server.js`

3. **Variables de entorno:**
   - Agrega las variables del `.env`

4. **Start Application**

### Opción 2: PM2 (SSH)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar servidor
cd /home/usuario/obs360/server
pm2 start server.js --name obs360-cms

# Guardar configuración
pm2 save
pm2 startup
```

## 🔒 Seguridad

### Para Producción:

1. **Cambiar credenciales:**
   - Actualiza `ADMIN_USERNAME` y `ADMIN_PASSWORD` en `.env`

2. **Usar HTTPS:**
   - Configura SSL en Namecheap

3. **Agregar JWT:**
   - Implementar tokens JWT para sesiones

4. **Rate limiting:**
   - Agregar límites de peticiones

## 🧪 Pruebas

### Probar API localmente:

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"obs360admin","password":"OBS2025Blog!"}'

# Obtener artículos
curl http://localhost:3000/api/articles
```

## 📝 Notas

- El servidor lee los archivos HTML existentes en `../blog`
- Actualiza automáticamente `blog/index.html` cuando se crean/editan/eliminan artículos
- Los artículos se guardan como archivos HTML individuales
- No requiere base de datos

## 🐛 Troubleshooting

### Error: Cannot find module

```bash
npm install
```

### Puerto en uso

Cambia el `PORT` en `.env`

### Permisos de archivos

```bash
chmod 755 server.js
chmod 644 .env
```

## 📞 Soporte

- GitHub: https://github.com/cjsabogal-boop/obs360
- Email: contacto@obs360.com

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 9, 2025

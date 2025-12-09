# 🔍 Diagnóstico de Problemas - Blog OBS360

## ❌ Problema Reportado
La URL del blog no carga correctamente en el servidor.

## 🔎 Posibles Causas

### 1. **Case Sensitivity (Más Probable)**
- **Problema:** Los servidores Linux distinguen entre mayúsculas y minúsculas
- **Carpeta local:** `blog/` (con B mayúscula)
- **URL intentada:** Puede ser `/blog/` (con b minúscula)
- **Solución:** Usar la URL exacta `/blog/` o configurar redirecciones

### 2. **Permisos de Archivos**
- **Problema:** Los archivos/carpetas pueden no tener permisos correctos
- **Solución:** Configurar permisos adecuados

### 3. **Archivo Index Faltante**
- **Problema:** El servidor no encuentra `index.html` en la carpeta Blog
- **Solución:** Verificar que existe `blog/index.html`

## ✅ Soluciones Implementadas

### 1. Archivo .htaccess Creado
Se creó `.htaccess` con:
- ✅ Redirección de `/blog` a `/Blog`
- ✅ Compresión GZIP
- ✅ Cache de navegador
- ✅ Seguridad mejorada

### 2. Estructura Verificada
```
obs360/
├── index.html (principal)
├── blog/
│   ├── index.html ✅
│   ├── amazon-cpc-analysis.html ✅
│   ├── cristal-up-agosto-2025.html ✅
│   └── vajillas-corona-higiene.html ✅
└── admin/
    └── index.html ✅
```

## 🧪 URLs para Probar

Prueba estas URLs en orden:

1. **URL Principal (debe funcionar):**
   ```
   https://obs360.com
   https://obs360.com/index.html
   ```

2. **URL del Blog (con mayúscula):**
   ```
   https://obs360.com/blog/
   https://obs360.com/blog/index.html
   ```

3. **URL del Blog (con minúscula - debe redirigir):**
   ```
   https://obs360.com/blog/
   https://obs360.com/blog/index.html
   ```

4. **URL del Admin:**
   ```
   https://obs360.com/admin/
   https://obs360.com/admin/index.html
   ```

5. **Artículos individuales:**
   ```
   https://obs360.com/blog/amazon-cpc-analysis.html
   https://obs360.com/blog/cristal-up-agosto-2025.html
   https://obs360.com/blog/vajillas-corona-higiene.html
   ```

## 🔧 Comandos para Verificar en cPanel

### Opción 1: Terminal (si tienes acceso SSH)
```bash
# Ver permisos
ls -la /home/usuario/public_html/

# Verificar que existe la carpeta Blog
ls -la /home/usuario/public_html/blog/

# Corregir permisos si es necesario
chmod 755 /home/usuario/public_html/Blog
chmod 644 /home/usuario/public_html/blog/*.html
```

### Opción 2: File Manager en cPanel
1. Ve a cPanel > File Manager
2. Navega a `public_html/`
3. Verifica que existe la carpeta `Blog` (con B mayúscula)
4. Click derecho en `Blog` > Permissions
5. Debe ser: `755` (rwxr-xr-x)
6. Para archivos HTML: `644` (rw-r--r--)

## 🚨 Errores Comunes y Soluciones

### Error 404 - Not Found
**Causa:** La carpeta o archivo no existe
**Solución:**
1. Verificar que la carpeta se llama exactamente `Blog` (con B mayúscula)
2. Verificar que existe `blog/index.html`
3. Usar la URL exacta: `https://obs360.com/blog/`

### Error 403 - Forbidden
**Causa:** Permisos incorrectos
**Solución:**
```bash
chmod 755 blog/
chmod 644 blog/*.html
```

### Error 500 - Internal Server Error
**Causa:** Problema en `.htaccess`
**Solución:**
1. Renombrar temporalmente `.htaccess` a `.htaccess.bak`
2. Probar si funciona sin él
3. Si funciona, revisar sintaxis del `.htaccess`

## 📝 Checklist de Verificación

- [ ] La carpeta se llama `Blog` (con B mayúscula)
- [ ] Existe el archivo `blog/index.html`
- [ ] Los permisos son correctos (755 para carpetas, 644 para archivos)
- [ ] El archivo `.htaccess` está en `public_html/`
- [ ] Se probó con la URL exacta: `https://obs360.com/blog/`
- [ ] Se limpió el cache del navegador (Ctrl+Shift+R)

## 🔗 Enlaces de Referencia

- **Repositorio GitHub:** https://github.com/cjsabogal-boop/obs360
- **Documentación:** README.md
- **Guía CMS:** admin/README.md

## 💡 Próximos Pasos

1. **Verificar URL exacta:** Usa `https://obs360.com/blog/` (con B mayúscula)
2. **Revisar permisos:** En cPanel File Manager
3. **Limpiar cache:** Del navegador y del servidor (si aplica)
4. **Probar sin .htaccess:** Renombrar temporalmente si hay problemas
5. **Revisar logs:** En cPanel > Error Log para ver el error exacto

## 📞 Soporte

Si el problema persiste, necesitaremos:
1. El mensaje de error exacto que aparece
2. La URL exacta que estás intentando acceder
3. Screenshot del error (si es posible)
4. Verificar en cPanel > Error Log el último error

---

**Creado:** Diciembre 9, 2025  
**Versión:** 1.0

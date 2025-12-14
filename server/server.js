const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BLOG_DIR = path.join(__dirname, process.env.BLOG_DIR || '../blog');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Autenticación simple para middleware
const authenticate = (req, res, next) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
};

// ==================== AUTENTICACIÓN SEGURA ====================

// Endpoint de autenticación para ADMIN (CMS)
app.post('/api/auth/admin', (req, res) => {
    const { username, password } = req.body;

    const validUsername = process.env.ADMIN_USERNAME || 'obs360admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'Obs.2025$$';

    if (username === validUsername && password === validPassword) {
        res.json({
            success: true,
            message: 'Login exitoso',
            type: 'admin'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }
});

// Endpoint de autenticación para BLOG (Clientes)
app.post('/api/auth/blog', (req, res) => {
    const { username, password } = req.body;

    // Credenciales del blog desde variables de entorno
    const validUsername = process.env.BLOG_USERNAME || 'obs360admin';
    const validPassword = process.env.BLOG_PASSWORD || 'Obs.2025$$';

    if (username === validUsername && password === validPassword) {
        res.json({
            success: true,
            message: 'Acceso autorizado',
            type: 'blog'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }
});

// ==================== TEMPLATES OBS360 ====================

// CSS para header (solo logo) y footer - MEJORADO V2
const OBS360_CSS = `
/* ========== OBS360 Branding Estándar ========== */
.obs-header {
    background: white !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 15px 0;
    position: sticky;
    top: 0;
    z-index: 9999;
}
.obs-header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.obs-logo img {
    height: 45px;
    width: auto;
}
.obs-header-badge {
    background: linear-gradient(135deg, #28529a, #84cc16);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
}
.obs-footer {
    background: linear-gradient(135deg, #1f2937 0%, #28529a 100%) !important;
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
    margin-bottom: 10px; 
}
.obs-footer-btn {
    display: inline-block;
    background: #84cc16;
    color: white !important;
    padding: 12px 30px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 15px;
    transition: all 0.3s ease;
}
.obs-footer-btn:hover { 
    background: #65a30d; 
    transform: translateY(-2px); 
}
/* ========== Fin OBS360 Branding ========== */
`;

// Header con logo y badge - MEJORADO V2
const OBS360_HEADER = `
<!-- OBS360 Header Estándar -->
<header class="obs-header">
    <div class="obs-header-content">
        <div class="obs-logo">
            <a href="../index.html">
                <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
            </a>
        </div>
        <span class="obs-header-badge">RECURSO PRIVADO</span>
    </div>
</header>
`;

// Footer estándar - MEJORADO V2
const OBS360_FOOTER = `
<!-- OBS360 Footer Estándar -->
<footer class="obs-footer">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
        <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
        <p>Recurso exclusivo para clientes de OBS360</p>
        <p style="font-size: 12px; opacity: 0.6;">© 2025 OBS360 - Todos los derechos reservados</p>
        <a href="https://wa.me/19803370518" target="_blank" class="obs-footer-btn">Contactar a OBS360</a>
    </div>
</footer>
`;

// Función FORZADA para aplicar template OBS360 (siempre re-aplica) - V2
function forceOBS360Template(htmlContent) {
    const $ = cheerio.load(htmlContent, { decodeEntities: false });

    // 1. SIEMPRE asegurar meta noindex, nofollow
    $('meta[name="robots"]').remove();
    $('head').append('<meta name="robots" content="noindex, nofollow" />');

    // 2. SIEMPRE asegurar favicon
    $('link[rel="icon"]').remove();
    $('head').append('<link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />');

    // 3. Remover TODOS los header/footer OBS360 existentes
    $('.obs-header').remove();
    $('header.obs-header').remove();
    $('.obs-footer').remove();
    $('footer.obs-footer').remove();

    // 4. Limpiar CSS duplicado de OBS360 en todos los <style>
    $('style').each(function () {
        let css = $(this).html() || '';
        // Eliminar todos los bloques CSS de OBS360
        css = css.replace(/\/\*\s*=+\s*OBS360[\s\S]*?=+\s*\*\//g, '');
        css = css.replace(/\/\*\s*=+\s*Fin OBS360[\s\S]*?=+\s*\*\//g, '');
        css = css.replace(/\/\*\s*OBS360[\s\S]*?\*\//g, '');
        css = css.replace(/\.obs-[a-z-]+\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\.obs-[a-z-]+:hover\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\.obs-[a-z-]+\s+img\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\.obs-[a-z-]+\s+p\s*\{[\s\S]*?\}/g, '');
        // Limpiar líneas vacías múltiples
        css = css.replace(/\n\s*\n\s*\n+/g, '\n\n');
        $(this).html(css.trim());
    });

    // 5. Agregar CSS de OBS360 al primer <style> o crear uno nuevo
    if ($('style').length > 0) {
        $('style').first().append('\n' + OBS360_CSS);
    } else {
        $('head').append('<style>' + OBS360_CSS + '</style>');
    }

    // 6. ARREGLAR BODY: Eliminar clases y estilos que rompen el layout
    const $body = $('body');

    // Eliminar clases problemáticas de Tailwind
    const bodyClasses = $body.attr('class') || '';
    const cleanedClasses = bodyClasses
        .split(' ')
        .filter(cls => !['flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'h-screen'].includes(cls))
        .join(' ');
    $body.attr('class', cleanedClasses);

    // Eliminar overflow:hidden del style inline
    const bodyStyle = $body.attr('style') || '';
    const cleanedStyle = bodyStyle.replace(/overflow\s*:\s*hidden\s*;?/gi, '');
    if (cleanedStyle) {
        $body.attr('style', cleanedStyle);
    } else {
        $body.removeAttr('style');
    }

    // Agregar CSS para arreglar layout del body
    $('head').append(`
    <style>
    body {
        display: block !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        min-height: auto !important;
        height: auto !important;
    }
    </style>
    `);

    // 7. SIEMPRE agregar header al inicio del body
    $body.prepend(OBS360_HEADER);

    // 8. SIEMPRE agregar footer al final del body
    $body.append(OBS360_FOOTER);

    return $.html();
}

// Función legacy para compatibilidad (ahora usa forceOBS360Template)
function wrapWithOBS360Template(htmlContent) {
    return forceOBS360Template(htmlContent);
}

// ==================== RUTAS ====================

// Login
app.post('/api/login', authenticate, (req, res) => {
    res.json({ success: true, message: 'Login exitoso' });
});

// ==================== CATEGORÍAS ====================

const CATEGORIES_FILE = path.join(BLOG_DIR, 'categories.json');

// Categorías por defecto
const DEFAULT_CATEGORIES = [
    { id: 'analisis', name: 'Análisis', icon: '📊', color: '#d1fae5', textColor: '#065f46', isDefault: false },
    { id: 'informe', name: 'Informe Mensual', icon: '💎', color: '#fce7f3', textColor: '#9f1239', isDefault: false },
    { id: 'estrategia', name: 'Estrategia', icon: '🍽️', color: '#dbeafe', textColor: '#1e3a8a', isDefault: false },
    { id: 'capacitacion', name: 'Capacitación', icon: '🎓', color: '#fef3c7', textColor: '#92400e', isDefault: false },
    { id: 'herramientas', name: 'Herramientas', icon: '🛠️', color: '#e0e7ff', textColor: '#3730a3', isDefault: false },
    { id: 'otras', name: 'Otras', icon: '📁', color: '#f3f4f6', textColor: '#374151', isDefault: true }
];

// Cargar categorías
async function loadCategories() {
    try {
        if (await fs.pathExists(CATEGORIES_FILE)) {
            const content = await fs.readFile(CATEGORIES_FILE, 'utf-8');
            const data = JSON.parse(content);
            return data.categories || DEFAULT_CATEGORIES;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
    return DEFAULT_CATEGORIES;
}

// Guardar categorías
async function saveCategories(categories) {
    try {
        await fs.writeFile(CATEGORIES_FILE, JSON.stringify({ categories }, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error saving categories:', error);
        return false;
    }
}

// GET - Obtener todas las categorías
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await loadCategories();
        res.json({ categories });
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// POST - Crear nueva categoría
app.post('/api/categories', async (req, res) => {
    try {
        const { name, icon, color, textColor } = req.body;

        if (!name || !icon) {
            return res.status(400).json({ error: 'Nombre e icono son requeridos' });
        }

        const categories = await loadCategories();

        // Generar ID
        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Verificar si ya existe
        if (categories.find(c => c.id === id)) {
            return res.status(400).json({ error: 'Ya existe una categoría con este nombre' });
        }

        const newCategory = {
            id,
            name,
            icon,
            color: color || '#e0e7ff',
            textColor: textColor || '#3730a3',
            isDefault: false
        };

        categories.push(newCategory);
        await saveCategories(categories);

        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
});

// PUT - Actualizar categoría
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color, textColor } = req.body;

        const categories = await loadCategories();
        const index = categories.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        const oldName = categories[index].name;

        categories[index] = {
            ...categories[index],
            name: name || categories[index].name,
            icon: icon || categories[index].icon,
            color: color || categories[index].color,
            textColor: textColor || categories[index].textColor
        };

        await saveCategories(categories);

        // Si cambió el nombre, actualizar artículos
        if (oldName !== name && name) {
            await updateArticleCategoriesInFiles(oldName, name);
        }

        res.json({ success: true, category: categories[index] });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
});

// DELETE - Eliminar categoría
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const categories = await loadCategories();
        const category = categories.find(c => c.id === id);

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        if (category.isDefault) {
            return res.status(400).json({ error: 'No puedes eliminar la categoría por defecto' });
        }

        // Mover artículos a "Otras"
        const movedCount = await updateArticleCategoriesInFiles(category.name, 'Otras');

        // Eliminar categoría
        const newCategories = categories.filter(c => c.id !== id);
        await saveCategories(newCategories);

        res.json({
            success: true,
            message: `Categoría eliminada. ${movedCount} artículo(s) movidos a "Otras".`
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
});

// Función para actualizar categorías en los archivos de artículos
async function updateArticleCategoriesInFiles(oldCategory, newCategory) {
    let updatedCount = 0;
    try {
        const files = await fs.readdir(BLOG_DIR);
        const htmlFiles = files.filter(file =>
            file.endsWith('.html') &&
            file !== 'index.html' &&
            !file.includes('v1')
        );

        for (const file of htmlFiles) {
            const filePath = path.join(BLOG_DIR, file);
            let content = await fs.readFile(filePath, 'utf-8');

            // Simple check if the file mentions the old category
            if (content.includes(oldCategory)) {
                content = content.replace(new RegExp(oldCategory, 'g'), newCategory);
                await fs.writeFile(filePath, content, 'utf-8');
                updatedCount++;
            }
        }

        console.log(`✅ Actualizados ${updatedCount} artículos de "${oldCategory}" a "${newCategory}"`);
    } catch (error) {
        console.error('Error updating article categories:', error);
    }
    return updatedCount;
}

// Obtener todos los artículos
app.get('/api/articles', async (req, res) => {
    try {
        // Cargar metadatos de artículos (con tags)
        const articlesMetaPath = path.join(BLOG_DIR, 'articles-meta.json');
        let articlesMeta = {};
        try {
            if (await fs.pathExists(articlesMetaPath)) {
                articlesMeta = JSON.parse(await fs.readFile(articlesMetaPath, 'utf-8'));
            }
        } catch (e) { }

        const files = await fs.readdir(BLOG_DIR);
        const htmlFiles = files.filter(file =>
            file.endsWith('.html') &&
            file !== 'index.html' &&
            !file.includes('v1') // Excluir archivos originales
        );

        const articles = [];

        for (const file of htmlFiles) {
            const filePath = path.join(BLOG_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const $ = cheerio.load(content);

            // Obtener fecha de modificación del archivo
            const stats = await fs.stat(filePath);
            const modifiedTime = stats.mtime.getTime();

            // Extraer metadatos del HTML
            const title = $('title').text().split('|')[0].trim() || file.replace('.html', '');
            const slug = file.replace('.html', '');

            // Obtener metadatos guardados si existen
            const meta = articlesMeta[slug] || {};

            // Intentar extraer fecha y categoría del contenido
            let date = meta.date || 'Sin fecha';
            let category = meta.category || 'Sin categoría';
            let excerpt = meta.excerpt || '';
            let icon = '📄';
            let tags = meta.tags || [];

            // Buscar en diferentes posibles ubicaciones
            const headerText = $('header').first().text();
            const h1Text = $('h1').first().text();

            // Detectar categoría por el contenido y título (si no hay meta)
            if (!meta.category) {
                const titleLower = title.toLowerCase();

                // Herramientas (primero porque es específico)
                if (titleLower.includes('simulator') || titleLower.includes('simulador') ||
                    titleLower.includes('calculator') || titleLower.includes('calculador') ||
                    titleLower.includes('kdp') || titleLower.includes('tool') ||
                    titleLower.includes('herramienta') || titleLower.includes('budget')) {
                    category = 'Herramientas';
                    icon = '🛠️';
                }
                // Capacitación
                else if (titleLower.includes('guide') || titleLower.includes('guía') ||
                    titleLower.includes('playbook') || titleLower.includes('mentor') ||
                    titleLower.includes('principios') || content.includes('adb')) {
                    category = 'Capacitación';
                    icon = '🎓';
                }
                // Análisis
                else if (content.includes('CPC') || content.includes('Amazon Ads') ||
                    titleLower.includes('analysis') || titleLower.includes('análisis') ||
                    titleLower.includes('metrics') || titleLower.includes('opportunity')) {
                    category = 'Análisis';
                    icon = '📊';
                }
                // Informe Mensual
                else if (content.includes('Informe') || content.includes('Gestión') ||
                    titleLower.includes('report') || titleLower.includes('cristal') ||
                    titleLower.includes('summary')) {
                    category = 'Informe Mensual';
                    icon = '💎';
                }
                // Estrategia
                else if (content.includes('Estrategia') || content.includes('Higiene') ||
                    titleLower.includes('strategy') || titleLower.includes('market') ||
                    titleLower.includes('vajillas')) {
                    category = 'Estrategia';
                    icon = '🍽️';
                }
                // Otras (fallback)
                else {
                    category = 'Otras';
                    icon = '📁';
                }
            }

            // Extraer excerpt del primer párrafo si no hay meta
            if (!excerpt) {
                const firstP = $('p').first().text();
                excerpt = firstP.substring(0, 200) + (firstP.length > 200 ? '...' : '');
            }

            articles.push({
                id: slug,
                slug,
                title,
                date,
                category,
                icon,
                excerpt,
                tags,
                filename: file,
                content: content,
                modifiedTime // Para ordenar
            });
        }

        // Ordenar artículos: más reciente primero
        articles.sort((a, b) => b.modifiedTime - a.modifiedTime);

        res.json({ articles });
    } catch (error) {
        console.error('Error al leer artículos:', error);
        res.status(500).json({ error: 'Error al leer artículos' });
    }
});

// Regenerar índice de artículos
app.post('/api/rebuild-index', async (req, res) => {
    try {
        console.log('🔄 Regenerando índice de artículos...');

        const files = await fs.readdir(BLOG_DIR);
        const htmlFiles = files.filter(file =>
            file.startsWith('r-') &&
            file.endsWith('.html')
        );

        const articles = [];

        for (const file of htmlFiles) {
            try {
                const filePath = path.join(BLOG_DIR, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const $ = cheerio.load(content);

                const title = $('title').text() || 'Sin título';
                const id = file.replace('.html', '');
                const stats = await fs.stat(filePath);

                // Detectar categoría del título
                const titleLower = title.toLowerCase();
                let category = 'Otras';

                if (titleLower.includes('amazon') || titleLower.includes('ppc') ||
                    titleLower.includes('ad') || titleLower.includes('market')) {
                    category = 'Estrategia';
                } else if (titleLower.includes('simulator') || titleLower.includes('simulador') ||
                    titleLower.includes('calculator') || titleLower.includes('kdp') ||
                    titleLower.includes('tool') || titleLower.includes('playbook')) {
                    category = 'Herramientas';
                }

                articles.push({
                    id,
                    title,
                    category,
                    modifiedTime: stats.mtimeMs
                });
            } catch (err) {
                console.error(`Error procesando ${file}:`, err.message);
            }
        }

        // Ordenar por fecha de modificación (más reciente primero)
        articles.sort((a, b) => b.modifiedTime - a.modifiedTime);

        // Guardar el índice
        const indexPath = path.join(BLOG_DIR, 'articles.json');
        await fs.writeFile(indexPath, JSON.stringify({ articles }, null, 2));

        console.log(`✅ Índice regenerado: ${articles.length} artículos`);

        res.json({
            success: true,
            message: 'Índice regenerado exitosamente',
            totalArticles: articles.length,
            articles: articles.map(a => ({ id: a.id, title: a.title, category: a.category }))
        });
    } catch (error) {
        console.error('Error regenerando índice:', error);
        res.status(500).json({ error: 'Error al regenerar índice' });
    }
});

// Obtener un artículo específico
app.get('/api/articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const filePath = path.join(BLOG_DIR, `${slug}.html`);

        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const $ = cheerio.load(content);

        const title = $('title').text().split('|')[0].trim();

        res.json({
            slug,
            title,
            content,
            filename: `${slug}.html`
        });
    } catch (error) {
        console.error('Error al leer artículo:', error);
        res.status(500).json({ error: 'Error al leer artículo' });
    }
});

// Función para generar ID aleatorio
function generateObfuscatedId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'r-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Función para cargar/guardar mapeo de URLs
async function loadUrlMapping() {
    const mappingPath = path.join(BLOG_DIR, 'url-mapping.json');
    try {
        if (await fs.pathExists(mappingPath)) {
            const content = await fs.readFile(mappingPath, 'utf-8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Error loading URL mapping:', error);
    }
    return {};
}

async function saveUrlMapping(mapping) {
    const mappingPath = path.join(BLOG_DIR, 'url-mapping.json');
    try {
        await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving URL mapping:', error);
    }
}

// Crear nuevo artículo
app.post('/api/articles', async (req, res) => {
    try {
        const { title, content, date, category, icon, excerpt, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Título y contenido son requeridos' });
        }

        // Generar ID ofuscado
        const obfuscatedId = generateObfuscatedId();
        const filename = `${obfuscatedId}.html`;
        const filePath = path.join(BLOG_DIR, filename);

        // Verificar que el ID no exista (muy improbable, pero por seguridad)
        if (await fs.pathExists(filePath)) {
            // Generar otro ID
            return res.status(500).json({ error: 'Error generando ID único, intenta de nuevo' });
        }

        // Aplicar template OBS360 (header, footer, meta noindex)
        const wrappedContent = wrapWithOBS360Template(content);

        // Guardar archivo con template aplicado
        await fs.writeFile(filePath, wrappedContent, 'utf-8');

        // Actualizar mapeo de URLs
        const mapping = await loadUrlMapping();
        const originalSlug = title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        mapping[`${originalSlug}.html`] = filename;
        await saveUrlMapping(mapping);

        // Guardar metadatos del artículo (incluyendo tags)
        const articlesMetaPath = path.join(BLOG_DIR, 'articles-meta.json');
        let articlesMeta = {};
        try {
            if (await fs.pathExists(articlesMetaPath)) {
                articlesMeta = JSON.parse(await fs.readFile(articlesMetaPath, 'utf-8'));
            }
        } catch (e) { }

        articlesMeta[obfuscatedId] = {
            title,
            date,
            category,
            excerpt,
            tags: tags || [],
            createdAt: new Date().toISOString()
        };

        await fs.writeFile(articlesMetaPath, JSON.stringify(articlesMeta, null, 2), 'utf-8');

        // Actualizar índice del blog
        await updateBlogIndex();

        res.json({
            success: true,
            message: 'Artículo creado exitosamente',
            slug: obfuscatedId,
            filename,
            obfuscatedUrl: filename
        });
    } catch (error) {
        console.error('Error al crear artículo:', error);
        res.status(500).json({ error: 'Error al crear artículo' });
    }
});

// Actualizar artículo existente
app.put('/api/articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { content, title } = req.body;

        const filePath = path.join(BLOG_DIR, `${slug}.html`);

        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        // Guardar cambios
        await fs.writeFile(filePath, content, 'utf-8');

        // Actualizar índice
        await updateBlogIndex();

        res.json({
            success: true,
            message: 'Artículo actualizado exitosamente',
            slug
        });
    } catch (error) {
        console.error('Error al actualizar artículo:', error);
        res.status(500).json({ error: 'Error al actualizar artículo' });
    }
});

// Eliminar artículo
app.delete('/api/articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const filePath = path.join(BLOG_DIR, `${slug}.html`);

        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        // Eliminar archivo
        await fs.remove(filePath);

        // Actualizar índice
        await updateBlogIndex();

        res.json({
            success: true,
            message: 'Artículo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar artículo:', error);
        res.status(500).json({ error: 'Error al eliminar artículo' });
    }
});

// ==================== ESTANDARIZACIÓN DE ARTÍCULOS ====================

// Endpoint para re-estandarizar TODOS los artículos con el template OBS360
app.post('/api/standardize-all', async (req, res) => {
    try {
        console.log('🔄 Iniciando estandarización de todos los artículos...');

        const files = await fs.readdir(BLOG_DIR);
        const htmlFiles = files.filter(file =>
            file.endsWith('.html') &&
            file !== 'index.html' &&
            !file.includes('v1')
        );

        let updatedCount = 0;
        let errors = [];

        for (const file of htmlFiles) {
            try {
                const filePath = path.join(BLOG_DIR, file);
                const content = await fs.readFile(filePath, 'utf-8');

                // Aplicar template forzadamente
                const standardizedContent = forceOBS360Template(content);

                // Guardar archivo actualizado
                await fs.writeFile(filePath, standardizedContent, 'utf-8');
                updatedCount++;
                console.log(`✅ Estandarizado: ${file}`);
            } catch (fileError) {
                console.error(`❌ Error en ${file}:`, fileError.message);
                errors.push({ file, error: fileError.message });
            }
        }

        console.log(`🎉 Estandarización completada: ${updatedCount}/${htmlFiles.length} artículos`);

        res.json({
            success: true,
            message: `Estandarización completada`,
            totalFiles: htmlFiles.length,
            updatedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error en estandarización:', error);
        res.status(500).json({ error: 'Error al estandarizar artículos' });
    }
});

// Endpoint para re-estandarizar UN artículo específico
app.post('/api/standardize/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const filePath = path.join(BLOG_DIR, `${slug}.html`);

        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const standardizedContent = forceOBS360Template(content);
        await fs.writeFile(filePath, standardizedContent, 'utf-8');

        console.log(`✅ Artículo estandarizado: ${slug}`);

        res.json({
            success: true,
            message: `Artículo ${slug} estandarizado exitosamente`,
            slug
        });
    } catch (error) {
        console.error('Error al estandarizar artículo:', error);
        res.status(500).json({ error: 'Error al estandarizar artículo' });
    }
});

// ==================== FUNCIONES AUXILIARES ====================

async function updateBlogIndex() {
    try {
        const indexPath = path.join(BLOG_DIR, 'index.html');

        // Leer el index actual
        let indexContent = await fs.readFile(indexPath, 'utf-8');
        const $ = cheerio.load(indexContent);

        // Obtener todos los artículos
        const files = await fs.readdir(BLOG_DIR);
        const htmlFiles = files.filter(file =>
            file.endsWith('.html') &&
            file !== 'index.html' &&
            !file.includes('v1')
        );

        // Limpiar grid de artículos
        $('.articles-grid').empty();

        // Agregar cada artículo
        for (const file of htmlFiles) {
            const filePath = path.join(BLOG_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const article$ = cheerio.load(content);

            const title = article$('title').text().split('|')[0].trim();
            const slug = file.replace('.html', '');

            // Detectar categoría y color
            let category = 'Análisis';
            let categoryClass = 'cpc';
            let icon = '📊';
            let excerpt = article$('p').first().text().substring(0, 200) + '...';

            if (content.includes('Informe') || content.includes('Cristal')) {
                category = 'Informe Mensual';
                categoryClass = 'cristal';
                icon = '💎';
            } else if (content.includes('Higiene') || content.includes('Vajillas')) {
                category = 'Estrategia';
                categoryClass = 'porcelana';
                icon = '🍽️';
            }

            // Crear tarjeta de artículo
            const articleCard = `
                <a href="${slug}.html" class="article-card">
                    <div class="article-thumbnail ${categoryClass}">
                        <span class="article-category">${category}</span>
                        <span class="article-icon">${icon}</span>
                    </div>
                    <div class="article-content">
                        <span class="article-date">Diciembre 2025</span>
                        <h3 class="article-title">${title}</h3>
                        <p class="article-excerpt">${excerpt}</p>
                        <span class="article-read-more">Ver análisis completo →</span>
                    </div>
                </a>
            `;

            $('.articles-grid').append(articleCard);
        }

        // Guardar index actualizado
        await fs.writeFile(indexPath, $.html(), 'utf-8');

        console.log('✅ Índice del blog actualizado');
    } catch (error) {
        console.error('Error al actualizar índice:', error);
    }
}

// ==================== SERVIDOR ====================

app.listen(PORT, () => {
    console.log(`🚀 Servidor CMS corriendo en http://localhost:${PORT}`);
    console.log(`📁 Directorio del blog: ${BLOG_DIR}`);
    console.log(`👤 Usuario admin: ${process.env.ADMIN_USERNAME}`);
});

module.exports = app;

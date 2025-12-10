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

// Autenticación simple
const authenticate = (req, res, next) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
};

// ==================== RUTAS ====================

// Login
app.post('/api/login', authenticate, (req, res) => {
    res.json({ success: true, message: 'Login exitoso' });
});

// Obtener todos los artículos
app.get('/api/articles', async (req, res) => {
    try {
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

            // Extraer metadatos del HTML
            const title = $('title').text().split('|')[0].trim() || file.replace('.html', '');
            const slug = file.replace('.html', '');

            // Intentar extraer fecha y categoría del contenido
            let date = 'Sin fecha';
            let category = 'Sin categoría';
            let excerpt = '';
            let icon = '📄';

            // Buscar en diferentes posibles ubicaciones
            const headerText = $('header').first().text();
            const h1Text = $('h1').first().text();

            // Detectar categoría por el contenido
            if (content.includes('CPC') || content.includes('Amazon Ads')) {
                category = 'Análisis';
                icon = '📊';
            } else if (content.includes('Informe') || content.includes('Gestión')) {
                category = 'Informe Mensual';
                icon = '💎';
            } else if (content.includes('Estrategia') || content.includes('Higiene')) {
                category = 'Estrategia';
                icon = '🍽️';
            }

            // Extraer excerpt del primer párrafo
            const firstP = $('p').first().text();
            excerpt = firstP.substring(0, 200) + (firstP.length > 200 ? '...' : '');

            articles.push({
                id: slug,
                slug,
                title,
                date,
                category,
                icon,
                excerpt,
                filename: file,
                content: content
            });
        }

        res.json({ articles });
    } catch (error) {
        console.error('Error al leer artículos:', error);
        res.status(500).json({ error: 'Error al leer artículos' });
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
        const { title, content, date, category, icon, excerpt } = req.body;

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

        // Guardar archivo
        await fs.writeFile(filePath, content, 'utf-8');

        // Actualizar mapeo de URLs
        const mapping = await loadUrlMapping();
        const originalSlug = title.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        mapping[`${originalSlug}.html`] = filename;
        await saveUrlMapping(mapping);

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

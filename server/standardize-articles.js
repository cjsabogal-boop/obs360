/**
 * Script para estandarizar todos los artículos del blog
 * Ejecutar: node standardize-articles.js
 */

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const BLOG_DIR = path.join(__dirname, '../blog');

// CSS para header, footer y CONTENIDO CENTRADO - MEJORADO
const OBS360_CSS = `
    /* Reset body para centrado */
    body {
        margin: 0;
        padding: 0;
        background: #f9fafb;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* OBS360 Header - Estándar */
    .obs-header {
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 15px 0;
        position: sticky;
        top: 0;
        z-index: 1000;
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
    
    /* Contenedor de contenido centrado */
    .obs-article-content {
        max-width: 900px;
        margin: 40px auto;
        padding: 40px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .obs-article-content * {
        max-width: 100%;
    }
    
    .obs-article-content img {
        display: block;
        margin: 20px auto;
        border-radius: 8px;
    }
    
    .obs-article-content h1,
    .obs-article-content h2,
    .obs-article-content h3,
    .obs-article-content h4,
    .obs-article-content h5,
    .obs-article-content h6 {
        color: #1f2937;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        line-height: 1.3;
    }
    
    .obs-article-content p {
        line-height: 1.8;
        color: #374151;
        margin-bottom: 1.2em;
    }
    
    .obs-article-content ul,
    .obs-article-content ol {
        padding-left: 2em;
        margin-bottom: 1.2em;
    }
    
    .obs-article-content li {
        margin-bottom: 0.5em;
        line-height: 1.6;
    }
    
    /* OBS360 Footer - Estándar */
    .obs-footer {
        background: linear-gradient(135deg, #1f2937 0%, #28529a 100%);
        padding: 40px 0;
        text-align: center;
        margin-top: 60px;
    }
    .obs-footer img { height: 50px; margin-bottom: 15px; filter: brightness(0) invert(1); }
    .obs-footer p { color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 10px; }
    .obs-footer-btn {
        display: inline-block;
        background: #84cc16;
        color: white;
        padding: 12px 30px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 15px;
        transition: all 0.3s ease;
    }
    .obs-footer-btn:hover { background: #65a30d; transform: translateY(-2px); }
`;

// Header con logo y badge
const OBS360_HEADER = `
    <!-- OBS360 Header -->
    <header class="obs-header">
        <div class="obs-header-content">
            <div class="obs-logo">
                <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
            </div>
            <span class="obs-header-badge">RECURSO PRIVADO</span>
        </div>
    </header>
`;

// Footer estándar
const OBS360_FOOTER = `
    <!-- OBS360 Footer -->
    <footer class="obs-footer">
        <div class="max-w-7xl mx-auto px-4">
            <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
            <p>Recurso exclusivo para clientes de OBS360</p>
            <p style="font-size: 12px; opacity: 0.6;">© 2025 OBS360 - Todos los derechos reservados</p>
            <a href="https://wa.me/19803370518" target="_blank" class="obs-footer-btn">Contactar a OBS360</a>
        </div>
    </footer>
`;

// Función para aplicar template OBS360
function forceOBS360Template(htmlContent) {
    const $ = cheerio.load(htmlContent);

    // 1. SIEMPRE asegurar meta noindex, nofollow
    $('meta[name="robots"]').remove();
    $('head').append('<meta name="robots" content="noindex, nofollow" />');

    // 2. SIEMPRE asegurar favicon
    $('link[rel="icon"]').remove();
    $('head').append('<link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />');

    // 3. EXTRAER CONTENIDO ORIGINAL ANTES de remover nada
    let originalContent = '';

    // Si ya existe .obs-article-content, usar su contenido
    if ($('.obs-article-content').length > 0) {
        originalContent = $('.obs-article-content').html() || '';
    } else {
        // Si no existe, obtener todo el body y limpiar elementos OBS360
        const bodyClone = $('body').clone();
        bodyClone.find('.obs-header, header.obs-header').remove();
        bodyClone.find('.obs-footer, footer.obs-footer').remove();
        bodyClone.find('.obs-article-content').remove();
        originalContent = bodyClone.html() || '';
    }

    // Verificar que tengamos contenido
    if (!originalContent || originalContent.trim().length === 0) {
        console.error('❌ ERROR: No se pudo extraer contenido del artículo');
        return htmlContent; // Retornar sin cambios si no hay contenido
    }

    // 4. Agregar CSS
    const existingStyles = $('style').text();
    if (!existingStyles.includes('.obs-article-content')) {
        if ($('style').length) {
            let styleContent = $('style').first().html() || '';
            // Remover CSS OBS360 antiguo
            styleContent = styleContent.replace(/\/\* OBS360 Header[\s\S]*?\.obs-footer-btn:hover[^}]*\}/g, '');
            $('style').first().html(styleContent + OBS360_CSS);
        } else {
            $('head').append('<style>' + OBS360_CSS + '</style>');
        }
    }

    // 5. Limpiar estilos inline que puedan afectar el centrado
    originalContent = originalContent.replace(/style\s*=\s*["'][^"']*text-align\s*:\s*left[^"']*["']/gi, '');

    // 6. RECONSTRUIR BODY con estructura correcta
    $('body').empty();

    // Agregar header
    $('body').append(OBS360_HEADER);

    // Envolver contenido original en contenedor centrado
    $('body').append(`<div class="obs-article-content">${originalContent}</div>`);

    // Agregar footer
    $('body').append(OBS360_FOOTER);

    return $.html();
}

async function standardizeAllArticles() {
    console.log('🔄 Iniciando estandarización de artículos...\n');

    const files = await fs.readdir(BLOG_DIR);
    const htmlFiles = files.filter(file =>
        file.endsWith('.html') &&
        file !== 'index.html' &&
        !file.includes('v1')
    );

    console.log(`📁 Encontrados ${htmlFiles.length} artículos para procesar\n`);

    let updatedCount = 0;
    let errors = [];

    for (const file of htmlFiles) {
        try {
            const filePath = path.join(BLOG_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');

            // Aplicar template
            const standardizedContent = forceOBS360Template(content);

            // Guardar archivo actualizado
            await fs.writeFile(filePath, standardizedContent, 'utf-8');
            updatedCount++;
            console.log(`✅ ${file}`);
        } catch (error) {
            console.error(`❌ Error en ${file}: ${error.message}`);
            errors.push({ file, error: error.message });
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 Estandarización completada!`);
    console.log(`   ✅ Actualizados: ${updatedCount}/${htmlFiles.length}`);
    if (errors.length > 0) {
        console.log(`   ❌ Errores: ${errors.length}`);
        errors.forEach(e => console.log(`      - ${e.file}: ${e.error}`));
    }
    console.log(`${'='.repeat(50)}\n`);
}

// Ejecutar
standardizeAllArticles().catch(console.error);

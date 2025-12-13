/**
 * Script para estandarizar todos los artículos del blog
 * Ejecutar: node standardize-articles.js
 */

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const BLOG_DIR = path.join(__dirname, '../blog');

// CSS para header y footer - MEJORADO
const OBS360_CSS = `
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

    // 3. Remover header/footer existentes para evitar duplicados
    $('.obs-header').remove();
    $('.obs-footer').remove();

    // 4. Agregar CSS
    const existingStyles = $('style').text();
    if (!existingStyles.includes('.obs-header-badge')) {
        if ($('style').length) {
            let styleContent = $('style').first().html() || '';
            // Remover CSS OBS360 antiguo
            styleContent = styleContent.replace(/\/\* OBS360 Header[\s\S]*?\.obs-footer-btn:hover[^}]*\}/g, '');
            $('style').first().html(styleContent + OBS360_CSS);
        } else {
            $('head').append('<style>' + OBS360_CSS + '</style>');
        }
    }

    // 5. SIEMPRE agregar header al inicio del body
    $('body').prepend(OBS360_HEADER);

    // 6. SIEMPRE agregar footer al final del body
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

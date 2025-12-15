#!/usr/bin/env node
/**
 * Script para aplicar el template OBS360 a todos los artículos localmente
 * Ejecutar: node scripts/fix-articles-local.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BLOG_DIR = path.join(__dirname, '../blog');

// CSS de OBS360
const OBS360_CSS = `
/* ========== OBS360 Branding Estándar ========== */
body {
    margin: 0;
    padding: 0;
    background: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: block !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    min-height: auto !important;
    height: auto !important;
}

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

function forceOBS360Template(htmlContent) {
    const $ = cheerio.load(htmlContent, { decodeEntities: false });

    // 1. Asegurar meta noindex, nofollow
    $('meta[name="robots"]').remove();
    $('head').append('<meta name="robots" content="noindex, nofollow" />');

    // 2. Asegurar favicon
    $('link[rel="icon"]').remove();
    $('head').append('<link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />');

    // 3. Extraer contenido original
    let originalContent = '';

    if ($('.obs-article-content').length > 0) {
        originalContent = $('.obs-article-content').html() || '';
    } else {
        const bodyClone = $('body').clone();
        bodyClone.find('.obs-header, header.obs-header').remove();
        bodyClone.find('.obs-footer, footer.obs-footer').remove();
        bodyClone.find('.obs-article-content').remove();
        originalContent = bodyClone.html() || '';
    }

    if (!originalContent || originalContent.trim().length === 0) {
        console.error('❌ ERROR: No se pudo extraer contenido');
        return htmlContent;
    }

    // 4. Limpiar CSS duplicado de OBS360
    $('style').each(function () {
        let css = $(this).html() || '';
        css = css.replace(/\/\*\s*=+\s*OBS360[\s\S]*?=+\s*\*\//g, '');
        css = css.replace(/\/\*\s*=+\s*Fin OBS360[\s\S]*?=+\s*\*\//g, '');
        css = css.replace(/\.obs-[a-z-]+\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\.obs-[a-z-]+:hover\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\n\s*\n\s*\n+/g, '\n\n');
        $(this).html(css.trim());
    });

    // 5. Agregar CSS de OBS360
    if ($('style').length > 0) {
        $('style').first().append('\n' + OBS360_CSS);
    } else {
        $('head').append('<style>' + OBS360_CSS + '</style>');
    }

    // 6. Limpiar body
    const $body = $('body');
    const bodyClasses = $body.attr('class') || '';
    const cleanedClasses = bodyClasses
        .split(' ')
        .filter(cls => !['flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'h-screen'].includes(cls))
        .join(' ');
    $body.attr('class', cleanedClasses);
    $body.removeAttr('style');

    // 7. Reconstruir body
    $body.empty();
    $body.append(OBS360_HEADER);
    $body.append(`<div class="obs-article-content">${originalContent}</div>`);
    $body.append(OBS360_FOOTER);

    return $.html();
}

// Ejecutar
console.log('🔧 OBS360 - Fix Articles Local\n');
console.log(`📁 Directorio: ${BLOG_DIR}\n`);

const files = fs.readdirSync(BLOG_DIR).filter(f => f.startsWith('r-') && f.endsWith('.html'));

let fixed = 0;
let skipped = 0;

files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasHeader = content.includes('obs-header');
    const hasFooter = content.includes('obs-footer');

    if (hasHeader && hasFooter) {
        console.log(`⏭️  ${file} - Ya tiene template`);
        skipped++;
        return;
    }

    const newContent = forceOBS360Template(content);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✅ ${file} - CORREGIDO`);
    fixed++;
});

console.log('\n📊 Resumen:');
console.log(`   ✅ Corregidos: ${fixed}`);
console.log(`   ⏭️  Saltados: ${skipped}`);
console.log(`   📄 Total: ${files.length}`);

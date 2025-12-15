#!/usr/bin/env node
/**
 * Script para LIMPIAR el wrapper .obs-article-content problemático
 * Mantiene solo header y footer, extrae el contenido del wrapper
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BLOG_DIR = path.join(__dirname, '../blog');

const OBS360_HEADER = `
<!-- OBS360 Header Estándar -->
<header class="obs-header" style="background: white !important; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 15px 0; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between;">
        <div>
            <a href="../index.html">
                <img src="../Logo-Obs360.co_.webp" alt="OBS360" style="height: 40px; width: auto;" />
            </a>
        </div>
        <span style="background: linear-gradient(135deg, #28529a, #84cc16); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">RECURSO PRIVADO</span>
    </div>
</header>
<div style="height: 70px;"></div>
`;

const OBS360_FOOTER = `
<!-- OBS360 Footer Estándar -->
<footer class="obs-footer" style="background: linear-gradient(135deg, #1f2937 0%, #28529a 100%) !important; padding: 40px 0; text-align: center; margin-top: 40px;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
        <img src="../Logo-Obs360.co_.webp" alt="OBS360" style="height: 50px; margin-bottom: 15px; filter: brightness(0) invert(1);" />
        <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 10px;">Recurso exclusivo para clientes de OBS360</p>
        <p style="color: rgba(255,255,255,0.5); font-size: 12px;">© 2025 OBS360 - Todos los derechos reservados</p>
        <a href="https://wa.me/19803370518" target="_blank" style="display: inline-block; background: #84cc16; color: white !important; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; margin-top: 15px;">Contactar a OBS360</a>
    </div>
</footer>
`;

function cleanAndFixArticle(htmlContent, filename) {
    const $ = cheerio.load(htmlContent, { decodeEntities: false });
    let changed = false;

    // 1. Limpiar CSS problemático de OBS360 del head
    $('style').each(function () {
        let css = $(this).html() || '';
        const originalCss = css;

        // Eliminar todo el bloque CSS de OBS360
        css = css.replace(/\/\*\s*=+\s*OBS360[\s\S]*?=+\s*Fin OBS360[\s\S]*?=+\s*\*\//g, '');
        css = css.replace(/\/\*\s*=+\s*OBS360[\s\S]*?\*\//g, '');
        css = css.replace(/\/\*\s*=+\s*Fin OBS360[\s\S]*?\*\//g, '');

        // Eliminar reglas CSS de .obs-*
        css = css.replace(/\.obs-[a-z-]+[\s\S]*?\{[\s\S]*?\}/g, '');

        // Limpiar líneas vacías múltiples
        css = css.replace(/\n\s*\n\s*\n+/g, '\n\n');

        if (css !== originalCss) {
            $(this).html(css.trim());
            changed = true;
        }
    });

    // 2. Si tiene .obs-article-content, extraer su contenido
    const wrapper = $('.obs-article-content');
    if (wrapper.length > 0) {
        console.log(`  📦 Extrayendo contenido de wrapper...`);
        const innerContent = wrapper.html();
        wrapper.replaceWith(innerContent);
        changed = true;
    }

    // 3. Eliminar headers y footers existentes de OBS360
    $('header.obs-header, .obs-header').remove();
    $('footer.obs-footer, .obs-footer').remove();
    $('div[style*="height: 70px"]').remove(); // Spacer

    // 4. Limpiar comentarios de OBS360
    const bodyHtml = $('body').html() || '';
    const cleanedBody = bodyHtml
        .replace(/<!-- OBS360 Header[\s\S]*?-->/g, '')
        .replace(/<!-- OBS360 Footer[\s\S]*?-->/g, '');
    $('body').html(cleanedBody);

    // 5. Agregar nuevo header al inicio del body
    $('body').prepend(OBS360_HEADER);

    // 6. Agregar footer al final del body
    $('body').append(OBS360_FOOTER);

    // 7. Asegurar meta tags
    if ($('meta[name="robots"]').length === 0) {
        $('head').append('<meta name="robots" content="noindex, nofollow" />');
    }
    if ($('link[rel="icon"]').length === 0) {
        $('head').append('<link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />');
    }

    return { html: $.html(), changed: true };
}

// Ejecutar
console.log('🧹 OBS360 - Clean & Fix All Articles\n');
console.log(`📁 Directorio: ${BLOG_DIR}\n`);

const files = fs.readdirSync(BLOG_DIR).filter(f => f.startsWith('r-') && f.endsWith('.html'));

let fixed = 0;

files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    console.log(`📄 ${file}`);
    const result = cleanAndFixArticle(content, file);

    fs.writeFileSync(filePath, result.html, 'utf-8');
    fixed++;
    console.log(`   ✅ Limpiado y corregido\n`);
});

console.log('📊 Resumen:');
console.log(`   ✅ Artículos procesados: ${fixed}`);

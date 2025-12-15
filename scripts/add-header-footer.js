#!/usr/bin/env node
/**
 * Script MEJORADO para aplicar header/footer OBS360 
 * SIN romper layouts especiales (Canvas, React, full-screen)
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

function addHeaderFooterOnly(htmlContent, filename) {
    const $ = cheerio.load(htmlContent, { decodeEntities: false });

    // 1. Asegurar meta noindex
    if ($('meta[name="robots"]').length === 0) {
        $('head').append('<meta name="robots" content="noindex, nofollow" />');
    }

    // 2. Asegurar favicon
    if ($('link[rel="icon"]').length === 0) {
        $('head').append('<link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />');
    }

    // 3. Verificar si ya tiene header/footer
    const hasHeader = $('header.obs-header').length > 0 || $('.obs-header').length > 0;
    const hasFooter = $('footer.obs-footer').length > 0 || $('.obs-footer').length > 0;

    if (hasHeader && hasFooter) {
        console.log(`⏭️  ${filename} - Ya tiene header/footer`);
        return { html: htmlContent, changed: false };
    }

    // 4. Agregar header al inicio del body (si no existe)
    if (!hasHeader) {
        $('body').prepend(OBS360_HEADER);
    }

    // 5. Agregar footer al final del body (si no existe)
    if (!hasFooter) {
        $('body').append(OBS360_FOOTER);
    }

    console.log(`✅ ${filename} - Header/footer agregados`);
    return { html: $.html(), changed: true };
}

// Ejecutar
console.log('🔧 OBS360 - Add Header/Footer Only (Sin wrapper)\n');
console.log(`📁 Directorio: ${BLOG_DIR}\n`);

const files = fs.readdirSync(BLOG_DIR).filter(f => f.startsWith('r-') && f.endsWith('.html'));

let fixed = 0;
let skipped = 0;

files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const result = addHeaderFooterOnly(content, file);

    if (result.changed) {
        fs.writeFileSync(filePath, result.html, 'utf-8');
        fixed++;
    } else {
        skipped++;
    }
});

console.log('\n📊 Resumen:');
console.log(`   ✅ Actualizados: ${fixed}`);
console.log(`   ⏭️  Saltados: ${skipped}`);
console.log(`   📄 Total: ${files.length}`);

/**
 * Script MEJORADO para estandarizar todos los artículos del blog
 * Limpia duplicados y aplica template correcto
 * Ejecutar: node standardize-articles-v2.js
 */

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const BLOG_DIR = path.join(__dirname, '../blog');

// CSS ESTÁNDAR para OBS360 (solo una vez)
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

// Header HTML limpio
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

// Footer HTML limpio
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

// Función para limpiar y aplicar template OBS360
function cleanAndApplyOBS360Template(htmlContent, filename) {
    const $ = cheerio.load(htmlContent, { decodeEntities: false });

    console.log(`   Procesando: ${filename}`);

    // ===== LIMPIEZA TOTAL =====

    // 1. Eliminar TODOS los headers OBS360 existentes
    $('.obs-header').remove();
    $('header.obs-header').remove();

    // 2. Eliminar TODOS los footers OBS360 existentes  
    $('.obs-footer').remove();
    $('footer.obs-footer').remove();

    // 3. Eliminar comentarios HTML de OBS360
    $('*').contents().filter(function () {
        return this.type === 'comment' &&
            (this.data.includes('OBS360') || this.data.includes('obs360'));
    }).remove();

    // 4. Limpiar TODO el CSS relacionado con OBS360
    $('style').each(function () {
        let css = $(this).html() || '';

        // Eliminar comentarios de OBS360
        css = css.replace(/\/\*\s*=+\s*OBS360[\s\S]*?=+\s*\*\//g, '');
        css = css.replace(/\/\*\s*=+\s*Fin OBS360[\s\S]*?=+\s*\*\//g, '');
        css = css.replace(/\/\*\s*OBS360[\s\S]*?\*\//g, '');

        // Eliminar clases de OBS360 (con regex más amplio)
        css = css.replace(/\.obs-[a-z-]+\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\.obs-[a-z-]+:hover\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\.obs-[a-z-]+\s+img\s*\{[\s\S]*?\}/g, '');
        css = css.replace(/\.obs-[a-z-]+\s+p\s*\{[\s\S]*?\}/g, '');

        // Limpiar líneas vacías múltiples y espacios
        css = css.replace(/\n\s*\n\s*\n+/g, '\n\n');
        css = css.trim();

        $(this).html(css);
    });

    // ===== APLICAR TEMPLATE LIMPIO =====

    // 5. Asegurar meta noindex
    $('meta[name="robots"]').remove();
    $('head').append('<meta name="robots" content="noindex, nofollow" />');

    // 6. Asegurar favicon
    $('link[rel="icon"]').remove();
    $('head').append('<link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />');

    // 7. Agregar CSS de OBS360 al final del primer <style> o crear uno nuevo
    if ($('style').length > 0) {
        $('style').first().append('\n' + OBS360_CSS);
    } else {
        $('head').append('<style>' + OBS360_CSS + '</style>');
    }

    // 8. Agregar header al INICIO del body
    $('body').prepend(OBS360_HEADER);

    // 9. Agregar footer al FINAL del body
    $('body').append(OBS360_FOOTER);

    return $.html();
}

async function standardizeAllArticles() {
    console.log('\n🔄 ESTANDARIZACIÓN V2 - Limpieza profunda de artículos\n');
    console.log('='.repeat(60) + '\n');

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

            // Aplicar limpieza y template
            const cleanContent = cleanAndApplyOBS360Template(content, file);

            // Guardar archivo actualizado
            await fs.writeFile(filePath, cleanContent, 'utf-8');
            updatedCount++;
            console.log(`   ✅ Completado: ${file}`);
        } catch (error) {
            console.error(`   ❌ Error en ${file}: ${error.message}`);
            errors.push({ file, error: error.message });
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n🎉 ESTANDARIZACIÓN V2 COMPLETADA`);
    console.log(`   ✅ Actualizados: ${updatedCount}/${htmlFiles.length}`);
    if (errors.length > 0) {
        console.log(`   ❌ Errores: ${errors.length}`);
        errors.forEach(e => console.log(`      - ${e.file}: ${e.error}`));
    }
    console.log(`\n${'='.repeat(60)}\n`);

    // Verificación final
    console.log('🔍 Verificando resultado...\n');
    for (const file of htmlFiles.slice(0, 3)) { // Verificar primeros 3
        const filePath = path.join(BLOG_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const headerCount = (content.match(/class="obs-header"/g) || []).length;
        const footerCount = (content.match(/class="obs-footer"/g) || []).length;
        console.log(`   ${file}: Header=${headerCount}, Footer=${footerCount} ${headerCount === 1 && footerCount === 1 ? '✅' : '⚠️'}`);
    }
    console.log('');
}

// Ejecutar
standardizeAllArticles().catch(console.error);

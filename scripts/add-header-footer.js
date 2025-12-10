/**
 * Script para agregar header y footer estándar de OBS360 a todos los artículos del blog
 * También asegura que todos tengan meta noindex, nofollow para privacidad
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../blog');

// Template del header estándar
const HEADER_STYLES = `
    /* OBS360 Header Styles */
    .obs-header {
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 15px 0;
        position: sticky;
        top: 0;
        z-index: 1100;
    }

    .obs-header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .obs-logo img {
        height: 45px;
        width: auto;
    }

    .obs-back-link {
        color: #28529a;
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 25px;
        background: #f3f6fa;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    .obs-back-link:hover {
        background: #28529a;
        color: white;
    }

    /* OBS360 Footer */
    .obs-footer {
        background: linear-gradient(135deg, #1f2937 0%, #28529a 100%);
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
    }

    .obs-footer-btn {
        display: inline-block;
        background: #84cc16;
        color: white;
        padding: 12px 30px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 20px;
        transition: all 0.3s ease;
    }

    .obs-footer-btn:hover {
        background: #65a30d;
        transform: translateY(-2px);
    }
`;

const HEADER_HTML = `
    <!-- OBS360 Header -->
    <header class="obs-header">
        <div class="obs-header-content">
            <a href="index.html" class="obs-logo">
                <img src="../Logo-Obs360.co_.webp" alt="OBS360 Logo" />
            </a>
            <a href="index.html" class="obs-back-link">
                ← Volver a Recursos
            </a>
        </div>
    </header>
`;

const FOOTER_HTML = `
    <!-- OBS360 Footer -->
    <footer class="obs-footer">
        <div class="max-w-7xl mx-auto px-4">
            <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
            <p>Recurso exclusivo para clientes de OBS360</p>
            <a href="https://wa.me/19803370518" target="_blank" class="obs-footer-btn">Contactar a OBS360</a>
        </div>
    </footer>
`;

const META_TAGS = `    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />`;

function processFile(filePath) {
    const filename = path.basename(filePath);

    // Skip index.html
    if (filename === 'index.html') {
        console.log(`⏭️  Saltando ${filename} (índice del blog)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. Verificar y agregar meta noindex, nofollow
    if (!content.includes('noindex, nofollow')) {
        // Insertar después del viewport meta tag
        const viewportMatch = content.match(/<meta\s+name="viewport"[^>]*>/i);
        if (viewportMatch) {
            content = content.replace(
                viewportMatch[0],
                viewportMatch[0] + '\n' + META_TAGS
            );
            modified = true;
            console.log(`  ✅ Agregado meta noindex, nofollow`);
        } else {
            // Insertar después de charset
            const charsetMatch = content.match(/<meta\s+charset="[^"]*"[^>]*>/i);
            if (charsetMatch) {
                content = content.replace(
                    charsetMatch[0],
                    charsetMatch[0] + '\n' + META_TAGS
                );
                modified = true;
                console.log(`  ✅ Agregado meta noindex, nofollow`);
            }
        }
    } else {
        console.log(`  ℹ️  Ya tiene meta noindex, nofollow`);
    }

    // 2. Verificar y agregar header
    if (!content.includes('obs-header')) {
        // Agregar estilos antes de </style>
        const styleCloseMatch = content.match(/<\/style>/i);
        if (styleCloseMatch) {
            content = content.replace(
                '</style>',
                HEADER_STYLES + '\n    </style>'
            );
        }

        // Agregar header HTML después de <body...>
        const bodyMatch = content.match(/<body[^>]*>/i);
        if (bodyMatch) {
            content = content.replace(
                bodyMatch[0],
                bodyMatch[0] + HEADER_HTML
            );
            modified = true;
            console.log(`  ✅ Agregado header OBS360`);
        }
    } else {
        console.log(`  ℹ️  Ya tiene header OBS360`);
    }

    // 3. Verificar y agregar footer
    if (!content.includes('obs-footer')) {
        // Agregar footer antes de </body>
        content = content.replace(
            '</body>',
            FOOTER_HTML + '\n</body>'
        );
        modified = true;
        console.log(`  ✅ Agregado footer OBS360`);
    } else {
        console.log(`  ℹ️  Ya tiene footer OBS360`);
    }

    // Guardar cambios
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  💾 Guardado: ${filename}`);
    } else {
        console.log(`  ⏭️  Sin cambios necesarios`);
    }

    return modified;
}

// Procesar todos los archivos HTML en el directorio blog
console.log('🚀 Procesando artículos del blog...\n');

const files = fs.readdirSync(BLOG_DIR).filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    f.startsWith('r-')
);

let modifiedCount = 0;

files.forEach(file => {
    console.log(`📄 ${file}:`);
    const filePath = path.join(BLOG_DIR, file);
    if (processFile(filePath)) {
        modifiedCount++;
    }
    console.log('');
});

console.log(`\n✅ Proceso completado. ${modifiedCount} archivos modificados de ${files.length} totales.`);

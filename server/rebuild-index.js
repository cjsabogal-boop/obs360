/**
 * Script para REGENERAR el índice de artículos desde cero
 * Escanea todos los archivos HTML en blog/ y crea un articles.json limpio
 */

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const BLOG_DIR = path.join(__dirname, '../blog');

async function rebuildIndex() {
    console.log('\n🔄 REGENERANDO ÍNDICE DE ARTÍCULOS\n');
    console.log('='.repeat(60));

    try {
        // 1. Escanear todos los archivos HTML
        const files = await fs.readdir(BLOG_DIR);
        const htmlFiles = files.filter(file =>
            file.startsWith('r-') &&
            file.endsWith('.html')
        );

        console.log(`\n📁 Encontrados ${htmlFiles.length} archivos HTML\n`);

        const articles = [];

        // 2. Procesar cada archivo
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

                console.log(`   ✅ ${id} - ${title.substring(0, 50)}...`);
            } catch (err) {
                console.error(`   ❌ Error procesando ${file}:`, err.message);
            }
        }

        // 3. Ordenar por fecha de modificación (más reciente primero)
        articles.sort((a, b) => b.modifiedTime - a.modifiedTime);

        // 4. Guardar el índice
        const indexPath = path.join(BLOG_DIR, 'articles.json');
        await fs.writeFile(indexPath, JSON.stringify({ articles }, null, 2));

        console.log('\n' + '='.repeat(60));
        console.log(`\n✅ ÍNDICE REGENERADO EXITOSAMENTE`);
        console.log(`   📊 Total artículos: ${articles.length}`);
        console.log(`   📁 Guardado en: ${indexPath}\n`);

        // 5. Mostrar resumen por categoría
        const byCat = articles.reduce((acc, a) => {
            acc[a.category] = (acc[a.category] || 0) + 1;
            return acc;
        }, {});

        console.log('📈 Resumen por categoría:');
        Object.entries(byCat).forEach(([cat, count]) => {
            console.log(`   • ${cat}: ${count}`);
        });
        console.log('');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

rebuildIndex();

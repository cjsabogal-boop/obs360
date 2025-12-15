<?php
/**
 * OBS360 - Script para re-estandarizar TODOS los artículos
 * Acceder desde: https://obs360.co/fix-all-articles.php
 * 
 * Este script aplica el header y footer de OBS360 a todos los artículos
 */

set_time_limit(300);
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración
$blogDir = __DIR__ . '/blog';

// Templates OBS360
$OBS360_CSS = '
/* ========== OBS360 Branding Estándar ========== */
/* Reset body para centrado */
body {
    margin: 0;
    padding: 0;
    background: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;
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
';

$OBS360_HEADER = '
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
';

$OBS360_FOOTER = '
<!-- OBS360 Footer Estándar -->
<footer class="obs-footer">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
        <img src="../Logo-Obs360.co_.webp" alt="OBS360" />
        <p>Recurso exclusivo para clientes de OBS360</p>
        <p style="font-size: 12px; opacity: 0.6;">© 2025 OBS360 - Todos los derechos reservados</p>
        <a href="https://wa.me/19803370518" target="_blank" class="obs-footer-btn">Contactar a OBS360</a>
    </div>
</footer>
';

// Estilos HTML
echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>OBS360 - Fix All Articles</title>";
echo "<style>body{font-family:system-ui;max-width:900px;margin:40px auto;padding:20px;background:#1a1a2e;color:#eee}";
echo "h1{color:#84cc16}h2{color:#28529a;border-bottom:2px solid #28529a;padding-bottom:10px}";
echo ".success{color:#22c55e;font-weight:bold}.error{color:#ef4444;font-weight:bold}.warning{color:#f59e0b}";
echo ".article{background:#2d2d44;padding:15px;border-radius:8px;margin:10px 0}";
echo "button{background:#84cc16;color:white;padding:15px 30px;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600}";
echo "button:hover{background:#65a30d}</style></head><body>";

echo "<h1>🔧 OBS360 - Fix All Articles</h1>";

// Verificar si se ejecutó el fix
if (isset($_GET['run']) && $_GET['run'] === 'true') {
    echo "<h2>📋 Procesando Artículos...</h2>";

    $files = glob($blogDir . '/r-*.html');
    $fixed = 0;
    $skipped = 0;
    $errors = 0;

    foreach ($files as $file) {
        $filename = basename($file);
        echo "<div class='article'>";
        echo "<strong>$filename</strong><br>";

        $content = file_get_contents($file);
        $originalSize = strlen($content);

        // Verificar si ya tiene el template OBS360
        $hasHeader = strpos($content, 'obs-header') !== false;
        $hasFooter = strpos($content, 'obs-footer') !== false;
        $hasWrapper = strpos($content, 'obs-article-content') !== false;

        if ($hasHeader && $hasFooter && $hasWrapper) {
            echo "<span class='warning'>⏭️ Ya tiene template OBS360, saltando...</span>";
            $skipped++;
            echo "</div>";
            continue;
        }

        // Extraer contenido del body
        $bodyContent = '';
        if (preg_match('/<body[^>]*>(.*?)<\/body>/is', $content, $matches)) {
            $bodyContent = $matches[1];
        } else {
            echo "<span class='error'>❌ No se pudo encontrar el body</span>";
            $errors++;
            echo "</div>";
            continue;
        }

        // Si ya tiene obs-article-content, extraer ese contenido
        if ($hasWrapper && preg_match('/<div class="obs-article-content">(.*?)<\/div>/is', $bodyContent, $wrapperMatch)) {
            $bodyContent = $wrapperMatch[1];
        }

        // Limpiar estructuras anteriores de OBS360 que estén rotas
        $bodyContent = preg_replace('/<header class="obs-header">.*?<\/header>/is', '', $bodyContent);
        $bodyContent = preg_replace('/<footer class="obs-footer">.*?<\/footer>/is', '', $bodyContent);
        $bodyContent = preg_replace('/<!-- OBS360 Header.*?-->/is', '', $bodyContent);
        $bodyContent = preg_replace('/<!-- OBS360 Footer.*?-->/is', '', $bodyContent);

        // Limpiar el contenido
        $bodyContent = trim($bodyContent);

        if (empty($bodyContent) || strlen($bodyContent) < 100) {
            echo "<span class='error'>❌ Contenido vacío o muy corto (" . strlen($bodyContent) . " chars)</span>";
            $errors++;
            echo "</div>";
            continue;
        }

        // Extraer head
        $headContent = '';
        if (preg_match('/<head[^>]*>(.*?)<\/head>/is', $content, $headMatch)) {
            $headContent = $headMatch[1];

            // Limpiar CSS duplicado de OBS360
            $headContent = preg_replace('/\/\*\s*=+\s*OBS360[\s\S]*?=+\s*\*\//s', '', $headContent);
            $headContent = preg_replace('/\/\*\s*=+\s*Fin OBS360[\s\S]*?=+\s*\*\//s', '', $headContent);

            // Añadir CSS de OBS360 al final del style
            if (preg_match('/<style>(.*?)<\/style>/is', $headContent, $styleMatch)) {
                $oldStyle = $styleMatch[1];
                $newStyle = $oldStyle . "\n" . $OBS360_CSS;
                $headContent = preg_replace('/<style>(.*?)<\/style>/is', '<style>' . $newStyle . '</style>', $headContent, 1);
            } else {
                $headContent .= "\n<style>" . $OBS360_CSS . "</style>\n";
            }

            // Asegurar meta robots y favicon
            if (strpos($headContent, 'noindex') === false) {
                $headContent .= '<meta name="robots" content="noindex, nofollow" />';
            }
            if (strpos($headContent, 'rel="icon"') === false) {
                $headContent .= '<link rel="icon" type="image/webp" href="../Logo-Obs360.co_.webp" />';
            }
        }

        // Reconstruir el HTML
        $newHtml = "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n$headContent\n</head>\n<body>\n";
        $newHtml .= $OBS360_HEADER;
        $newHtml .= "<div class=\"obs-article-content\">\n$bodyContent\n</div>\n";
        $newHtml .= $OBS360_FOOTER;
        $newHtml .= "\n</body>\n</html>";

        // Guardar
        if (file_put_contents($file, $newHtml)) {
            $newSize = strlen($newHtml);
            echo "<span class='success'>✅ Estandarizado ($originalSize → $newSize bytes)</span>";
            $fixed++;
        } else {
            echo "<span class='error'>❌ Error al guardar</span>";
            $errors++;
        }

        echo "</div>";
    }

    echo "<h2>📊 Resumen</h2>";
    echo "<p class='success'>✅ Artículos estandarizados: <strong>$fixed</strong></p>";
    echo "<p class='warning'>⏭️ Artículos saltados (ya tenían template): <strong>$skipped</strong></p>";
    echo "<p class='error'>❌ Errores: <strong>$errors</strong></p>";
    echo "<p>Total procesados: <strong>" . count($files) . "</strong></p>";

    echo "<br><a href='fix-all-articles.php' style='color:#84cc16'>← Volver</a>";

} else {
    // Mostrar estado actual
    echo "<h2>📊 Estado Actual de Artículos</h2>";

    $files = glob($blogDir . '/r-*.html');
    $withTemplate = 0;
    $withoutTemplate = 0;

    echo "<table style='width:100%;border-collapse:collapse'>";
    echo "<tr><th style='text-align:left;padding:8px;border-bottom:1px solid #444'>Archivo</th>";
    echo "<th style='padding:8px;border-bottom:1px solid #444'>Header</th>";
    echo "<th style='padding:8px;border-bottom:1px solid #444'>Footer</th>";
    echo "<th style='padding:8px;border-bottom:1px solid #444'>Wrapper</th>";
    echo "<th style='text-align:right;padding:8px;border-bottom:1px solid #444'>Tamaño</th></tr>";

    foreach ($files as $file) {
        $filename = basename($file);
        $content = file_get_contents($file);
        $size = filesize($file);

        $hasHeader = strpos($content, 'obs-header') !== false;
        $hasFooter = strpos($content, 'obs-footer') !== false;
        $hasWrapper = strpos($content, 'obs-article-content') !== false;

        $headerIcon = $hasHeader ? '✅' : '❌';
        $footerIcon = $hasFooter ? '✅' : '❌';
        $wrapperIcon = $hasWrapper ? '✅' : '❌';

        if ($hasHeader && $hasFooter && $hasWrapper) {
            $withTemplate++;
        } else {
            $withoutTemplate++;
        }

        echo "<tr>";
        echo "<td style='padding:8px'>$filename</td>";
        echo "<td style='padding:8px;text-align:center'>$headerIcon</td>";
        echo "<td style='padding:8px;text-align:center'>$footerIcon</td>";
        echo "<td style='padding:8px;text-align:center'>$wrapperIcon</td>";
        echo "<td style='padding:8px;text-align:right'>" . number_format($size) . " bytes</td>";
        echo "</tr>";
    }
    echo "</table>";

    echo "<br><h2>📋 Resumen</h2>";
    echo "<p>Total de artículos: <strong>" . count($files) . "</strong></p>";
    echo "<p class='success'>Con template OBS360: <strong>$withTemplate</strong></p>";
    echo "<p class='error'>Sin template (necesitan fix): <strong>$withoutTemplate</strong></p>";

    if ($withoutTemplate > 0) {
        echo "<br><h2>🚀 Ejecutar Fix</h2>";
        echo "<p>Esto aplicará el header y footer de OBS360 a todos los artículos que lo necesiten.</p>";
        echo "<form method='get'>";
        echo "<input type='hidden' name='run' value='true'>";
        echo "<button type='submit'>⚡ Estandarizar Todos los Artículos</button>";
        echo "</form>";
    } else {
        echo "<br><p class='success'>🎉 ¡Todos los artículos ya tienen el template OBS360!</p>";
    }
}

echo "</body></html>";
?>
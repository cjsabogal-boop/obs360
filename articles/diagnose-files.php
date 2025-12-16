<?php
// diagnose-files.php
// Diagnóstico completo de archivos

echo "<h1>🔍 Diagnóstico de Archivos</h1>";

$dir = __DIR__;
echo "<p>📁 Directorio actual: <b>$dir</b></p>";

// Verificar archivo específico
$testFile = $dir . '/r-teria1y3.html';
echo "<h2>Archivo: r-teria1y3.html</h2>";

if (file_exists($testFile)) {
    $content = file_get_contents($testFile);
    $size = strlen($content);
    $lines = substr_count($content, "\n");

    echo "<p>✅ Existe</p>";
    echo "<p>📊 Tamaño: <b>$size bytes</b></p>";
    echo "<p>📝 Líneas: <b>$lines</b></p>";

    // Mostrar primeras 100 líneas
    echo "<h3>Primeras 2000 caracteres:</h3>";
    echo "<pre style='background:#f0f0f0; padding:10px; max-height:400px; overflow:auto;'>";
    echo htmlspecialchars(substr($content, 0, 2000));
    echo "</pre>";

    // Buscar contenido clave
    if (strpos($content, 'obs-article-content') !== false) {
        echo "<p>⚠️ Tiene clase obs-article-content (template OBS360 aplicado)</p>";

        // Extraer contenido del div
        preg_match('/<div class="obs-article-content">(.*?)<\/div>/s', $content, $matches);
        if (isset($matches[1])) {
            $innerContent = trim($matches[1]);
            $innerLen = strlen($innerContent);
            echo "<p>📦 Contenido dentro de obs-article-content: <b>$innerLen caracteres</b></p>";
            if ($innerLen < 500) {
                echo "<p style='color:red;'>❌ ¡CONTENIDO VACÍO O MUY CORTO!</p>";
            }
        }
    } else {
        echo "<p>✅ NO tiene template OBS360 (contenido original)</p>";
    }

    // Verificar si tiene contenido real
    if (strpos($content, 'presentationCanvas') !== false) {
        echo "<p style='color:green;'>✅ Contiene 'presentationCanvas' - CONTENIDO REAL DETECTADO</p>";
    } else {
        echo "<p style='color:red;'>❌ NO contiene 'presentationCanvas' - POSIBLEMENTE VACÍO</p>";
    }

} else {
    echo "<p style='color:red;'>❌ NO EXISTE</p>";
}

// Listar todos los archivos HTML
echo "<h2>Archivos HTML en el directorio:</h2>";
$files = glob($dir . '/*.html');
echo "<ul>";
foreach ($files as $file) {
    $name = basename($file);
    $size = filesize($file);
    echo "<li>$name - $size bytes</li>";
}
echo "</ul>";

// Git status
echo "<h2>Estado de Git:</h2>";
echo "<pre>" . shell_exec('git status 2>&1') . "</pre>";
echo "<pre>" . shell_exec('git log --oneline -3 2>&1') . "</pre>";
?>
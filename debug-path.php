<?php
header('Content-Type: text/html; charset=utf-8');
echo "<h2>🕵️‍♂️ Diagnóstico de Rutas OBS360</h2>";

echo "<strong>Usuario Sistema:</strong> " . get_current_user() . "<br>";
echo "<strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "<strong>Directorio Actual:</strong> " . __DIR__ . "<br><hr>";

// Intentar encontrar la carpeta de artículos
$target_blog = $_SERVER['DOCUMENT_ROOT'] . "/blog/blog";
$target_repo = $_SERVER['DOCUMENT_ROOT'] . "/blog";

echo "<h3>1. Verificando Objetivo: $target_blog</h3>";

if (is_dir($target_blog)) {
    echo "<span style='color:green'>✅ ¡La carpeta EXISTE!</span><br>";
    $files = scandir($target_blog);
    echo "Archivos encontrados: " . count($files) . "<br>";
    echo "Primeros 5 archivos: <pre>" . print_r(array_slice($files, 2, 5), true) . "</pre>";
} else {
    echo "<span style='color:red'>❌ La carpeta NO EXISTE en esa ruta.</span><br>";
}

echo "<hr><h3>2. Explorando Repositorio: $target_repo</h3>";

if (is_dir($target_repo)) {
    echo "Contenido de <code>$target_repo</code>:<br>";
    $files = scandir($target_repo);
    echo "<pre>";
    foreach ($files as $file) {
        if ($file == '.' || $file == '..')
            continue;
        $path = $target_repo . '/' . $file;
        $type = is_dir($path) ? "[DIR]" : "[FILE]";
        echo "$type $file\n";
    }
    echo "</pre>";
} else {
    echo "<span style='color:red'>❌ ¡El directorio del repositorio ($target_repo) tampoco existe!</span><br>";
    echo "Revisando raíz public_html...<br>";
    $files = scandir($_SERVER['DOCUMENT_ROOT']);
    echo "<pre>" . print_r($files, true) . "</pre>";
}
?>
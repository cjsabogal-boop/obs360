<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 Diagnóstico de Versión en Disco</h1>";
echo "<p>Ruta actual: " . getcwd() . "</p>";

$file = 'admin/index.html';

if (file_exists($file)) {
    echo "<p>✅ El archivo <strong>$file</strong> EXISTE.</p>";

    $content = file_get_contents($file);
    $size = strlen($content);
    echo "<p>Tamaño del archivo: $size bytes</p>";

    // Buscar la cadena de versión
    if (strpos($content, 'v3.0 FIXED') !== false) {
        echo "<h2 style='color:green; font-size: 24px;'>✅ VERSIÓN CORRECTA EN DISCO</h2>";
        echo "<p>El archivo físico contiene 'v3.0 FIXED'.</p>";
        echo "<p><strong>CONCLUSIÓN:</strong> Si en el navegador ves otra cosa, es 100% CACHÉ (de tu navegador o de Cloudflare/Servidor).</p>";
    } else {
        echo "<h2 style='color:red; font-size: 24px;'>❌ VERSIÓN VIEJA EN DISCO</h2>";
        echo "<p>El archivo no contiene 'v3.0 FIXED'.</p>";

        // Intentar mostrar qué versión tiene
        if (preg_match('/<h1.*?>(.*?)<\/h1>/s', $content, $matches)) {
            echo "<p>El título actual en el archivo es: <strong>" . htmlspecialchars(strip_tags($matches[1])) . "</strong></p>";
        }
    }
} else {
    echo "<h2 style='color:red'>❌ El archivo admin/index.html NO EXISTE en esta carpeta.</h2>";
    echo "<p>Contenido de la carpeta actual:</p>";
    $files = scandir('.');
    echo "<pre>" . implode("\n", $files) . "</pre>";
}
echo "<br><br><a href='admin/'>Ir al Admin</a>";
?>
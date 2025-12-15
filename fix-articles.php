<?php
/**
 * Script de emergencia para re-estandarizar artículos
 * Sube este archivo por cPanel y ejecútalo desde el navegador
 * URL: https://obs360.co/fix-articles.php
 */

// Configuración
$blogDir = __DIR__ . '/blog';
$serverDir = __DIR__ . '/server';

echo "<h1>🔧 Re-estandarización de Artículos - OBS360</h1>";
echo "<p>Iniciando proceso...</p>";

// Verificar que Node.js esté disponible
exec('which node', $output, $returnCode);
if ($returnCode === 0) {
    echo "<p>✅ Node.js encontrado: " . implode('', $output) . "</p>";
    
    // Ejecutar el script de Node.js
    echo "<h2>Ejecutando standardize-articles.js...</h2>";
    echo "<pre>";
    
    $command = "cd " . escapeshellarg($serverDir) . " && node standardize-articles.js 2>&1";
    passthru($command, $exitCode);
    
    echo "</pre>";
    
    if ($exitCode === 0) {
        echo "<h2 style='color: green;'>✅ ¡Éxito! Artículos re-estandarizados correctamente</h2>";
        echo "<p><a href='/blog/'>Ver Blog →</a></p>";
    } else {
        echo "<h2 style='color: red;'>❌ Error al ejecutar el script</h2>";
        echo "<p>Código de salida: $exitCode</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Node.js no está disponible en el servidor</p>";
    echo "<p>Por favor, contacta a tu proveedor de hosting para instalar Node.js</p>";
}

echo "<hr>";
echo "<p><small>Script ejecutado: " . date('Y-m-d H:i:s') . "</small></p>";
?>

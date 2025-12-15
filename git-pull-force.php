<?php
/**
 * Script para FORZAR git pull (descarta cambios locales)
 * URL: https://obs360.co/git-pull-force.php
 */

echo "<h1>🔄 Git Pull (FORZADO)</h1>";
echo "<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;}h1{color:#28529a;}pre{background:#f5f5f5;padding:15px;border-radius:5px;overflow-x:auto;}.ok{color:green;}.error{color:red;}.warning{color:orange;}</style>";

$blogDir = __DIR__;

echo "<p class='warning'>⚠️ Este script DESCARTARÁ cualquier cambio local y descargará la versión de GitHub</p>";
echo "<p>Directorio: $blogDir</p>";

// Paso 1: Limpiar archivos sin seguimiento
echo "<h2>1. Limpiar archivos no rastreados</h2>";
$cleanCommand = "cd " . escapeshellarg($blogDir) . " && git clean -fd 2>&1";
$cleanOutput = shell_exec($cleanCommand);
echo "<pre>" . htmlspecialchars($cleanOutput) . "</pre>";

// Paso 2: Descartar cambios locales
echo "<h2>2. Descartar cambios locales</h2>";
$resetCommand = "cd " . escapeshellarg($blogDir) . " && git reset --hard HEAD 2>&1";
$resetOutput = shell_exec($resetCommand);
echo "<pre>" . htmlspecialchars($resetOutput) . "</pre>";

// Paso 3: Hacer pull
echo "<h2>3. Descargar última versión</h2>";
$pullCommand = "cd " . escapeshellarg($blogDir) . " && git pull origin main 2>&1";
$pullOutput = shell_exec($pullCommand);
echo "<pre>" . htmlspecialchars($pullOutput) . "</pre>";

if (strpos($pullOutput, 'Already up to date') !== false || strpos($pullOutput, 'Fast-forward') !== false || strpos($pullOutput, 'Updating') !== false) {
    echo "<p class='ok'>✅ Git pull completado exitosamente</p>";
    echo "<p><strong>Siguiente paso:</strong> <a href='check-server.php'>Ejecutar diagnóstico del servidor →</a></p>";
} else {
    echo "<p class='error'>⚠️ Revisa el output arriba</p>";
}

echo "<hr>";
echo "<p><a href='/admin/'>← Volver al Admin</a></p>";
?>
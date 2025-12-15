<?php
/**
 * SYNC - Script para sincronizar el servidor con GitHub
 * Acceder desde: https://obs360.co/sync.php
 * 
 * Este script hace un git pull forzado del repositorio remoto
 */

// Desactivar límite de tiempo
set_time_limit(120);

echo "<!DOCTYPE html>";
echo "<html><head><meta charset='utf-8'><title>SYNC OBS360</title>";
echo "<style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:20px;background:#1a1a2e;color:#eee}";
echo "h1{color:#84cc16}h2{color:#28529a;border-bottom:2px solid #28529a;padding-bottom:10px}";
echo "pre{background:#2d2d44;padding:15px;border-radius:8px;overflow-x:auto;font-size:13px}";
echo ".success{color:#22c55e;font-weight:bold}.error{color:#ef4444;font-weight:bold}";
echo "a{color:#84cc16}</style></head><body>";

echo "<h1>🔄 SYNC OBS360</h1>";

// Determinar directorio correcto
$rootDir = dirname(__FILE__);
chdir($rootDir);

echo "<p>📁 Directorio: <code>$rootDir</code></p>";

// Verificar si es un repositorio git
if (!is_dir('.git')) {
    echo "<p class='error'>❌ Este directorio no es un repositorio Git.</p>";
    exit;
}

// Mostrar estado actual
echo "<h2>📊 Estado Actual</h2>";
echo "<pre>" . shell_exec('git status 2>&1') . "</pre>";
echo "<pre>" . shell_exec('git log --oneline -3 2>&1') . "</pre>";

// Ejecutar sincronización
echo "<h2>🚀 Iniciando Sincronización...</h2>";

$commands = [
    'git fetch --all' => 'Obteniendo cambios remotos...',
    'git reset --hard origin/main' => 'Aplicando cambios (reset al commit remoto)...',
];

$allSuccess = true;

foreach ($commands as $cmd => $description) {
    echo "<h3>$description</h3>";
    echo "<code>$cmd</code>";
    $output = shell_exec("$cmd 2>&1");
    echo "<pre>$output</pre>";

    // Verificar si hubo errores
    if (strpos($output, 'fatal') !== false || strpos($output, 'error') !== false) {
        $allSuccess = false;
        echo "<p class='error'>⚠️ Posible error en este comando</p>";
    }
}

// Estado final
echo "<h2>📋 Estado Final</h2>";
echo "<pre>" . shell_exec('git log --oneline -3 2>&1') . "</pre>";

// Verificar archivos importantes
echo "<h2>🔍 Verificación de Archivos</h2>";
$filesToCheck = [
    'blog/r-teria1y3.html',
    'blog/r-n6ppru77.html',
    'blog/r-bozoi772.html',
    'admin/index.html',
];

echo "<table style='width:100%;border-collapse:collapse'>";
echo "<tr><th style='text-align:left;padding:8px;border-bottom:1px solid #444'>Archivo</th>";
echo "<th style='text-align:right;padding:8px;border-bottom:1px solid #444'>Tamaño</th></tr>";

foreach ($filesToCheck as $file) {
    $path = $rootDir . '/' . $file;
    if (file_exists($path)) {
        $size = filesize($path);
        $status = $size > 5000 ? '✅' : '⚠️';
        echo "<tr><td style='padding:8px'>$status $file</td><td style='text-align:right;padding:8px'>" . number_format($size) . " bytes</td></tr>";
    } else {
        echo "<tr><td style='padding:8px'>❌ $file</td><td style='text-align:right;padding:8px'>NO EXISTE</td></tr>";
    }
}
echo "</table>";

// Resultado final
if ($allSuccess) {
    echo "<h2 class='success'>✅ ¡Sincronización Completada!</h2>";
    echo "<p>Los archivos del servidor ahora están sincronizados con GitHub.</p>";
} else {
    echo "<h2 class='error'>⚠️ Sincronización con advertencias</h2>";
    echo "<p>Revisa los mensajes de error arriba.</p>";
}

// Links de prueba
echo "<h2>🧪 Probar Artículos</h2>";
echo "<ul>";
echo "<li><a href='blog/r-teria1y3.html' target='_blank'>r-teria1y3.html (Nielsen Report)</a></li>";
echo "<li><a href='blog/r-n6ppru77.html' target='_blank'>r-n6ppru77.html (PPC Playbook)</a></li>";
echo "<li><a href='blog/r-bozoi772.html' target='_blank'>r-bozoi772.html (Bitcoin Crédito)</a></li>";
echo "<li><a href='admin/' target='_blank'>Panel de Administración</a></li>";
echo "</ul>";

echo "</body></html>";
?>
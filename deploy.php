<?php
// DEPLOY NUCLEAR - v3.0 FORCE
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🚀 Deploy Nuclear v3.0</h1><pre>";

// 1. Renombrar carpeta admin vieja para obligar a git a recrearla
if (file_exists('admin') && is_dir('admin')) {
    $bakName = 'admin_bak_' . time();
    echo "🗑️ Renombrando 'admin' a '$bakName'...\n";
    rename('admin', $bakName);
}

// 2. Comandos Git Fuertes
$commands = [
    'export GIT_SSL_NO_VERIFY=1',
    'git remote set-url origin https://github.com/cjsabogal-boop/obs360.git',
    'git fetch --all',
    'git reset --hard origin/main',
    'git pull origin main',
    'git clean -fd',
    'chmod -R 755 admin'
];

foreach ($commands as $cmd) {
    echo "👉 $cmd\n";
    echo shell_exec("$cmd 2>&1");
    echo "\n";
}
echo "</pre>";

// Verificación
if (file_exists('admin/index.html')) {
    echo "<h2 style='color:green'>✅ Éxito. Admin restaurado.</h2>";
    // Intentar leer versión
    $content = file_get_contents('admin/index.html');
    if (strpos($content, 'v3.0 FIXED') !== false) {
        echo "<h3 style='color:blue'>VERSIÓN CORRECTA: v3.0 FIXED detectada.</h3>";
    } else {
        echo "<h3 style='color:orange'>ADVERTENCIA: Se descargó admin pero NO parece la versión v3.0 FIXED.</h3>";
    }
} else {
    echo "<h2 style='color:red'>❌ Error Critical: No se bajó la carpeta admin.</h2>";
    echo "Revisa los permisos de escritura o la conexión a GitHub.";
}

echo "<p>IMPORTANTE: Ve a cPanel -> Setup Node.js App -> <strong>RESTART</strong> ahora mismo.</p>";
echo "<p>Luego ve a <a href='admin/'>Tu Admin Panel</a></p>";
?>
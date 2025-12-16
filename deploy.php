<?php
// deploy.php - Forzar sincronización con GitHub
echo "<h1>🚀 Git Force Deploy</h1>";
echo "<pre>";

// Asegurar directorio correcto
chdir(__DIR__);
echo "📂 Directorio actual: " . __DIR__ . "\n";

// Configurar variables de entorno para git si es necesario
putenv("HOME=" . __DIR__);

// Comandos para resetear y traer todo nuevo
$commands = [
    'git remote update',      // Actualizar referencias remotas
    'git fetch origin',       // Traer cambios
    'git reset --hard origin/main', // Resetear a lo nuevo
    'git pull origin main',   // Asegurar pull
    'git clean -fd',          // Limpiar basura
    'git status',
    'git log -1'              // Mostrar último commit para verificar
];

foreach ($commands as $cmd) {
    echo "\n👉 Ejecutando: $cmd\n";
    $output = [];
    $return_var = 0;
    exec("$cmd 2>&1", $output, $return_var);
    echo implode("\n", $output) . "\n";

    if ($return_var !== 0) {
        echo "⚠️ Error al ejecutar comando (Code: $return_var)\n";
    }
}

echo "</pre>";
echo "<br><a href='/blog/admin/'>✅ Ir al Admin</a>";
?>
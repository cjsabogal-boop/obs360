<?php
// git-force-pull.php
// Fuerza sincronización completa con el repositorio remoto

echo "<h1>🔄 Forzando Sincronización Git...</h1>";

// Cambiar al directorio del blog
chdir(__DIR__);

echo "<p>📁 Directorio actual: " . getcwd() . "</p>";

// Ejecutar comandos Git
$commands = [
    'git fetch --all 2>&1',
    'git reset --hard origin/main 2>&1'
];

foreach ($commands as $cmd) {
    echo "<h3>Ejecutando: <code>$cmd</code></h3>";
    $output = shell_exec($cmd);
    echo "<pre style='background:#f0f0f0; padding:10px; border-radius:5px;'>$output</pre>";
}

echo "<h2 style='color:green;'>✅ ¡Sincronización completada!</h2>";
echo "<p>Ahora los archivos deberían estar actualizados.</p>";
echo "<p><a href='r-teria1y3.html'>Probar artículo r-teria1y3.html</a></p>";
echo "<p><a href='r-ntf1jphh.html'>Probar artículo Poppi</a></p>";
?>
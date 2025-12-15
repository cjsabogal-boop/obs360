<?php
/**
 * Script para hacer git pull desde el navegador
 * URL: https://obs360.co/git-pull.php
 */

echo "<h1>🔄 Git Pull</h1>";
echo "<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;}h1{color:#28529a;}pre{background:#f5f5f5;padding:15px;border-radius:5px;overflow-x:auto;}.ok{color:green;}.error{color:red;}</style>";

$blogDir = __DIR__;

echo "<h2>Ejecutando git pull...</h2>";
echo "<p>Directorio: $blogDir</p>";

$command = "cd " . escapeshellarg($blogDir) . " && git pull origin main 2>&1";
$output = shell_exec($command);

echo "<pre>" . htmlspecialchars($output) . "</pre>";

if (strpos($output, 'Already up to date') !== false || strpos($output, 'Fast-forward') !== false || strpos($output, 'Updating') !== false) {
    echo "<p class='ok'>✅ Git pull completado exitosamente</p>";
    echo "<p><strong>Siguiente paso:</strong> <a href='check-server.php'>Ejecutar diagnóstico del servidor →</a></p>";
} else {
    echo "<p class='error'>⚠️ Revisa el output arriba para ver si hubo algún problema</p>";
}

echo "<hr>";
echo "<p><a href='?'>🔄 Ejecutar de nuevo</a> | <a href='/admin/'>← Volver al Admin</a></p>";
?>
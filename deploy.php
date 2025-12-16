<?php
// DEPLOY OBS360 - Sincronización de archivos estáticos
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<html><body style='font-family: sans-serif; background: #121212; color: #e0e0e0; padding: 20px;'>";
echo "<h1>🚀 Deploy OBS360 Blog</h1>";
echo "<pre style='background: #1e1e1e; padding: 15px; border-radius: 8px;'>";

function run($cmd)
{
    echo "<span style='color: #4caf50;'>$ $cmd</span>\n";
    $output = shell_exec($cmd . " 2>&1");
    echo htmlspecialchars($output ?? '') . "\n";
    return $output ?? '';
}

// 1. Sincronizar con GitHub
echo "<h3>📦 1. Sincronizando con GitHub...</h3>";
run("git fetch --all");
run("git reset --hard origin/main");
run("git pull origin main");

// 2. Verificar archivos del frontend
echo "\n<h3>🔍 2. Verificando Archivos Frontend...</h3>";
$frontend_files = ['index.html', 'article.html', 'admin/index.html'];
$files_ok = true;

foreach ($frontend_files as $file) {
    if (file_exists($file)) {
        $size = filesize($file);
        echo "✅ $file existe (" . number_format($size) . " bytes)\n";
    } else {
        echo "❌ FALTA: $file\n";
        $files_ok = false;
    }
}

// 3. Verificar conexión con API (Vercel)
echo "\n<h3>🌐 3. Verificando API en Vercel...</h3>";
$api_url = 'https://obs360.vercel.app/api/version/check';
$context = stream_context_create(['http' => ['timeout' => 5]]);
$api_response = @file_get_contents($api_url, false, $context);

if ($api_response) {
    $data = json_decode($api_response, true);
    echo "✅ API Online\n";
    echo "   📊 Versión: " . ($data['version'] ?? 'N/A') . "\n";
    echo "   💾 Base de datos: " . ($data['database'] ?? 'N/A') . "\n";
    echo "   📝 Artículos: " . ($data['articles_count'] ?? 'N/A') . "\n";
} else {
    echo "⚠️ No se pudo conectar con la API (puede ser temporal)\n";
}

echo "</pre>";

// 4. Resultado
if ($files_ok) {
    echo "<h2 style='color: #4caf50;'>✅ DEPLOY EXITOSO</h2>";
    echo "<div style='background: #1e3a1e; padding: 20px; border-radius: 10px; border: 2px solid #4caf50;'>";
    echo "<h3 style='margin-top:0'>📋 Arquitectura Actual:</h3>";
    echo "<ul style='font-size: 16px; line-height: 1.8;'>";
    echo "<li><strong>Frontend:</strong> cPanel (obs360.co/blog/)</li>";
    echo "<li><strong>API:</strong> Vercel (obs360.vercel.app/api)</li>";
    echo "<li><strong>Base de datos:</strong> MongoDB Atlas</li>";
    echo "</ul>";
    echo "<h3>🔗 Enlaces:</h3>";
    echo "<ul style='font-size: 16px; line-height: 1.8;'>";
    echo "<li><a href='index.html' style='color: #80d8ff;'>📖 Ver Blog</a></li>";
    echo "<li><a href='admin/index.html' style='color: #80d8ff;'>⚙️ Panel Admin</a></li>";
    echo "<li><a href='https://obs360.vercel.app/api/articles' target='_blank' style='color: #80d8ff;'>🔌 Ver API</a></li>";
    echo "</ul>";
    echo "</div>";
} else {
    echo "<h2 style='color: #f44336;'>❌ HAY ARCHIVOS FALTANTES</h2>";
    echo "<p>Git pull no descargó todos los archivos. Intenta de nuevo o sube manualmente.</p>";
}

echo "<p style='margin-top: 30px; color: #888; font-size: 12px;'>Última actualización: " . date('Y-m-d H:i:s') . "</p>";
echo "</body></html>";
?>
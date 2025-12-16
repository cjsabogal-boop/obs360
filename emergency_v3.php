<?php
// emergency_v3.php - Restaura admin/index.html y server.js a la versión v3.0 FIXED
// Úsalo solo si Git falla.

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🛠️ OBS360 Emergency Repair v3.0</h1>";
echo "<pre>";

$files = [
    'admin/index.html' => 'https://raw.githubusercontent.com/cjsabogal-boop/obs360/main/admin/index.html',
    'server.js' => 'https://raw.githubusercontent.com/cjsabogal-boop/obs360/main/server.js'
];

foreach ($files as $localPath => $remoteUrl) {
    echo "⬇️ Descargando $localPath ... ";

    // Intentar CURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $remoteUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $content = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 200 && $content) {
        // Asegurar directorio
        $dir = dirname($localPath);
        if (!file_exists($dir))
            mkdir($dir, 0755, true);

        // Escribir archivo
        if (file_put_contents($localPath, $content)) {
            echo "✅ OK (" . strlen($content) . " bytes)\n";
        } else {
            echo "❌ Error de escritura\n";
        }
    } else {
        echo "❌ Error descarga (HTTP $httpCode)\n";
        // Fallback: file_get_contents
        $content = @file_get_contents($remoteUrl);
        if ($content) {
            file_put_contents($localPath, $content);
            echo "✅ OK (vía file_get_contents)\n";
        }
    }
}

echo "</pre>";
echo "<h2 style='color:green'>✅ Proceso completado.</h2>";
echo "<p>1. Ve a cPanel -> Setup Node.js App -> <strong>RESTART</strong>.</p>";
echo "<p>2. Abre <a href='admin/'>Tu Admin Panel</a> y verifica que diga 'v3.0 FIXED'.</p>";
?>
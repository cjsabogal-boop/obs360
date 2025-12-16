<?php
// fix-admin.php
// Script nuclear para forzar la actualización del admin panel desde GitHub

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🚀 OBS360 Admin Fixer</h1>";
echo "<pre>";

$targetDir = __DIR__ . '/admin';
$targetFile = $targetDir . '/index.html';

// 1. Crear directorio si no existe
if (!file_exists($targetDir)) {
    echo "Creating admin directory...\n";
    mkdir($targetDir, 0755, true);
}

// 2. URL del archivo raw en GitHub (usando el último commit válido)
// NOTA: Usamos la URL raw de tu repo. Asegúrate de que el repo sea público o usa un token si es privado.
// Si es público:
$urL = "https://raw.githubusercontent.com/cjsabogal-boop/obs360/main/admin/index.html";

echo "Downloading Admin Panel from: $urL\n";

// 3. Descargar contenido
$context = stream_context_create([
    "http" => [
        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    ]
]);
$content = file_get_contents($urL, false, $context);

if ($content === false) {
    echo "❌ Error downloading file via file_get_contents. Trying curl...\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $urL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'OBS360-Fixer');
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $content = curl_exec($ch);
    curl_close($ch);
}

// 4. Guardar archivo
if ($content) {
    $written = file_put_contents($targetFile, $content);
    if ($written) {
        echo "✅ Success! Written $written bytes to $targetFile\n";
        echo "MD5 checksum: " . md5($content) . "\n";
    } else {
        echo "❌ Error writing to file. Check permissions.\n";
    }
} else {
    echo "❌ Failed to download content. Is the repo public?\n";
}

echo "</pre>";
echo "<br><a href='/blog/admin/index.html' style='font-size:20px; background:navy; color:white; padding:10px; border-radius:5px; text-decoration:none;'>👉 IR AL ADMIN AHORA</a>";
?>
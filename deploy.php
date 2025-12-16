<?php
// DEPLOY NUCLEAR v4.0 - Autoarranque y Diagnóstico
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<html><body style='font-family: sans-serif; background: #121212; color: #e0e0e0; padding: 20px;'>";
echo "<h1>🚀 DEPLOY NUCLEAR v4.0 (Fix 404)</h1>";
echo "<pre style='background: #1e1e1e; padding: 15px; border-radius: 8px;'>";

function run($cmd)
{
    echo "<span style='color: #4caf50;'>$ $cmd</span>\n";
    $output = shell_exec($cmd . " 2>&1");
    echo htmlspecialchars($output) . "\n";
    return $output;
}

// 1. Desbloquear GIT (Reset Hard)
echo "<h3>📦 1. Sincronizando con GitHub...</h3>";
run("export GIT_SSL_NO_VERIFY=1");
run("git fetch --all");
run("git reset --hard origin/main"); // Esto borra cambios locales conflictivos
run("git pull origin main");

// 2. Verificar archivos críticos
echo "\n<h3>🔍 2. Verificando Archivos...</h3>";
$critical_files = ['server.js', 'admin/index.html', 'package.json'];
$files_ok = true;

foreach ($critical_files as $file) {
    if (file_exists($file)) {
        echo "✅ $file existe (" . filesize($file) . " bytes)\n";

        // Verificar contenido clave en server.js
        if ($file === 'server.js') {
            $content = file_get_contents($file);
            if (strpos($content, 'FIX CPanel') !== false) {
                echo "   ✨ server.js tiene el PARCHE CPanel (Correcto)\n";
            } else {
                echo "   ❌ server.js NO tiene el parche. Git pull falló.\n";
                $files_ok = false;
            }
        }
    } else {
        echo "❌ FALTA: $file\n";
        $files_ok = false;
    }
}

// 3. Resultado
echo "</pre>";

if ($files_ok) {
    echo "<h2 style='color: #4caf50;'>✅ TODO CORRECTO (Nivel Archivos)</h2>";
    echo "<p>El código en el servidor ya está actualizado y arreglado.</p>";
    echo "<div style='border: 2px solid #f44336; padding: 20px; border-radius: 10px; background: #3e1212;'>";
    echo "<h3 style='margin-top:0'>⚠️ ÚLTIMO PASO OBLIGATORIO:</h3>";
    echo "<ol style='font-size: 18px; line-height: 1.6;'>";
    echo "<li>Ve a <strong>cPanel</strong> &rarr; <strong>Setup Node.js App</strong></li>";
    echo "<li>Haz clic en el botón <strong>RESTART</strong> (Reiniciar)</li>";
    echo "<li>Espera 10 segundos.</li>";
    echo "<li><a href='admin/index.html' target='_blank' style='color: #80d8ff; font-weight: bold;'>👉 ENTRAR AL ADMIN</a></li>";
    echo "</ol>";
    echo "</div>";
} else {
    echo "<h2 style='color: #f44336;'>❌ AÚN HAY ERRORES</h2>";
    echo "<p>Git no pudo descargar los archivos. Contacta al soporte técnico o intenta subir 'server.js' manualmente.</p>";
}

echo "</body></html>";
?>
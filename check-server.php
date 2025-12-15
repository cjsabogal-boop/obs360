<?php
/**
 * Script de diagnóstico del servidor Node.js
 * Sube este archivo a la raíz y ejecútalo: https://obs360.co/check-server.php
 */

echo "<h1>🔍 Diagnóstico del Servidor OBS360</h1>";
echo "<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;}h1{color:#28529a;}pre{background:#f5f5f5;padding:15px;border-radius:5px;overflow-x:auto;}.ok{color:green;}.error{color:red;}.warning{color:orange;}</style>";

// 1. Verificar Node.js
echo "<h2>1. Verificar Node.js</h2>";
exec('which node 2>&1', $nodeOutput, $nodeReturn);
if ($nodeReturn === 0) {
    echo "<p class='ok'>✅ Node.js instalado: " . implode('', $nodeOutput) . "</p>";

    exec('node --version 2>&1', $versionOutput);
    echo "<p>Versión: " . implode('', $versionOutput) . "</p>";
} else {
    echo "<p class='error'>❌ Node.js NO está instalado o no está en el PATH</p>";
    echo "<p>Contacta a tu proveedor de hosting para instalar Node.js</p>";
}

// 2. Verificar si el servidor está corriendo
echo "<h2>2. Estado del Servidor Node.js</h2>";
exec('ps aux | grep "node.*server.js" | grep -v grep 2>&1', $psOutput, $psReturn);
if (!empty($psOutput)) {
    echo "<p class='ok'>✅ Servidor Node.js está CORRIENDO</p>";
    echo "<pre>" . implode("\n", $psOutput) . "</pre>";
} else {
    echo "<p class='error'>❌ Servidor Node.js NO está corriendo</p>";
}

// 3. Verificar puerto 3000
echo "<h2>3. Verificar Puerto 3000</h2>";
$connection = @fsockopen('localhost', 3000, $errno, $errstr, 1);
if ($connection) {
    echo "<p class='ok'>✅ Puerto 3000 está ABIERTO (servidor respondiendo)</p>";
    fclose($connection);
} else {
    echo "<p class='error'>❌ Puerto 3000 está CERRADO (servidor no responde)</p>";
}

// 4. Verificar archivos
echo "<h2>4. Verificar Archivos</h2>";
$serverJs = __DIR__ . '/server/server.js';
if (file_exists($serverJs)) {
    echo "<p class='ok'>✅ server.js existe</p>";
    echo "<p>Ubicación: $serverJs</p>";
} else {
    echo "<p class='error'>❌ server.js NO encontrado</p>";
}

// 5. Intentar iniciar el servidor (si no está corriendo)
echo "<h2>5. Intentar Iniciar Servidor</h2>";
if (empty($psOutput) && file_exists($serverJs)) {
    echo "<p class='warning'>⚠️ Intentando iniciar servidor...</p>";
    $serverDir = __DIR__ . '/server';
    $command = "cd " . escapeshellarg($serverDir) . " && nohup node server.js > server.log 2>&1 & echo $!";
    $pid = shell_exec($command);

    if ($pid) {
        echo "<p class='ok'>✅ Servidor iniciado con PID: $pid</p>";
        echo "<p>Espera 5 segundos y recarga esta página para verificar</p>";
    } else {
        echo "<p class='error'>❌ No se pudo iniciar el servidor</p>";
        echo "<p>Necesitas acceso SSH o contactar a soporte del hosting</p>";
    }
} elseif (!file_exists($serverJs)) {
    echo "<p class='error'>❌ No se puede iniciar (archivo no existe)</p>";
} else {
    echo "<p class='ok'>✅ El servidor ya está corriendo, no es necesario iniciarlo</p>";
}

// 6. Log del servidor (si existe)
echo "<h2>6. Log del Servidor (últimas 20 líneas)</h2>";
$logFile = __DIR__ . '/server/server.log';
if (file_exists($logFile)) {
    $log = file_get_contents($logFile);
    $lines = explode("\n", $log);
    $lastLines = array_slice($lines, -20);
    echo "<pre>" . htmlspecialchars(implode("\n", $lastLines)) . "</pre>";
} else {
    echo "<p class='warning'>⚠️ No hay archivo de log</p>";
}

echo "<hr>";
echo "<p><a href='/admin/'>← Volver al Admin</a> | <a href='?'>🔄 Recargar Diagnóstico</a></p>";
?>
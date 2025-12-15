<?php
// deploy-admin.php
// Copia automáticamente el Admin actualizado del repositorio a la carpeta pública real

$source = __DIR__ . '/admin/index.html';
// Ruta absoluta basada en tu hosting cPanel
$dest = '/home/vukcpszx/public_html/admin/index.html';

echo "<h1>🚀 Desplegando Admin...</h1>";
echo "<p>Fuente: $source</p>";
echo "<p>Destino: $dest</p>";

if (!file_exists($source)) {
    die("❌ Error CRÍTICO: No encuentro el archivo fuente (admin/index.html) dentro del repositorio.");
}

// Intentar copiar
if (copy($source, $dest)) {
    echo "<h2 style='color:green'>✅ ¡ÉXITO CONFIRMADO!</h2>";
    echo "<p>El archivo index.html se ha copiado correctamente a la carpeta /admin pública.</p>";
    echo "<p>👉 <a href='https://obs360.co/admin/'><b>IR AL ADMIN AHORA (Hard Refresh si es necesario)</b></a></p>";
} else {
    echo "<h2 style='color:red'>❌ Error al copiar</h2>";
    echo "<p>PHP no tuvo permisos para escribir en la carpeta destino, o la ruta es incorrecta.</p>";

    // Intento 2: Ruta relativa
    $destRel = __DIR__ . '/../admin/index.html';
    echo "<p>Intentando ruta relativa: $destRel ...</p>";

    if (copy($source, $destRel)) {
        echo "<h2 style='color:green'>✅ ¡ÉXITO (Ruta Relativa)!</h2>";
        echo "<p>Admin actualizado.</p>";
    } else {
        echo "❌ Falló también. Por favor copia el archivo manualmente desde File Manager.";
    }
}
?>
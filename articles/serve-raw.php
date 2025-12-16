<?php
// serve-raw.php?file=r-teria1y3.html
// Sirve el archivo HTML crudo, sin pasar por Node.js

$file = isset($_GET['file']) ? $_GET['file'] : 'r-teria1y3.html';

// Seguridad: solo permitir archivos .html en el directorio actual
$file = basename($file);
if (!preg_match('/^r-[a-z0-9]+\.html$/', $file)) {
    die("Archivo no válido");
}

$path = __DIR__ . '/' . $file;

if (file_exists($path)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($path);
} else {
    echo "Archivo no encontrado: $path";
}
?>
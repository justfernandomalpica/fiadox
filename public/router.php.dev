<?php
/**
 * router.php — Router de desarrollo para php -S
 * FiaDOX · Abarrotes Virrey
 *
 * Uso:
 *   cd /ruta/a/tu-proyecto/public
 *   php -S localhost:3000 router.php
 *
 * Lógica:
 *   1. Archivos estáticos existentes → se sirven tal cual (CSS, JS, favicon, etc.)
 *   2. Rutas /api/* y /auth/*        → index.php (backend PHP)
 *   3. Cualquier otra ruta           → index.html (la SPA)
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// 1. Archivo estático que existe en disco → servir directamente
$file = __DIR__ . $uri;
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false; // php -S lo sirve automáticamente
}

// 2. Rutas del backend PHP
if (str_starts_with($uri, '/api/') || str_starts_with($uri, '/auth/')) {
    require __DIR__ . '/index.php';
    return true;
}

// 3. Todo lo demás → SPA
require __DIR__ . '/index.html';
return true;
<?php
// index.php - Router principal

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Normalizar ruta (quita parámetros y barra final)
$path = parse_url($request, PHP_URL_PATH);
$path = rtrim($path, '/');

// Rutas disponibles
switch ($path) {
    case '/publicacion':
    case '/public/publicacion':
        require_once("../api/controllers/publicacionController.php");
        break;

    case '/login':
    case '/public/login':
        require_once("../api/controllers/loginController.php");
        break;

    case '/registro':
    case '/public/registro':
        require_once("../api/controllers/registroController.php");
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Ruta no encontrada", "ruta" => $path]);
        break;
}

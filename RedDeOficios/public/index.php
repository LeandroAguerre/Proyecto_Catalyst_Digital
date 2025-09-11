<?php
// Habilita CORS si el frontend está en otro origen (opcional)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Obtiene la ruta solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$basePath = str_replace('/api/index.php', '', $scriptName);
$path = str_replace($basePath, '', $requestUri);
$path = strtok($path, '?'); // Elimina query string

// Rutas disponibles
switch ($path) {
    case '/api/registro':
        require_once __DIR__ . '/../config/database.php';
        require_once __DIR__ . '/controllers/RegistroController.php';
        RegistroController::procesar($_POST);
        break;

    case '/api/usuarios':
        require_once __DIR__ . '/controllers/UsuarioController.php';
        UsuarioController::listar();
        break;
    case '/api/login':
        require_once __DIR__ . '/controllers/LoginController.php';
        LoginController::autenticar();
        break;
    case '/api/registro':
        require_once __DIR__ . '/controllers/RegistroController.php';
        RegistroController::crear();
        break;



    default:
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
        break;
}

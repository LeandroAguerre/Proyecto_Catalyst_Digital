<?php
// index.php - Router principal

// Headers CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener ruta y método
$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Normalizar ruta
$path = parse_url($request, PHP_URL_PATH);
$path = rtrim($path, '/');

// Log para debugging
error_log("=== REQUEST ===");
error_log("Método: " . $method);
error_log("Ruta: " . $path);

// Rutas y controladores
try {
    switch ($path) {
        case '/publicacion':
        case '/public/publicacion':
            $controllerPath = __DIR__ . "/../api/controllers/publicacionController.php";
            
            if (!file_exists($controllerPath)) {
                error_log("ERROR: No se encuentra publicacionController.php");
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['error' => 'Archivo de controlador no encontrado']);
                exit;
            }
            
            require_once($controllerPath);
            
            if (!class_exists('PublicacionController')) {
                error_log("ERROR: La clase PublicacionController no existe");
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['error' => 'Clase PublicacionController no encontrada']);
                exit;
            }
            
            $controller = new PublicacionController();
            
            if ($method === 'GET') {
                $controller->obtenerPublicaciones();
            } elseif ($method === 'POST') {
                $controller->crearPublicacion();
            } else {
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido']);
            }
            break;

        case '/login':
        case '/public/login':
            $controllerPath = __DIR__ . "/../api/controllers/loginController.php";
            
            if (!file_exists($controllerPath)) {
                error_log("ERROR: No se encuentra loginController.php en: " . $controllerPath);
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['error' => 'Archivo loginController no encontrado']);
                exit;
            }
            
            require_once($controllerPath);
            
            if (!class_exists('LoginController')) {
                error_log("ERROR: La clase LoginController no existe después de require");
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['error' => 'Clase LoginController no encontrada']);
                exit;
            }
            
            if ($method === 'POST') {
                $controller = new LoginController();
                $controller->login();
            } else {
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido']);
            }
            break;

        case '/registro':
        case '/public/registro':
            $controllerPath = __DIR__ . "/../api/controllers/registroController.php";
            
            if (!file_exists($controllerPath)) {
                error_log("ERROR: No se encuentra registroController.php");
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['error' => 'Archivo registroController no encontrado']);
                exit;
            }
            
            require_once($controllerPath);
            
            if (!class_exists('RegistroController')) {
                error_log("ERROR: La clase RegistroController no existe");
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['error' => 'Clase RegistroController no encontrada']);
                exit;
            }
            
            if ($method === 'POST') {
                $controller = new RegistroController();
                $controller->registrar();
            } else {
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido']);
            }
            break;

        default:
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(404);
            echo json_encode([
                'error' => 'Ruta no encontrada', 
                'ruta_solicitada' => $path
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("ERROR CRÍTICO: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error interno del servidor',
        'detalle' => $e->getMessage()
    ]);
}
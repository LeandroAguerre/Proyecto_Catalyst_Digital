<?php

//Definir la ruta base segura
define('BASE_PATH', __DIR__ . '/../src/');

//Obtener el tipo de peticion (registro, login)
$request = isset($_GET['request']) ? $_GET['request'] : '';

//Validar y llamar al archivo correspondiente
if ($request === 'registro' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once BASE_PATH . 'procesar_registro.php';
} elseif ($request === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once BASE_PATH . 'procesar_login.php';
} else {
    //Petición no valida o no encontrada
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Ruta no encontrada']);
}
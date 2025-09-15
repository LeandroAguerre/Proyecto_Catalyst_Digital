<?php
// Define la ruta absoluta a la raíz del proyecto
define('ROOT_PATH', __DIR__ . '/../');

require_once ROOT_PATH . 'api/config/database.php';
require_once ROOT_PATH . 'api/controllers/registroController.php';
require_once ROOT_PATH . 'api/controllers/loginController.php';

$accion = $_GET['accion'] ?? '';

switch ($accion) {
  case 'registro':
    (new RegistroController())->registrar();
    break;
case 'login':
  (new LoginController())->login();
  break;
  default:
  http_response_code(404);
  echo json_encode(['mensaje' => 'Acción no válida']);
}
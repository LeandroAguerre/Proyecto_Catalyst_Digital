<?php
require_once ROOT_PATH . 'api/config/database.php';
require_once ROOT_PATH . 'api/model/loginModel.php';

class LoginController {
    public function login() {
        // Lee el cuerpo de la solicitud JSON
        $data = json_decode(file_get_contents('php://input'));

        if (!isset($data->usuario) || !isset($data->pass)) {
            http_response_code(400); // Bad Request
            echo json_encode(['mensaje' => 'Datos incompletos.']);
            return;
        }

        $usuario = $data->usuario;
        $contrasena = $data->pass;

        $database = new Database();
        $db = $database->getConnection();
        
        $loginModel = new LoginModel($db);

        $hashGuardado = $loginModel->obtenerHash($usuario);

        // Verifica si se encontró el usuario y si la contraseña es correcta
        if ($hashGuardado && password_verify($contrasena, $hashGuardado)) {
            http_response_code(200);
            echo json_encode(['mensaje' => 'Inicio de sesión exitoso.']);
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(['mensaje' => 'Usuario o contraseña incorrectos.']);
        }
    }
}
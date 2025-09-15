<?php
require_once ROOT_PATH . 'api/config/database.php';
require_once ROOT_PATH . 'api/model/registroModel.php';

class RegistroController {
    public function registrar() {
        // Lee el cuerpo de la solicitud (el JSON enviado por fetch)
        $data = json_decode(file_get_contents('php://input'));

        // Verifica si los datos necesarios existen
        if (!isset($data->usuario) || !isset($data->pass)) {
            http_response_code(400); // Bad Request
            echo json_encode(['mensaje' => 'Datos incompletos.']);
            return;
        }

        $usuario = $data->usuario;
        $contrasena = $data->pass;
        
        $database = new Database();
        $db = $database->getConnection();
        
        $registroModel = new RegistroModel($db);

        $hash = password_hash($contrasena, PASSWORD_DEFAULT);

        if ($registroModel->crearUsuario($usuario, $hash)) {
            http_response_code(201); // Created
            echo json_encode(['mensaje' => 'Usuario registrado con éxito.']);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(['mensaje' => 'Error al registrar el usuario.']);
        }
    }
}
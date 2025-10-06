<?php
require_once ROOT_PATH . 'api/config/database.php';
require_once ROOT_PATH . 'api/model/loginModel.php';

class LoginController {
    public function login() {
        // Lee el cuerpo de la solicitud JSON
        $inputData = file_get_contents('php://input');
        error_log("Datos recibidos en login: " . $inputData);
        
        $data = json_decode($inputData);
        
        // Verificar si el JSON se decodificó correctamente
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error al decodificar JSON en login: " . json_last_error_msg());
            http_response_code(400);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'exito' => false,
                'mensaje' => 'JSON inválido'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (!isset($data->correoElectronico) || !isset($data->contrasena)) {
            error_log("Datos incompletos en login");
            http_response_code(400); // Bad Request
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'exito' => false,
                'mensaje' => 'Datos incompletos'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $correoElectronico = trim($data->correoElectronico);
        $contrasena = $data->contrasena;

        // Validaciones adicionales
        if (empty($correoElectronico) || empty($contrasena)) {
            http_response_code(400);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'exito' => false,
                'mensaje' => 'El correo y la contraseña son obligatorios'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $database = new Database();
            $db = $database->getConnection();
            
            if (!$db) {
                throw new Exception("No se pudo conectar a la base de datos");
            }
            
            $loginModel = new LoginModel($db);
            $hashGuardado = $loginModel->obtenerHashPorCorreo($correoElectronico);

            // Verifica si se encontró el usuario y si la contraseña es correcta
            if ($hashGuardado && password_verify($contrasena, $hashGuardado)) {
                error_log("Login exitoso para: " . $correoElectronico);
                http_response_code(200);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'exito' => true, 
                    'mensaje' => 'Inicio de sesión exitoso'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                error_log("Login fallido para: " . $correoElectronico);
                http_response_code(401); // Unauthorized
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'Correo o contraseña incorrectos'
                ], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            error_log("Excepción en login: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'exito' => false,
                'mensaje' => 'Error interno del servidor'
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
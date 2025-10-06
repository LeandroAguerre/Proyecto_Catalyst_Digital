<?php
require_once ROOT_PATH . 'api/config/database.php';
require_once ROOT_PATH . 'api/model/registroModel.php';

class RegistroController {
    public function registrar() {
        // Lee el cuerpo de la solicitud (el JSON enviado por fetch)
        $inputData = file_get_contents('php://input');
        error_log("Datos recibidos en registro: " . $inputData);
        
        $data = json_decode($inputData);
        
        // Verificar si el JSON se decodificó correctamente
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error al decodificar JSON: " . json_last_error_msg());
            http_response_code(400);
            echo json_encode([
                'exito' => false,
                'mensaje' => 'JSON inválido.'
            ]);
            return;
        }

        // Validación básica de campos obligatorios
        if (
            !isset($data->tipoUsuario) ||
            !isset($data->nombreCompleto) ||
            !isset($data->correoElectronico) ||
            !isset($data->contrasena)
        ) {
            error_log("Datos incompletos recibidos");
            http_response_code(400); // Bad Request
            echo json_encode([
                'exito' => false,
                'mensaje' => 'Datos incompletos.'
            ]);
            return;
        }

        // Asignación de variables
        $tipoUsuario = (int) $data->tipoUsuario;
        $nombreCompleto = trim($data->nombreCompleto);
        $correoElectronico = trim($data->correoElectronico);
        $contrasena = $data->contrasena;
        $rut = isset($data->rut) ? trim($data->rut) : null;

        // Validaciones adicionales
        if (empty($nombreCompleto) || empty($correoElectronico) || empty($contrasena)) {
            http_response_code(400);
            echo json_encode([
                'exito' => false,
                'mensaje' => 'Los campos obligatorios no pueden estar vacíos.'
            ]);
            return;
        }

        if (!filter_var($correoElectronico, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'exito' => false,
                'mensaje' => 'El formato del correo electrónico es inválido.'
            ]);
            return;
        }

        // Encriptar la contraseña
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);

        try {
            // Conexión y modelo
            $database = new Database();
            $db = $database->getConnection();
            
            if (!$db) {
                throw new Exception("No se pudo conectar a la base de datos");
            }
            
            $registroModel = new RegistroModel($db);

            // Crear usuario
            $resultado = $registroModel->crearUsuario($tipoUsuario, $nombreCompleto, $correoElectronico, $hash, $rut);
            
            if ($resultado) {
                error_log("Usuario registrado exitosamente: " . $correoElectronico);
                http_response_code(201); // Created
                echo json_encode([
                    'exito' => true,
                    'mensaje' => 'Usuario registrado con éxito.'
                ]);
            } else {
                error_log("Error al crear usuario en la base de datos");
                http_response_code(500); // Internal Server Error
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'Error al registrar el usuario. Posiblemente el correo ya existe.'
                ]);
            }
        } catch (Exception $e) {
            error_log("Excepción en registro: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'exito' => false,
                'mensaje' => 'Error interno del servidor.'
            ]);
        }
    }
}
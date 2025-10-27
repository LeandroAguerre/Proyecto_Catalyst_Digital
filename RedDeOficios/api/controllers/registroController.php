<?php
require_once(__DIR__ . "/../config/database.php");
require_once(__DIR__ . "/../model/registroModel.php");

class RegistroController {
        public function registrar() {
            ob_start(); // Start output buffering
            // CRÍTICO: Asegurar que la respuesta sea JSON
            header('Content-Type: application/json; charset=utf-8');
            
            // Lee el cuerpo de la solicitud (el JSON enviado por fetch)
            $inputData = file_get_contents('php://input');
            error_log("Datos recibidos en registro: " . $inputData);
            
            $data = json_decode($inputData);
            
            // Verificar si el JSON se decodificó correctamente
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("Error al decodificar JSON: " . json_last_error_msg());
                http_response_code(400);
                ob_clean(); // Clean any previous output
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
                http_response_code(400);
                ob_clean(); // Clean any previous output
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
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'Los campos obligatorios no pueden estar vacíos.'
                ]);
                return;
            }
    
            if (!filter_var($correoElectronico, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'El formato del correo electrónico es inválido.'
                ]);
                return;
            }
    
            // Validaciones de contraseña
            if (strlen($contrasena) < 8) {
                http_response_code(400);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'La contraseña debe tener al menos 8 caracteres.'
                ]);
                return;
            }
    
            if (!preg_match('/[A-Z]/', $contrasena)) {
                http_response_code(400);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'La contraseña debe contener al menos una letra mayúscula.'
                ]);
                return;
            }
    
            if (!preg_match('/[a-z]/', $contrasena)) {
                http_response_code(400);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'La contraseña debe contener al menos una letra minúscula.'
                ]);
                return;
            }
    
            if (!preg_match('/[0-9]/', $contrasena)) {
                http_response_code(400);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'La contraseña debe contener al menos un número.'
                ]);
                return;
            }
    
            if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\'"\\|,.<>\/?]/u', $contrasena)) {
                http_response_code(400);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'La contraseña debe contener al menos un carácter especial.'
                ]);
                return;
            }
    
            // Convertir a minúsculas para comparación insensible a mayúsculas/minúsculas
            $contrasenaLower = strtolower($contrasena);
            $nombreCompletoLower = strtolower($nombreCompleto);
            $correoElectronicoLower = strtolower($correoElectronico);
    
            if (strpos($contrasenaLower, $nombreCompletoLower) !== false || strpos($contrasenaLower, $correoElectronicoLower) !== false) {
                http_response_code(400);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'La contraseña no debe contener su nombre de usuario o correo electrónico.'
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
                    // NUEVO: Obtener datos completos del usuario recién creado
                    $usuario = $registroModel->obtenerUsuarioPorCorreo($correoElectronico);
                    
                    if ($usuario) {
                        error_log("Usuario registrado exitosamente: " . $correoElectronico);
                        http_response_code(201);
                        ob_clean(); // Clean any previous output
                        echo json_encode([
                            'exito' => true,
                            'mensaje' => 'Usuario registrado con éxito.',
                            'usuario' => [
                                'id' => (int)$usuario['id'],
                                'tipoUsuario' => (int)$usuario['tipoUsuario'],
                                'nombreCompleto' => $usuario['nombreCompleto'],
                                'correoElectronico' => $usuario['correoElectronico']
                            ]
                        ], JSON_UNESCAPED_UNICODE);
                    } else {
                        throw new Exception("Error al obtener datos del usuario creado");
                    }
                } else {
                    error_log("Error al crear usuario en la base de datos");
                    http_response_code(500);
                    ob_clean(); // Clean any previous output
                    echo json_encode([
                        'exito' => false,
                        'mensaje' => 'Error al registrar el usuario. Posiblemente el correo ya existe.'
                    ]);
                }
            } catch (Exception $e) {
                error_log("Excepción en registro: " . $e->getMessage());
                http_response_code(500);
                ob_clean(); // Clean any previous output
                echo json_encode([
                    'exito' => false,
                    'mensaje' => 'Error interno del servidor.'
                ]);
            }
        }
}
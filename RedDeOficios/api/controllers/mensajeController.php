<?php
require_once(__DIR__ . "/../config/database.php");
require_once(__DIR__ . "/../model/mensajeModel.php");

class MensajeController {
    
    // Enviar un mensaje
    public function enviarMensaje() {
        header('Content-Type: application/json; charset=utf-8');
        
        $inputData = file_get_contents('php://input');
        $data = json_decode($inputData);
        
        if (!isset($data->emisor_id) || !isset($data->receptor_id) || 
            !isset($data->publicacion_id) || !isset($data->mensaje)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
            return;
        }
        
        try {
            $mensajeModel = new MensajeModel();
            $resultado = $mensajeModel->enviarMensaje(
                $data->emisor_id,
                $data->receptor_id,
                $data->publicacion_id,
                trim($data->mensaje)
            );
            
            if ($resultado) {
                http_response_code(201);
                echo json_encode(['success' => true, 'message' => 'Mensaje enviado']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al enviar mensaje']);
            }
        } catch (Exception $e) {
            error_log("Error en enviarMensaje: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno']);
        }
    }
    
    // Obtener conversaciones de un usuario
    public function obtenerConversaciones() {
        header('Content-Type: application/json; charset=utf-8');
        
        $usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 0;
        
        if ($usuario_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de usuario inválido']);
            return;
        }
        
        try {
            $mensajeModel = new MensajeModel();
            $conversaciones = $mensajeModel->obtenerConversaciones($usuario_id);
            
            http_response_code(200);
            echo json_encode($conversaciones, JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            error_log("Error en obtenerConversaciones: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener conversaciones']);
        }
    }
    
    // Obtener mensajes de una conversación
    public function obtenerMensajes() {
        header('Content-Type: application/json; charset=utf-8');
        
        $usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 0;
        $otro_usuario_id = isset($_GET['otro_usuario_id']) ? (int)$_GET['otro_usuario_id'] : 0;
        $publicacion_id = isset($_GET['publicacion_id']) ? (int)$_GET['publicacion_id'] : 0;
        
        if ($usuario_id <= 0 || $otro_usuario_id <= 0 || $publicacion_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Parámetros inválidos']);
            return;
        }
        
        try {
            $mensajeModel = new MensajeModel();
            $mensajes = $mensajeModel->obtenerMensajes($usuario_id, $otro_usuario_id, $publicacion_id);
            
            // Marcar como leídos los mensajes recibidos
            $mensajeModel->marcarComoLeido($usuario_id, $otro_usuario_id, $publicacion_id);
            
            http_response_code(200);
            echo json_encode($mensajes, JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            error_log("Error en obtenerMensajes: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener mensajes']);
        }
    }
    
    // Eliminar conversación
    public function eliminarConversacion() {
        header('Content-Type: application/json; charset=utf-8');
        
        $inputData = file_get_contents('php://input');
        $data = json_decode($inputData);
        
        if (!isset($data->usuario_id) || !isset($data->otro_usuario_id) || !isset($data->publicacion_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
            return;
        }
        
        try {
            $mensajeModel = new MensajeModel();
            $resultado = $mensajeModel->eliminarConversacion(
                $data->usuario_id,
                $data->otro_usuario_id,
                $data->publicacion_id
            );
            
            if ($resultado) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Conversación eliminada']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al eliminar']);
            }
        } catch (Exception $e) {
            error_log("Error en eliminarConversacion: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno']);
        }
    }
    
    // Contar mensajes no leídos
    public function contarNoLeidos() {
        header('Content-Type: application/json; charset=utf-8');
        
        $usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 0;
        
        if ($usuario_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID inválido']);
            return;
        }
        
        try {
            $mensajeModel = new MensajeModel();
            $total = $mensajeModel->contarMensajesNoLeidos($usuario_id);
            
            http_response_code(200);
            echo json_encode(['total' => $total]);
        } catch (Exception $e) {
            error_log("Error en contarNoLeidos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error']);
        }
    }
}
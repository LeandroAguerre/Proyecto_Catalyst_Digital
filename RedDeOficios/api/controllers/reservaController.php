<?php
require_once(__DIR__ . "/../config/database.php");
require_once(__DIR__ . "/../model/reservaModel.php");

class ReservaController {
    
    // Crear nueva reserva
    public function crearReserva() {
        header('Content-Type: application/json; charset=utf-8');
        
        $inputData = file_get_contents('php://input');
        error_log("Datos recibidos en crearReserva: " . $inputData);
        
        $data = json_decode($inputData);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido']);
            return;
        }

        // Validar campos requeridos
        if (!isset($data->cliente_id) || !isset($data->proveedor_id) || 
            !isset($data->fecha_hora_inicio) || !isset($data->fecha_hora_fin)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();

            // Verificar conflicto de horarios
            $hayConflicto = $reservaModel->verificarConflictoHorario(
                $data->proveedor_id,
                $data->fecha_hora_inicio,
                $data->fecha_hora_fin
            );

            if ($hayConflicto) {
                http_response_code(409);
                echo json_encode([
                    'success' => false, 
                    'message' => 'El proveedor ya tiene una reserva en ese horario'
                ]);
                return;
            }

            // Crear reserva
            $resultado = $reservaModel->crearReserva(
                $data->cliente_id,
                $data->proveedor_id,
                $data->publicacion_id ?? null,
                $data->fecha_hora_inicio,
                $data->fecha_hora_fin,
                $data->notas_cliente ?? null
            );

            if ($resultado) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Reserva creada exitosamente. Esperando confirmación del proveedor.'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al crear la reserva']);
            }

        } catch (Exception $e) {
            error_log("Error en crearReserva: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
        }
    }

    // Obtener reservas del usuario (cliente o proveedor)
    public function obtenerReservas() {
        header('Content-Type: application/json; charset=utf-8');
        
        $usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 0;
        $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'cliente'; // 'cliente' o 'proveedor'

        if ($usuario_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de usuario inválido']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();

            if ($tipo === 'proveedor') {
                $reservas = $reservaModel->obtenerReservasPorProveedor($usuario_id);
            } else {
                $reservas = $reservaModel->obtenerReservasPorCliente($usuario_id);
            }

            http_response_code(200);
            echo json_encode($reservas, JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            error_log("Error en obtenerReservas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener reservas']);
        }
    }

    // Obtener fechas ocupadas del proveedor (para el calendario)
    public function obtenerFechasOcupadas() {
        header('Content-Type: application/json; charset=utf-8');
        
        $proveedor_id = isset($_GET['proveedor_id']) ? (int)$_GET['proveedor_id'] : 0;
        $mes = isset($_GET['mes']) ? (int)$_GET['mes'] : null;
        $anio = isset($_GET['anio']) ? (int)$_GET['anio'] : null;

        if ($proveedor_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de proveedor inválido']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();
            $fechas = $reservaModel->obtenerFechasOcupadasProveedor($proveedor_id, $mes, $anio);

            http_response_code(200);
            echo json_encode($fechas, JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            error_log("Error en obtenerFechasOcupadas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener fechas ocupadas']);
        }
    }

    // Confirmar reserva (proveedor acepta)
    public function confirmarReserva() {
        header('Content-Type: application/json; charset=utf-8');
        
        $inputData = file_get_contents('php://input');
        $data = json_decode($inputData);

        if (!isset($data->reserva_id) || !isset($data->proveedor_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();
            $resultado = $reservaModel->confirmarReserva(
                $data->reserva_id,
                $data->proveedor_id,
                $data->respuesta ?? null
            );

            if ($resultado) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Reserva confirmada exitosamente']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No se pudo confirmar la reserva']);
            }

        } catch (Exception $e) {
            error_log("Error en confirmarReserva: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
        }
    }

    // Rechazar reserva (proveedor rechaza)
    public function rechazarReserva() {
        header('Content-Type: application/json; charset=utf-8');
        
        $inputData = file_get_contents('php://input');
        $data = json_decode($inputData);

        if (!isset($data->reserva_id) || !isset($data->proveedor_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();
            $resultado = $reservaModel->rechazarReserva(
                $data->reserva_id,
                $data->proveedor_id,
                $data->motivo ?? null
            );

            if ($resultado) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Reserva rechazada']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No se pudo rechazar la reserva']);
            }

        } catch (Exception $e) {
            error_log("Error en rechazarReserva: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
        }
    }

    // Cancelar reserva
    public function cancelarReserva() {
        header('Content-Type: application/json; charset=utf-8');
        
        $inputData = file_get_contents('php://input');
        $data = json_decode($inputData);

        if (!isset($data->reserva_id) || !isset($data->usuario_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();
            $resultado = $reservaModel->cancelarReserva(
                $data->reserva_id,
                $data->usuario_id,
                $data->motivo ?? null
            );

            http_response_code($resultado['success'] ? 200 : 400);
            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            error_log("Error en cancelarReserva: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
        }
    }
}
<?php
require_once(__DIR__ . "/../config/database.php");
require_once(__DIR__ . "/../model/reservaModel.php");
require_once(__DIR__ . "/../model/publicacionModel.php");

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
            !isset($data->fecha_hora_inicio) || !isset($data->fecha_hora_fin) || !isset($data->publicacion_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios (cliente_id, proveedor_id, publicacion_id, fecha_hora_inicio, fecha_hora_fin)']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();
            $publicacionModel = new Publicacion();

            // Obtener detalles de la publicación para obtener horario y horas mínimas del proveedor
            $publicacion = $publicacionModel->obtenerPorId($data->publicacion_id);
            if (!$publicacion) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Publicación no encontrada']);
                return;
            }

            $hora_inicio_proveedor = $publicacion['hora_inicio'];
            $hora_fin_proveedor = $publicacion['hora_fin'];
            $horas_minimas_proveedor = (float)$publicacion['horas_minimas'];

            // Verificar conflicto de horarios con la nueva lógica detallada
            $disponibilidad = $reservaModel->verificarDisponibilidadDetallada(
                $data->proveedor_id,
                $data->fecha_hora_inicio,
                $data->fecha_hora_fin,
                $hora_inicio_proveedor,
                $hora_fin_proveedor,
                $horas_minimas_proveedor
            );

            if (!$disponibilidad['available']) {
                http_response_code(409);
                echo json_encode([
                    'success' => false, 
                    'message' => $disponibilidad['message']
                ]);
                return;
            }

            // Crear reserva
            $resultado = $reservaModel->crearReserva(
                $data->cliente_id,
                $data->proveedor_id,
                $data->publicacion_id,
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

    // Obtener reservas del usuario (cliente o proveedor) o cantidad de pendientes
    public function obtenerReservas() {
        header('Content-Type: application/json; charset=utf-8');
        
        $usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 0;
        $pendientes = isset($_GET['pendientes']) && $_GET['pendientes'] === 'true';
        $tipo_usuario = isset($_GET['tipo_usuario']) ? (int)$_GET['tipo_usuario'] : 0; // 1 para cliente, 2 para proveedor

        if ($usuario_id <= 0 || ($pendientes && $tipo_usuario == 0)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de usuario o tipo de usuario inválido']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();

            if ($pendientes) {
                $debug_messages = [];
                $debug_messages[] = "Controller: usuario_id: " . $usuario_id . ", tipo_usuario: " . $tipo_usuario;
                $totalPendientes = $reservaModel->contarReservasPendientesPorUsuario($usuario_id, $tipo_usuario, $debug_messages);
                $debug_messages[] = "Controller: totalPendientes: " . $totalPendientes;
                http_response_code(200);
                echo json_encode(['success' => true, 'total' => $totalPendientes, 'debug' => $debug_messages]);
                return;
            }

            $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'cliente'; // 'cliente' o 'proveedor'

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
            echo json_encode(['success' => false, 'message' => 'Error al obtener reservas']);
        }
    }

    // Marcar reservas como vistas por el cliente
    public function marcarReservasVistas() {
        header('Content-Type: application/json; charset=utf-8');
        
        $inputData = file_get_contents('php://input');
        $data = json_decode($inputData);

        if (!isset($data->cliente_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de cliente no proporcionado']);
            return;
        }

        try {
            $reservaModel = new ReservaModel();
            $resultado = $reservaModel->marcarReservasVistasPorCliente($data->cliente_id);

            if ($resultado) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Reservas marcadas como vistas']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al marcar reservas como vistas']);
            }

        } catch (Exception $e) {
            error_log("Error en marcarReservasVistas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
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
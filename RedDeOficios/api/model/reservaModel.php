<?php
require_once(__DIR__ . "/../config/database.php");

class ReservaModel {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // Crear una nueva reserva
    public function crearReserva($cliente_id, $proveedor_id, $publicacion_id, $fecha_hora_inicio, $fecha_hora_fin, $notas_cliente = null) {
        try {
            $sql = "INSERT INTO reserva (cliente_id, proveedor_id, publicacion_id, fecha_hora_inicio, fecha_hora_fin, notas_cliente, estado)
                    VALUES (?, ?, ?, ?, ?, ?, 'pendiente')";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$cliente_id, $proveedor_id, $publicacion_id, $fecha_hora_inicio, $fecha_hora_fin, $notas_cliente]);
        } catch (PDOException $e) {
            error_log("Error al crear reserva: " . $e->getMessage());
            return false;
        }
    }

    // Obtener reservas del cliente
    public function obtenerReservasPorCliente($cliente_id) {
        try {
            $sql = "SELECT r.*, 
                    p.nombreCompleto as proveedor_nombre,
                    p.correoElectronico as proveedor_email,
                    pub.titulo as publicacion_titulo,
                    pub.tipo_servicio,
                    pub.imagen as publicacion_imagen
                    FROM reserva r
                    LEFT JOIN usuario p ON r.proveedor_id = p.id
                    LEFT JOIN publicacion pub ON r.publicacion_id = pub.id
                    WHERE r.cliente_id = ?
                    ORDER BY r.fecha_hora_inicio DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$cliente_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener reservas del cliente: " . $e->getMessage());
            return [];
        }
    }

    // Obtener reservas recibidas por el proveedor
    public function obtenerReservasPorProveedor($proveedor_id) {
        try {
            $sql = "SELECT r.*, 
                    c.nombreCompleto as cliente_nombre,
                    c.correoElectronico as cliente_email,
                    pub.titulo as publicacion_titulo,
                    pub.tipo_servicio,
                    pub.imagen as publicacion_imagen
                    FROM reserva r
                    LEFT JOIN usuario c ON r.cliente_id = c.id
                    LEFT JOIN publicacion pub ON r.publicacion_id = pub.id
                    WHERE r.proveedor_id = ?
                    ORDER BY r.fecha_hora_inicio DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$proveedor_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener reservas del proveedor: " . $e->getMessage());
            return [];
        }
    }

    // Obtener una reserva específica
    public function obtenerReservaPorId($reserva_id) {
        try {
            $sql = "SELECT r.*, 
                    c.nombreCompleto as cliente_nombre,
                    c.correoElectronico as cliente_email,
                    p.nombreCompleto as proveedor_nombre,
                    p.correoElectronico as proveedor_email,
                    pub.titulo as publicacion_titulo,
                    pub.tipo_servicio,
                    pub.imagen as publicacion_imagen
                    FROM reserva r
                    LEFT JOIN usuario c ON r.cliente_id = c.id
                    LEFT JOIN usuario p ON r.proveedor_id = p.id
                    LEFT JOIN publicacion pub ON r.publicacion_id = pub.id
                    WHERE r.id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$reserva_id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener reserva: " . $e->getMessage());
            return null;
        }
    }

    // Confirmar reserva (proveedor acepta)
    public function confirmarReserva($reserva_id, $proveedor_id, $respuesta = null) {
        try {
            $sql = "UPDATE reserva 
                    SET estado = 'confirmada', 
                        confirmada_por = ?, 
                        fecha_confirmacion = NOW(),
                        respuesta_proveedor = ?
                    WHERE id = ? AND proveedor_id = ? AND estado = 'pendiente'";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$proveedor_id, $respuesta, $reserva_id, $proveedor_id]);
        } catch (PDOException $e) {
            error_log("Error al confirmar reserva: " . $e->getMessage());
            return false;
        }
    }

    // Rechazar reserva (proveedor rechaza)
    public function rechazarReserva($reserva_id, $proveedor_id, $motivo = null) {
        try {
            $sql = "UPDATE reserva 
                    SET estado = 'rechazada', 
                        rechazada_por = ?, 
                        fecha_rechazo = NOW(),
                        motivo_rechazo = ?
                    WHERE id = ? AND proveedor_id = ? AND estado = 'pendiente'";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$proveedor_id, $motivo, $reserva_id, $proveedor_id]);
        } catch (PDOException $e) {
            error_log("Error al rechazar reserva: " . $e->getMessage());
            return false;
        }
    }

    // Cancelar reserva (cliente o proveedor)
    public function cancelarReserva($reserva_id, $usuario_id, $motivo = null) {
        try {
            // Verificar que falten al menos 24 horas
            $sql = "SELECT fecha_hora_inicio, cliente_id, proveedor_id, estado 
                    FROM reserva WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$reserva_id]);
            $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$reserva) {
                return ['success' => false, 'message' => 'Reserva no encontrada'];
            }

            // Verificar que el usuario tiene permiso para cancelar
            if ($reserva['cliente_id'] != $usuario_id && $reserva['proveedor_id'] != $usuario_id) {
                return ['success' => false, 'message' => 'No tienes permiso para cancelar esta reserva'];
            }

            // Verificar que esté en estado cancelable
            if (!in_array($reserva['estado'], ['pendiente', 'confirmada'])) {
                return ['success' => false, 'message' => 'Esta reserva no se puede cancelar'];
            }

            // Calcular horas de diferencia
            $fecha_inicio = strtotime($reserva['fecha_hora_inicio']);
            $ahora = time();
            $horas_diferencia = ($fecha_inicio - $ahora) / 3600;

            if ($horas_diferencia < 24) {
                return ['success' => false, 'message' => 'No se puede cancelar con menos de 24 horas de anticipación'];
            }

            // Cancelar
            $sql = "UPDATE reserva 
                    SET estado = 'cancelada', 
                        cancelada_por = ?, 
                        fecha_cancelacion = NOW(),
                        motivo_cancelacion = ?
                    WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $resultado = $stmt->execute([$usuario_id, $motivo, $reserva_id]);

            if ($resultado) {
                return ['success' => true, 'message' => 'Reserva cancelada exitosamente'];
            } else {
                return ['success' => false, 'message' => 'Error al cancelar la reserva'];
            }
        } catch (PDOException $e) {
            error_log("Error al cancelar reserva: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error interno del servidor'];
        }
    }

    // Obtener fechas ocupadas del proveedor (para el calendario)
    public function obtenerFechasOcupadasProveedor($proveedor_id, $mes = null, $anio = null) {
        try {
            $sql = "SELECT fecha_hora_inicio, fecha_hora_fin 
                    FROM reserva 
                    WHERE proveedor_id = ? 
                    AND estado IN ('pendiente', 'confirmada')";
            
            $params = [$proveedor_id];

            if ($mes && $anio) {
                $sql .= " AND MONTH(fecha_hora_inicio) = ? AND YEAR(fecha_hora_inicio) = ?";
                $params[] = $mes;
                $params[] = $anio;
            }

            $sql .= " ORDER BY fecha_hora_inicio";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener fechas ocupadas: " . $e->getMessage());
            return [];
        }
    }

    // Verificar si hay conflicto de horarios
    public function verificarConflictoHorario($proveedor_id, $fecha_hora_inicio, $fecha_hora_fin, $reserva_id_excluir = null) {
        try {
            $sql = "SELECT COUNT(*) as conflictos 
                    FROM reserva 
                    WHERE proveedor_id = ? 
                    AND estado IN ('pendiente', 'confirmada')
                    AND (
                        (fecha_hora_inicio BETWEEN ? AND ?) OR
                        (fecha_hora_fin BETWEEN ? AND ?) OR
                        (? BETWEEN fecha_hora_inicio AND fecha_hora_fin) OR
                        (? BETWEEN fecha_hora_inicio AND fecha_hora_fin)
                    )";
            
            $params = [$proveedor_id, $fecha_hora_inicio, $fecha_hora_fin, $fecha_hora_inicio, $fecha_hora_fin, $fecha_hora_inicio, $fecha_hora_fin];

            if ($reserva_id_excluir) {
                $sql .= " AND id != ?";
                $params[] = $reserva_id_excluir;
            }

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

            return $resultado['conflictos'] > 0;
        } catch (PDOException $e) {
            error_log("Error al verificar conflicto: " . $e->getMessage());
            return true; // Por seguridad, asumimos que hay conflicto si hay error
        }
    }
}
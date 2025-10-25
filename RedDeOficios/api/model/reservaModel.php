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



    // Nueva función para verificar disponibilidad detallada
    public function verificarDisponibilidadDetallada($proveedor_id, $fecha_hora_inicio_solicitud, $fecha_hora_fin_solicitud, $hora_inicio_proveedor, $hora_fin_proveedor, $horas_minimas_proveedor) {
        try {
            $inicio_solicitud = new DateTime($fecha_hora_inicio_solicitud);
            $fin_solicitud = new DateTime($fecha_hora_fin_solicitud);

            // 1. Validar que la fecha/hora de fin sea posterior a la de inicio
            if ($fin_solicitud <= $inicio_solicitud) {
                return ['available' => false, 'message' => 'La fecha/hora de fin debe ser posterior a la de inicio.'];
            }

            // 2. Validar que la solicitud esté dentro del horario de trabajo del proveedor
            $fecha_solicitud_str = $inicio_solicitud->format('Y-m-d');
            $hora_inicio_solicitud_str = $inicio_solicitud->format('H:i:s');
            $hora_fin_solicitud_str = $fin_solicitud->format('H:i:s');

            if ($hora_inicio_solicitud_str < $hora_inicio_proveedor || $hora_fin_solicitud_str > $hora_fin_proveedor) {
                return ['available' => false, 'message' => 'El horario solicitado está fuera del horario de trabajo del proveedor (' . substr($hora_inicio_proveedor, 0, 5) . ' a ' . substr($hora_fin_proveedor, 0, 5) . ').'];
            }

            // 3. Validar duración mínima
            $intervalo_solicitud = $inicio_solicitud->diff($fin_solicitud);
            $duracion_solicitud_horas = $intervalo_solicitud->days * 24 + $intervalo_solicitud->h + $intervalo_solicitud->i / 60;

            if ($duracion_solicitud_horas < $horas_minimas_proveedor) {
                return ['available' => false, 'message' => 'La reserva debe ser de al menos ' . $horas_minimas_proveedor . ' hora(s).'];
            }

            // 4. Obtener todas las reservas existentes para el proveedor en el día de la solicitud
            $reservas_existentes = $this->obtenerFechasOcupadasProveedor(
                $proveedor_id,
                (int)$inicio_solicitud->format('m'),
                (int)$inicio_solicitud->format('Y')
            );

            $intervalos_ocupados = [];
            foreach ($reservas_existentes as $reserva) {
                $res_inicio = new DateTime($reserva['fecha_hora_inicio']);
                $res_fin = new DateTime($reserva['fecha_hora_fin']);

                // Solo considerar reservas que caen en el mismo día de la solicitud
                if ($res_inicio->format('Y-m-d') === $fecha_solicitud_str) {
                    $intervalos_ocupados[] = [
                        'start' => $res_inicio->format('H:i:s'),
                        'end' => $res_fin->format('H:i:s')
                    ];
                }
            }

            // Ordenar y fusionar intervalos ocupados para simplificar la lógica de disponibilidad
            usort($intervalos_ocupados, function($a, $b) { return strtotime($a['start']) - strtotime($b['start']); });

            $intervalos_fusionados = [];
            if (!empty($intervalos_ocupados)) {
                $current = $intervalos_ocupados[0];
                for ($i = 1; $i < count($intervalos_ocupados); $i++) {
                    if (strtotime($intervalos_ocupados[$i]['start']) <= strtotime($current['end'])) {
                        $current['end'] = max($current['end'], $intervalos_ocupados[$i]['end']);
                    } else {
                        $intervalos_fusionados[] = $current;
                        $current = $intervalos_ocupados[$i];
                    }
                }
                $intervalos_fusionados[] = $current;
            }

            // 5. Verificar solapamiento directo con la solicitud
            foreach ($intervalos_fusionados as $intervalo) {
                $existente_inicio = new DateTime($fecha_solicitud_str . ' ' . $intervalo['start']);
                $existente_fin = new DateTime($fecha_solicitud_str . ' ' . $intervalo['end']);

                if (
                    ($inicio_solicitud < $existente_fin && $fin_solicitud > $existente_inicio)
                ) {
                    return ['available' => false, 'message' => 'El horario solicitado se solapa con una reserva existente.'];
                }
            }

            // 6. Calcular tiempo disponible y verificar si la solicitud cabe
            $jornada_inicio = new DateTime($fecha_solicitud_str . ' ' . $hora_inicio_proveedor);
            $jornada_fin = new DateTime($fecha_solicitud_str . ' ' . $hora_fin_proveedor);

            $tiempo_total_jornada_segundos = $jornada_fin->getTimestamp() - $jornada_inicio->getTimestamp();
            $tiempo_ocupado_segundos = 0;

            foreach ($intervalos_fusionados as $intervalo) {
                $reserva_inicio = new DateTime($fecha_solicitud_str . ' ' . $intervalo['start']);
                $reserva_fin = new DateTime($fecha_solicitud_str . ' ' . $intervalo['end']);

                // Asegurarse de que los intervalos ocupados estén dentro de la jornada laboral
                $overlap_start = max($jornada_inicio, $reserva_inicio);
                $overlap_end = min($jornada_fin, $reserva_fin);

                if ($overlap_start < $overlap_end) {
                    $tiempo_ocupado_segundos += ($overlap_end->getTimestamp() - $overlap_start->getTimestamp());
                }
            }

            $tiempo_disponible_segundos = $tiempo_total_jornada_segundos - $tiempo_ocupado_segundos;
            $tiempo_disponible_horas = $tiempo_disponible_segundos / 3600;

            if ($duracion_solicitud_horas > $tiempo_disponible_horas) {
                return ['available' => false, 'message' => 'No hay suficiente tiempo disponible para esta reserva en el día solicitado.'];
            }

            return ['available' => true, 'message' => 'Disponibilidad verificada.'];

        } catch (Exception $e) {
            error_log("Error en verificarDisponibilidadDetallada: " . $e->getMessage());
            return ['available' => false, 'message' => 'Error interno del servidor al verificar disponibilidad.'];
        }
    }
}
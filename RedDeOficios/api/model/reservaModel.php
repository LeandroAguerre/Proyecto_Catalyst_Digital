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

    // Contar reservas pendientes para un usuario (como cliente o proveedor)
    public function contarReservasPendientesPorUsuario($usuario_id, $tipoUsuario, &$debug_messages) {
        try {
            $totalPendientes = 0;

            // 1. Contar notificaciones de estado para el usuario como cliente (aceptadas, rechazadas, canceladas y no vistas)
            $sqlClienteStatus = "SELECT COUNT(*) as count_cliente_status 
                                 FROM reserva 
                                 WHERE cliente_id = ? 
                                 AND (estado = 'confirmada' OR estado = 'rechazada' OR estado = 'cancelada') 
                                 AND cliente_visto_estado = FALSE";
            $stmtClienteStatus = $this->conn->prepare($sqlClienteStatus);
            $stmtClienteStatus->execute([$usuario_id]);
            $resultClienteStatus = $stmtClienteStatus->fetch(PDO::FETCH_ASSOC);
            $totalPendientes += $resultClienteStatus['count_cliente_status'] ?? 0;
            $debug_messages[] = "Model: Cliente Status Count: " . ($resultClienteStatus['count_cliente_status'] ?? 0);

            // 2. Si el usuario es un proveedor, contar las reservas pendientes de su acción
            if ($tipoUsuario == 2) { // Es un proveedor
                $sqlProveedorPending = "SELECT COUNT(*) as count_proveedor_pending 
                                        FROM reserva 
                                        WHERE proveedor_id = ? 
                                        AND estado = 'pendiente'";
                $debug_messages[] = "Model: Proveedor Pending SQL: " . $sqlProveedorPending . ", Params: " . $usuario_id;
                $stmtProveedorPending = $this->conn->prepare($sqlProveedorPending);
                $stmtProveedorPending->execute([$usuario_id]);
                $resultProveedorPending = $stmtProveedorPending->fetch(PDO::FETCH_ASSOC);
                $totalPendientes += $resultProveedorPending['count_proveedor_pending'] ?? 0;
                $debug_messages[] = "Model: Proveedor Pending Count: " . ($resultProveedorPending['count_proveedor_pending'] ?? 0);
            }

            return $totalPendientes;
        } catch (PDOException $e) {
            $debug_messages[] = "Model Error: " . $e->getMessage();
            error_log("Error al contar reservas pendientes: " . $e->getMessage());
            return 0;
        }
    }

    // Marcar reservas como vistas por el cliente
    public function marcarReservasVistasPorCliente($cliente_id) {
        try {
            $sql = "UPDATE reserva 
                    SET cliente_visto_estado = TRUE 
                    WHERE cliente_id = ? 
                    AND (estado = 'confirmada' OR estado = 'rechazada') 
                    AND cliente_visto_estado = FALSE";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$cliente_id]);
        } catch (PDOException $e) {
            error_log("Error al marcar reservas como vistas: " . $e->getMessage());
            return false;
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
                $month_start_date = new DateTime("$anio-$mes-01 00:00:00");
                $month_end_date = new DateTime("$anio-$mes-01 00:00:00");
                $month_end_date->modify('last day of this month');
                $month_end_date->setTime(23, 59, 59); // Asegurar que cubra todo el día

                $sql .= " AND fecha_hora_inicio <= ? AND fecha_hora_fin >= ?";
                $params[] = $month_end_date->format('Y-m-d H:i:s');
                $params[] = $month_start_date->format('Y-m-d H:i:s');
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

            // Extraer componentes de tiempo diarios
            $daily_start_time_str = $inicio_solicitud->format('H:i:s');
            $daily_end_time_str = $fin_solicitud->format('H:i:s');

            // Validar que la fecha/hora de fin diaria sea posterior a la de inicio diaria
            if ($daily_end_time_str <= $daily_start_time_str) {
                return ['available' => false, 'message' => 'La hora de fin diaria debe ser posterior a la hora de inicio diaria.'];
            }

            // Calcular duración diaria
            $daily_start_temp = new DateTime('2000-01-01 ' . $daily_start_time_str);
            $daily_end_temp = new DateTime('2000-01-01 ' . $daily_end_time_str);
            $daily_duration_interval = $daily_start_temp->diff($daily_end_temp);
            $daily_duration_hours = $daily_duration_interval->h + $daily_duration_interval->i / 60;

            // Iterar a través de cada día en el rango de la solicitud
            $current_date = clone $inicio_solicitud;
            $end_date_loop = clone $fin_solicitud;
            $end_date_loop->setTime(0, 0, 0); // Normalizar a inicio del día para comparación

            while ($current_date->format('Y-m-d') <= $end_date_loop->format('Y-m-d')) {
                $current_day_str = $current_date->format('Y-m-d');
                $current_day_start_datetime = new DateTime($current_day_str . ' ' . $daily_start_time_str);
                $current_day_end_datetime = new DateTime($current_day_str . ' ' . $daily_end_time_str);

                // --- Inicio de las comprobaciones diarias ---

                // 1. Validar que el slot diario esté dentro del horario de trabajo del proveedor
                if ($daily_start_time_str < $hora_inicio_proveedor || $daily_end_time_str > $hora_fin_proveedor) {
                    return ['available' => false, 'message' => 'El horario diario solicitado (' . substr($daily_start_time_str, 0, 5) . ' a ' . substr($daily_end_time_str, 0, 5) . ') para el día ' . $current_day_str . ' está fuera del horario de trabajo del proveedor (' . substr($hora_inicio_proveedor, 0, 5) . ' a ' . substr($hora_fin_proveedor, 0, 5) . ').'];
                }

                // 2. Validar duración mínima para el slot diario
                if ($daily_duration_hours < $horas_minimas_proveedor) {
                    return ['available' => false, 'message' => 'Cada día de la reserva debe ser de al menos ' . $horas_minimas_proveedor . ' hora(s).'];
                }

                // 3. Obtener todas las reservas existentes para el proveedor en el mes del día actual
                $all_reservas_in_month = $this->obtenerFechasOcupadasProveedor(
                    $proveedor_id,
                    (int)$current_date->format('m'),
                    (int)$current_date->format('Y')
                );

                $reservas_existentes_para_el_dia = [];
                foreach ($all_reservas_in_month as $reserva) {
                    $res_inicio = new DateTime($reserva['fecha_hora_inicio']);
                    $res_fin = new DateTime($reserva['fecha_hora_fin']);

                    // Solo considerar reservas que caen en el mismo día actual
                    if ($res_inicio->format('Y-m-d') === $current_day_str) {
                        $reservas_existentes_para_el_dia[] = [
                            'start' => $res_inicio->format('H:i:s'),
                            'end' => $res_fin->format('H:i:s')
                        ];
                    }
                }

                // Ordenar y fusionar intervalos ocupados para el día actual
                usort($reservas_existentes_para_el_dia, function($a, $b) { return strtotime($a['start']) - strtotime($b['start']); });

                $intervalos_fusionados_dia = [];
                if (!empty($reservas_existentes_para_el_dia)) {
                    $current_interval = $reservas_existentes_para_el_dia[0];
                    for ($i = 1; $i < count($reservas_existentes_para_el_dia); $i++) {
                        if (strtotime($reservas_existentes_para_el_dia[$i]['start']) <= strtotime($current_interval['end'])) {
                            $current_interval['end'] = max($current_interval['end'], $reservas_existentes_para_el_dia[$i]['end']);
                        } else {
                            $intervalos_fusionados_dia[] = $current_interval;
                            $current_interval = $reservas_existentes_para_el_dia[$i];
                        }
                    }
                    $intervalos_fusionados_dia[] = $current_interval;
                }

                // 4. Verificar solapamiento directo con el slot diario solicitado
                foreach ($intervalos_fusionados_dia as $intervalo) {
                    $existente_inicio = new DateTime($current_day_str . ' ' . $intervalo['start']);
                    $existente_fin = new DateTime($current_day_str . ' ' . $intervalo['end']);

                    if (
                        ($current_day_start_datetime < $existente_fin && $current_day_end_datetime > $existente_inicio)
                    ) {
                        return ['available' => false, 'message' => 'El horario solicitado para el día ' . $current_day_str . ' se solapa con una reserva existente.'];
                    }
                }

                // 5. Calcular tiempo disponible y verificar si el slot diario cabe
                $jornada_inicio_dia = new DateTime($current_day_str . ' ' . $hora_inicio_proveedor);
                $jornada_fin_dia = new DateTime($current_day_str . ' ' . $hora_fin_proveedor);

                $tiempo_total_jornada_segundos_dia = $jornada_fin_dia->getTimestamp() - $jornada_inicio_dia->getTimestamp();
                $tiempo_ocupado_segundos_dia = 0;

                foreach ($intervalos_fusionados_dia as $intervalo) {
                    $reserva_inicio = new DateTime($current_day_str . ' ' . $intervalo['start']);
                    $reserva_fin = new DateTime($current_day_str . ' ' . $intervalo['end']);

                    // Asegurarse de que los intervalos ocupados estén dentro de la jornada laboral
                    $overlap_start = max($jornada_inicio_dia, $reserva_inicio);
                    $overlap_end = min($jornada_fin_dia, $reserva_fin);

                    if ($overlap_start < $overlap_end) {
                        $tiempo_ocupado_segundos_dia += ($overlap_end->getTimestamp() - $overlap_start->getTimestamp());
                    }
                }

                $tiempo_disponible_segundos_dia = $tiempo_total_jornada_segundos_dia - $tiempo_ocupado_segundos_dia;
                $tiempo_disponible_horas_dia = $tiempo_disponible_segundos_dia / 3600;

                if ($daily_duration_hours > $tiempo_disponible_horas_dia) {
                    return ['available' => false, 'message' => 'No hay suficiente tiempo disponible para esta reserva en el día ' . $current_day_str . '.'];
                }

                // --- Fin de las comprobaciones diarias ---

                $current_date->modify('+1 day');
            }

            return ['available' => true, 'message' => 'Disponibilidad verificada para todos los días solicitados.'];

        } catch (Exception $e) {
            error_log("Error en verificarDisponibilidadDetallada: " . $e->getMessage());
            return ['available' => false, 'message' => 'Error interno del servidor al verificar disponibilidad.'];
        }
    }
}
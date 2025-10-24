<?php
require_once(__DIR__ . "/../config/database.php");

class MensajeModel {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // Enviar un mensaje
    public function enviarMensaje($emisor_id, $receptor_id, $publicacion_id, $mensaje) {
        try {
            $sql = "INSERT INTO mensaje (emisor_id, receptor_id, publicacion_id, mensaje)
                    VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$emisor_id, $receptor_id, $publicacion_id, $mensaje]);
        } catch (PDOException $e) {
            error_log("Error al enviar mensaje: " . $e->getMessage());
            return false;
        }
    }

    // Obtener conversaciones de un usuario (lista de chats)
    public function obtenerConversaciones($usuario_id) {
        try {
            $sql = "SELECT 
                    DISTINCT
                    p.id as publicacion_id,
                    p.titulo as publicacion_titulo,
                    COALESCE(
                        (SELECT pi.ruta_imagen 
                         FROM publicacion_imagen pi 
                         WHERE pi.publicacion_id = p.id AND pi.es_principal = 1 
                         LIMIT 1),
                        p.imagen,
                        'imagenes/trabajador.jpg'
                    ) as publicacion_imagen,
                    CASE 
                        WHEN m.emisor_id = ? THEN m.receptor_id
                        ELSE m.emisor_id
                    END as otro_usuario_id,
                    CASE 
                        WHEN m.emisor_id = ? THEN u2.nombreCompleto
                        ELSE u1.nombreCompleto
                    END as otro_usuario_nombre,
                    (SELECT mensaje 
                     FROM mensaje m2 
                     WHERE m2.publicacion_id = p.id 
                       AND ((m2.emisor_id = ? AND m2.receptor_id = otro_usuario_id) 
                            OR (m2.receptor_id = ? AND m2.emisor_id = otro_usuario_id))
                     ORDER BY m2.fecha_envio DESC 
                     LIMIT 1) as ultimo_mensaje,
                    (SELECT fecha_envio 
                     FROM mensaje m2 
                     WHERE m2.publicacion_id = p.id 
                       AND ((m2.emisor_id = ? AND m2.receptor_id = otro_usuario_id) 
                            OR (m2.receptor_id = ? AND m2.emisor_id = otro_usuario_id))
                     ORDER BY m2.fecha_envio DESC 
                     LIMIT 1) as fecha_ultimo_mensaje,
                    (SELECT COUNT(*) 
                     FROM mensaje m3 
                     WHERE m3.publicacion_id = p.id 
                       AND m3.receptor_id = ? 
                       AND m3.leido = FALSE) as mensajes_no_leidos
                FROM mensaje m
                INNER JOIN publicacion p ON m.publicacion_id = p.id
                LEFT JOIN usuario u1 ON m.emisor_id = u1.id
                LEFT JOIN usuario u2 ON m.receptor_id = u2.id
                WHERE (m.emisor_id = ? OR m.receptor_id = ?)
                  AND ((m.emisor_id = ? AND m.eliminado_por_emisor = FALSE)
                       OR (m.receptor_id = ? AND m.eliminado_por_receptor = FALSE))
                ORDER BY fecha_ultimo_mensaje DESC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $usuario_id, $usuario_id, $usuario_id, $usuario_id,
                $usuario_id, $usuario_id, $usuario_id, $usuario_id,
                $usuario_id, $usuario_id, $usuario_id
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener conversaciones: " . $e->getMessage());
            return [];
        }
    }

    // Obtener mensajes de una conversación específica
    public function obtenerMensajes($usuario_id, $otro_usuario_id, $publicacion_id) {
        try {
            $sql = "SELECT 
                    m.*,
                    e.nombreCompleto as emisor_nombre,
                    r.nombreCompleto as receptor_nombre
                FROM mensaje m
                LEFT JOIN usuario e ON m.emisor_id = e.id
                LEFT JOIN usuario r ON m.receptor_id = r.id
                WHERE m.publicacion_id = ?
                  AND ((m.emisor_id = ? AND m.receptor_id = ?) 
                       OR (m.emisor_id = ? AND m.receptor_id = ?))
                  AND ((m.emisor_id = ? AND m.eliminado_por_emisor = FALSE)
                       OR (m.receptor_id = ? AND m.eliminado_por_receptor = FALSE))
                ORDER BY m.fecha_envio ASC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $publicacion_id,
                $usuario_id, $otro_usuario_id,
                $otro_usuario_id, $usuario_id,
                $usuario_id, $usuario_id
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener mensajes: " . $e->getMessage());
            return [];
        }
    }

    // Marcar mensajes como leídos
    public function marcarComoLeido($usuario_id, $otro_usuario_id, $publicacion_id) {
        try {
            $sql = "UPDATE mensaje 
                    SET leido = TRUE, fecha_lectura = NOW()
                    WHERE receptor_id = ? 
                      AND emisor_id = ?
                      AND publicacion_id = ?
                      AND leido = FALSE";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$usuario_id, $otro_usuario_id, $publicacion_id]);
        } catch (PDOException $e) {
            error_log("Error al marcar como leído: " . $e->getMessage());
            return false;
        }
    }

    // Eliminar conversación (soft delete)
    public function eliminarConversacion($usuario_id, $otro_usuario_id, $publicacion_id) {
        try {
            // Marcar como eliminado según el rol del usuario
            $sql = "UPDATE mensaje 
                    SET eliminado_por_emisor = CASE WHEN emisor_id = ? THEN TRUE ELSE eliminado_por_emisor END,
                        eliminado_por_receptor = CASE WHEN receptor_id = ? THEN TRUE ELSE eliminado_por_receptor END
                    WHERE publicacion_id = ?
                      AND ((emisor_id = ? AND receptor_id = ?) 
                           OR (emisor_id = ? AND receptor_id = ?))";
            
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([
                $usuario_id, $usuario_id, $publicacion_id,
                $usuario_id, $otro_usuario_id,
                $otro_usuario_id, $usuario_id
            ]);
        } catch (PDOException $e) {
            error_log("Error al eliminar conversación: " . $e->getMessage());
            return false;
        }
    }

    // Contar mensajes no leídos de un usuario
    public function contarMensajesNoLeidos($usuario_id) {
        try {
            $sql = "SELECT COUNT(*) as total 
                    FROM mensaje 
                    WHERE receptor_id = ? AND leido = FALSE";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$usuario_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total'];
        } catch (PDOException $e) {
            error_log("Error al contar mensajes no leídos: " . $e->getMessage());
            return 0;
        }
    }
}
<?php
class Publicacion {
    private $conn;

    public function __construct() {
        require_once(__DIR__ . "/../config/database.php");
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function crearPublicacion($usuario_creador_id, $titulo, $tipo_servicio, $telefono, $ubicacion, $descripcion, $fecha_inicio, $fecha_fin, $imagen) {
        try {
            $sql = "INSERT INTO publicacion (usuario_creador_id, titulo, tipo_servicio, telefono, ubicacion, descripcion, fecha_inicio, fecha_fin, imagen)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$usuario_creador_id, $titulo, $tipo_servicio, $telefono, $ubicacion, $descripcion, $fecha_inicio, $fecha_fin, $imagen]);
        } catch (PDOException $e) {
            error_log("Error al crear publicación: " . $e->getMessage());
            return false;
        }
    }

    public function obtenerPublicaciones() {
        try {
            $sql = "SELECT * FROM publicacion ORDER BY id DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener publicaciones: " . $e->getMessage());
            return [];
        }
    }
}
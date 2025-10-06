<?php
class Publicacion {
    private $conn;

    public function __construct() {
        require_once(__DIR__ . "/../config/database.php"); // 🔥 cambio importante
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function crearPublicacion($titulo, $tipo_servicio, $telefono, $ubicacion, $descripcion, $fecha_inicio, $fecha_fin, $imagen) {
        $sql = "INSERT INTO publicacion (titulo, tipo_servicio, telefono, ubicacion, descripcion, fecha_inicio, fecha_fin, imagen)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$titulo, $tipo_servicio, $telefono, $ubicacion, $descripcion, $fecha_inicio, $fecha_fin, $imagen]);
    }

    public function obtenerPublicaciones() {
        $sql = "SELECT * FROM publicacion ORDER BY id DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>

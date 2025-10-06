<?php
require_once ROOT_PATH . 'api/config/database.php';

class LoginModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function obtenerHashPorCorreo($correoElectronico) {
        try {
            $stmt = $this->conn->prepare("SELECT contrasena FROM usuario WHERE correoElectronico = ?");
            $stmt->execute([$correoElectronico]);
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Excepción en loginModel: " . $e->getMessage());
            return null;
        }
    }
}

<?php
require_once ROOT_PATH . 'api/config/database.php';

class LoginModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function obtenerHash($usuario) {
        try {
            $stmt = $this->conn->prepare("SELECT contrasenaUsuario FROM usuario WHERE nombreUsuario = ?");
            $stmt->execute([$usuario]);
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Excepción en loginModel: " . $e->getMessage());
            return null;
        }
    }
}
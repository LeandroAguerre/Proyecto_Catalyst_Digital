<?php
require_once(__DIR__ . "/../config/database.php");

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
    
    public function obtenerUsuarioPorCorreo($correoElectronico) {
        try {
            $stmt = $this->conn->prepare("SELECT id, tipoUsuario, nombreCompleto, correoElectronico FROM usuario WHERE correoElectronico = ?");
            $stmt->execute([$correoElectronico]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Excepción en obtenerUsuarioPorCorreo: " . $e->getMessage());
            return null;
        }
    }
}
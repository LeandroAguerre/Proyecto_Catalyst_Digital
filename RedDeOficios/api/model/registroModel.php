<?php
require_once(__DIR__ . "/../config/database.php");

class RegistroModel {
    private $conn;
    private $lastError = '';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crearUsuario($tipoUsuario, $nombreCompleto, $correoElectronico, $contrasena, $rut = null) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO usuario (tipoUsuario, nombreCompleto, correoElectronico, contrasena, rut)
                VALUES (?, ?, ?, ?, ?)
            ");

            $resultado = $stmt->execute([
                $tipoUsuario,
                $nombreCompleto,
                $correoElectronico,
                $contrasena,
                $rut
            ]);

            if (!$resultado) {
                $this->lastError = implode(" | ", $stmt->errorInfo());
                error_log("Error en registroModel: " . $this->lastError);
            }

            return $resultado;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Excepción en registroModel: " . $e->getMessage());
            return false;
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
    
    public function getLastError() {
        return $this->lastError;
    }
}
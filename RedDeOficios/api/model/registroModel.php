<?php

require_once ROOT_PATH . 'api/config/database.php';
require_once ROOT_PATH . 'api/model/registroModel.php';

class RegistroModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crearUsuario($usuario, $hash) {
        try {
            $stmt = $this->conn->prepare("INSERT INTO usuario (nombreUsuario, contrasenaUsuario) VALUES (?, ?)");
            $resultado = $stmt->execute([$usuario, $hash]);

            if (!$resultado) {
                error_log("Error en registroModel: " . implode(" | ", $stmt->errorInfo()));
            }

            return $resultado;
        } catch (PDOException $e) {
            error_log("Excepción en registroModel: " . $e->getMessage());
            return false;
        }
    }
}
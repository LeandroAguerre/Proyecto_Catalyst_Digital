<?php
require_once '../config/database.php';

class RegistroModel {
  public function crearUsuario($usuario, $hash) {
    try {
      $stmt = $conn->prepare("INSERT INTO usuario (nombreUsuario, contrasenaUsuario) VALUES (?, ?)");
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

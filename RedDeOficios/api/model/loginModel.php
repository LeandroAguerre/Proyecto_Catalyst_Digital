<?php
require_once ROOT_PATH . 'api/config/database.php';
require_once ROOT_PATH . 'api/model/registroModel.php';

class LoginModel {
  public function obtenerHash($usuario) {
    try {
      $stmt = $conn->prepare("SELECT contrasenaUsuario FROM usuario WHERE nombreUsuario = ?");
      $stmt->execute([$usuario]);
      return $stmt->fetchColumn();
    } catch (PDOException $e) {
      error_log("Excepción en loginModel: " . $e->getMessage());
      return null;
    }
  }
}

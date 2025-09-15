<?php
require_once '../model/registroModel.php';

class RegistroController {
  public function registrar() {
    $data = json_decode(file_get_contents("php://input"), true);
    $usuario = trim($data['usuario'] ?? '');
    $pass = trim($data['pass'] ?? '');

    if (!$usuario || !$pass) {
      echo json_encode(['mensaje' => 'Campos vacíos']);
      return;
    }

    $modelo = new RegistroModel();
    $exito = $modelo->crearUsuario($usuario, password_hash($pass, PASSWORD_DEFAULT));
    echo json_encode(['mensaje' => $exito ? 'Usuario creado' : 'Error al registrar']);
  }
}

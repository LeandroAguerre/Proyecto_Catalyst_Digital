<?php
require_once '../model/loginModel.php';

class LoginController {
  public function login() {
    $data = json_decode(file_get_contents("php://input"), true);
    $usuario = trim($data['usuario'] ?? '');
    $pass = trim($data['pass'] ?? '');

    if (!$usuario || !$pass) {
      echo json_encode(['mensaje' => 'Campos vacíos']);
      return;
    }

    $modelo = new LoginModel();
    $hash = $modelo->obtenerHash($usuario);

    if ($hash && password_verify($pass, $hash)) {
      echo json_encode(['exito' => true, 'mensaje' => 'Login exitoso']);
    } else {
      echo json_encode(['exito' => false, 'mensaje' => 'Credenciales inválidas']);
    }
  }
}

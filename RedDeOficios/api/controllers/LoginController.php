<?php
class LoginController {
    public static function autenticar() {
        $input = json_decode(file_get_contents('php://input'), true);
        $usuario = $input['usuario'] ?? '';
        $email = $input['email'] ?? '';
        $contrasena = $input['contrasena'] ?? '';

        require_once __DIR__ . '/../models/LoginModel.php';
        $resultado = LoginModel::verificar($usuario, $email, $contrasena);
        echo json_encode($resultado);
    }
}

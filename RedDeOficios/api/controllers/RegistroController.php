<?php
class RegistroController {
    public static function crear() {
        $input = json_decode(file_get_contents('php://input'), true);
        $usuario = $input['usuario'] ?? '';
        $email = $input['email'] ?? '';
        $contrasena = $input['contrasena'] ?? '';

        require_once __DIR__ . '/../models/RegistroModel.php';
        $resultado = RegistroModel::guardar($usuario, $email, $contrasena);
        echo json_encode($resultado);
    }
}

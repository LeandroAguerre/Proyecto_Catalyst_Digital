<?php
require_once __DIR__ . '/../../config/database.php';

class LoginModel {
    public static function verificar($usuario, $email, $contrasena) {
        global $pdo;

        $stmt = $pdo->prepare("SELECT contrasena FROM usuarios WHERE usuario = :usuario AND email = :email");
        $stmt->execute(['usuario' => $usuario, 'email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($contrasena, $user['contrasena'])) {
            return ['status' => 'ok', 'mensaje' => 'Login exitoso'];
        } else {
            return ['status' => 'error', 'mensaje' => 'Credenciales incorrectas'];
        }
    }
}

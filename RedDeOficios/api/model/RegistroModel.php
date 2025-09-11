<?php
require_once __DIR__ . '/../../config/database.php';

class RegistroModel {
    public static function guardar($usuario, $email, $contrasena) {
        global $pdo;

        // Validaciones básicas
        if (empty($usuario) || empty($email) || empty($contrasena)) {
            return ['status' => 'error', 'mensaje' => 'Todos los campos son obligatorios'];
        }

        // Verificar si el usuario o email ya existen
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = :usuario OR email = :email");
        $stmt->execute(['usuario' => $usuario, 'email' => $email]);
        if ($stmt->fetch()) {
            return ['status' => 'error', 'mensaje' => 'Usuario o email ya registrados'];
        }

        // Hashear la contraseña
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);

        // Insertar en la base de datos
        $stmt = $pdo->prepare("INSERT INTO usuarios (usuario, email, contrasena) VALUES (:usuario, :email, :contrasena)");
        $stmt->execute([
            'usuario' => $usuario,
            'email' => $email,
            'contrasena' => $hash
        ]);

        return ['status' => 'ok', 'mensaje' => 'Registro exitoso'];
    }
}

<?php

header('Content-Type: application/json'); //Indica que la respuesta será JSON

//Asume que este archivo esta en el mismo directorio.
require_once __DIR__ . '/database.php';

//Verifica si la petición es de tipo POST.
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    //Obtener y scanear los datos del formulario.
    //trim elimina espacios en blanco al inicio y al final.
    $nombre_completo = trim($_POST['nombre_completo']);
    $correo = trim($_POST['correo']);
    $password = $_POST['password'];
    $rol = $_POST['rol'];

    //Validar que los campos obligatorios no esten vacíos.
    if (empty($nombre_completo) || empty($correo) || empty($password) || empty($rol)) {
        echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
        exit;
    }
    
    //Hashing de la contraseña para seguridad.
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    try {
        //prevenir la inyección SQL.
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre_completo, correo, contraseña, rol) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nombre_completo, $correo, $hashed_password, $rol]);

        //enviar una respuesta JSON de exito.
        echo json_encode(['status' => 'success', 'message' => 'Registro exitoso. Bienvenido a RedDeOficios']);
        
    } catch (PDOException $e) {
        //En caso de error, verificar si es por un correo duplicado.
        if ($e->getCode() === '23000') { 
            echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya está registrado.']);
        } else {
            //Para otros errores, enviar un mensaje de error genérico.
            echo json_encode(['status' => 'error', 'message' => 'Ocurrió un error en el registro.']);
        }
    }

} else {
    //Si la petición no es POST, no esta autorizada.
    echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado.']);
}
?>
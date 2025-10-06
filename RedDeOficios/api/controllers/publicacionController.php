<?php
// require_once ROOT_PATH . '../config/database.php';
// require_once ROOT_PATH . '../model/publicacionModel.php';

require_once(__DIR__ . "/../config/database.php");
require_once(__DIR__ . "/../model/publicacionModel.php");

$publicacion = new Publicacion();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = $_POST['titulo'];
    $tipo_servicio = $_POST['tipo_servicio'];
    $telefono = $_POST['telefono'];
    $ubicacion = $_POST['ubicacion'];
    $descripcion = $_POST['descripcion'];
    $fecha_inicio = $_POST['fecha_inicio'];
    $fecha_fin = $_POST['fecha_fin'];

    // Imagen opcional
    $imagen = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
        $nombreArchivo = time() . "_" . basename($_FILES["imagen"]["name"]);
        $rutaDestino = "../../public/imagenes/" . $nombreArchivo;
        move_uploaded_file($_FILES["imagen"]["tmp_name"], $rutaDestino);
        $imagen = "imagenes/" . $nombreArchivo;
    }

    $ok = $publicacion->crearPublicacion($titulo, $tipo_servicio, $telefono, $ubicacion, $descripcion, $fecha_inicio, $fecha_fin, $imagen);
    echo json_encode(["success" => $ok, "message" => $ok ? "Publicación creada con éxito." : "Error al crear publicación."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = $publicacion->obtenerPublicaciones();
    echo json_encode($data);
}
?>

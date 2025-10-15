<?php
require_once(__DIR__ . "/../config/database.php");
require_once(__DIR__ . "/../model/publicacionModel.php");

class PublicacionController {
    
    public function obtenerPublicaciones() {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            $publicacion = new Publicacion();
            $data = $publicacion->obtenerPublicaciones();
            
            http_response_code(200);
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            error_log("Error en obtenerPublicaciones: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener publicaciones',
                'detalle' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    
    public function crearPublicacion() {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            // Validar que venga el usuario_creador_id
            if (!isset($_POST['usuario_creador_id']) || empty($_POST['usuario_creador_id'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Debe estar autenticado para crear una publicación'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }
            
            $usuario_creador_id = (int)$_POST['usuario_creador_id'];
            
            // Validar campos requeridos
            if (!isset($_POST['titulo']) || !isset($_POST['tipo_servicio']) || 
                !isset($_POST['telefono']) || !isset($_POST['ubicacion']) ||
                !isset($_POST['descripcion']) || !isset($_POST['fecha_inicio']) || 
                !isset($_POST['fecha_fin'])) {
                
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan campos obligatorios'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }
            
            $titulo = $_POST['titulo'];
            $tipo_servicio = $_POST['tipo_servicio'];
            $telefono = $_POST['telefono'];
            $ubicacion = $_POST['ubicacion'];
            $descripcion = $_POST['descripcion'];
            $fecha_inicio = $_POST['fecha_inicio'];
            $fecha_fin = $_POST['fecha_fin'];

            // Manejo de imagen opcional
            $imagen = null;
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
                $nombreArchivo = time() . "_" . basename($_FILES["imagen"]["name"]);
                $rutaDestino = __DIR__ . "/../../public/imagenes/" . $nombreArchivo;
                
                $directorioImagenes = __DIR__ . "/../../public/imagenes/";
                if (!is_dir($directorioImagenes)) {
                    mkdir($directorioImagenes, 0755, true);
                }
                
                if (move_uploaded_file($_FILES["imagen"]["tmp_name"], $rutaDestino)) {
                    $imagen = "imagenes/" . $nombreArchivo;
                } else {
                    error_log("Error al mover archivo de imagen");
                }
            }

            $publicacion = new Publicacion();
            $ok = $publicacion->crearPublicacion(
                $usuario_creador_id,
                $titulo, 
                $tipo_servicio, 
                $telefono, 
                $ubicacion, 
                $descripcion, 
                $fecha_inicio, 
                $fecha_fin, 
                $imagen
            );
            
            if ($ok) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Publicación creada con éxito.'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear publicación.'
                ], JSON_UNESCAPED_UNICODE);
            }
            
        } catch (Exception $e) {
            error_log("Error en crearPublicacion: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor',
                'detalle' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
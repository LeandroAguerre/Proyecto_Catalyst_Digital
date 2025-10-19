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

    public function obtenerPorId() {
        header('Content-Type: application/json; charset=utf-8');
        
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID inválido'], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        try {
            $publicacion = new Publicacion();
            $data = $publicacion->obtenerPorId($id);
            
            if ($data) {
                http_response_code(200);
                echo json_encode($data, JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Publicación no encontrada'], JSON_UNESCAPED_UNICODE);
            }
            
        } catch (Exception $e) {
            error_log("Error en obtenerPorId: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener publicación',
                'detalle' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    
    public function crearPublicacion() {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
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
                !isset($_POST['descripcion']) || !isset($_POST['hora_inicio']) || 
                !isset($_POST['hora_fin']) || !isset($_POST['horas_minimas'])) {
                
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan campos obligatorios'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }
            
            $titulo = trim($_POST['titulo']);
            $tipo_servicio = $_POST['tipo_servicio'];
            $telefono = trim($_POST['telefono']);
            $ubicacion = $_POST['ubicacion'];
            $descripcion = trim($_POST['descripcion']);
            $hora_inicio = $_POST['hora_inicio'];
            $hora_fin = $_POST['hora_fin'];
            $horas_minimas = (float)$_POST['horas_minimas'];

            // Validar que hora_fin > hora_inicio
            if ($hora_fin <= $hora_inicio) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'La hora de fin debe ser posterior a la hora de inicio'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            $publicacion = new Publicacion();
            $publicacion_id = $publicacion->crearPublicacion(
                $usuario_creador_id,
                $titulo, 
                $tipo_servicio, 
                $telefono, 
                $ubicacion, 
                $descripcion, 
                $hora_inicio, 
                $hora_fin, 
                $horas_minimas
            );
            
            if (!$publicacion_id) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear publicación.'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Procesar imágenes
            $imagenesSubidas = 0;
            if (isset($_FILES['imagenes']) && is_array($_FILES['imagenes']['name'])) {
                $totalImagenes = count($_FILES['imagenes']['name']);
                
                // Crear directorio si no existe
                $directorioUploads = __DIR__ . "/../../public/uploads/publicaciones/";
                if (!is_dir($directorioUploads)) {
                    mkdir($directorioUploads, 0755, true);
                }
                
                for ($i = 0; $i < min($totalImagenes, 5); $i++) {
                    if ($_FILES['imagenes']['error'][$i] == 0 && $_FILES['imagenes']['size'][$i] > 0) {
                        // Validar tipo de archivo
                        $tipoArchivo = strtolower(pathinfo($_FILES['imagenes']['name'][$i], PATHINFO_EXTENSION));
                        $tiposPermitidos = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                        
                        if (!in_array($tipoArchivo, $tiposPermitidos)) {
                            error_log("Tipo de archivo no permitido: " . $tipoArchivo);
                            continue;
                        }
                        
                        // Validar tamaño (máximo 5MB)
                        if ($_FILES['imagenes']['size'][$i] > 5 * 1024 * 1024) {
                            error_log("Archivo muy grande: " . $_FILES['imagenes']['size'][$i]);
                            continue;
                        }
                        
                        // Generar nombre único
                        $nombreArchivo = 'pub_' . $publicacion_id . '_img' . ($i + 1) . '_' . time() . '.' . $tipoArchivo;
                        $rutaDestino = $directorioUploads . $nombreArchivo;
                        
                        if (move_uploaded_file($_FILES['imagenes']['tmp_name'][$i], $rutaDestino)) {
                            $rutaRelativa = "uploads/publicaciones/" . $nombreArchivo;
                            $esPrincipal = ($i === 0); // La primera es la principal
                            
                            $publicacion->agregarImagenPublicacion($publicacion_id, $rutaRelativa, $esPrincipal, $i);
                            $imagenesSubidas++;
                        } else {
                            error_log("Error al mover archivo: " . $_FILES['imagenes']['name'][$i]);
                        }
                    }
                }
            }
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Publicación creada con éxito. ' . $imagenesSubidas . ' imagen(es) subida(s).',
                'publicacion_id' => $publicacion_id
            ], JSON_UNESCAPED_UNICODE);
            
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
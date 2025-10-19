<?php
class Publicacion {
    private $conn;

    public function __construct() {
        require_once(__DIR__ . "/../config/database.php");
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function crearPublicacion($usuario_creador_id, $titulo, $tipo_servicio, $telefono, $ubicacion, $descripcion, $hora_inicio, $hora_fin, $horas_minimas) {
        try {
            $sql = "INSERT INTO publicacion (usuario_creador_id, titulo, tipo_servicio, telefono, ubicacion, descripcion, hora_inicio, hora_fin, horas_minimas)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $resultado = $stmt->execute([$usuario_creador_id, $titulo, $tipo_servicio, $telefono, $ubicacion, $descripcion, $hora_inicio, $hora_fin, $horas_minimas]);
            
            if ($resultado) {
                return $this->conn->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error al crear publicación: " . $e->getMessage());
            return false;
        }
    }

    public function agregarImagenPublicacion($publicacion_id, $ruta_imagen, $es_principal = false, $orden = 0) {
        try {
            // Si es principal, primero quitar la flag de las demás
            if ($es_principal) {
                $this->quitarImagenPrincipal($publicacion_id);
            }
            
            $sql = "INSERT INTO publicacion_imagen (publicacion_id, ruta_imagen, es_principal, orden)
                    VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$publicacion_id, $ruta_imagen, $es_principal ? 1 : 0, $orden]);
        } catch (PDOException $e) {
            error_log("Error al agregar imagen: " . $e->getMessage());
            return false;
        }
    }

    private function quitarImagenPrincipal($publicacion_id) {
        try {
            $sql = "UPDATE publicacion_imagen SET es_principal = 0 WHERE publicacion_id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$publicacion_id]);
        } catch (PDOException $e) {
            error_log("Error al quitar imagen principal: " . $e->getMessage());
        }
    }

    public function obtenerPublicaciones() {
        try {
            $sql = "SELECT p.*, 
                    COALESCE(
                        (SELECT pi.ruta_imagen 
                         FROM publicacion_imagen pi 
                         WHERE pi.publicacion_id = p.id AND pi.es_principal = 1 
                         LIMIT 1),
                        p.imagen
                    ) as imagen_principal
                    FROM publicacion p 
                    ORDER BY p.id DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Normalize image paths so frontend won't request non-existing files
            foreach ($data as &$row) {
                $row['imagen_principal'] = $this->normalizeImagePath(isset($row['imagen_principal']) ? $row['imagen_principal'] : null);
                // also normalize legacy 'imagen' column if present
                if (isset($row['imagen'])) {
                    $row['imagen'] = $this->normalizeImagePath($row['imagen']);
                }
            }

            return $data;
        } catch (PDOException $e) {
            error_log("Error al obtener publicaciones: " . $e->getMessage());
            return [];
        }
    }

    public function obtenerPorId($id) {
        try {
            $sql = "SELECT p.*, 
                    u.nombreCompleto as nombre_proveedor, 
                    u.correoElectronico as email_proveedor
                    FROM publicacion p
                    LEFT JOIN usuario u ON p.usuario_creador_id = u.id
                    WHERE p.id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id]);
            $publicacion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($publicacion) {
                // Obtener todas las imágenes
                $publicacion['imagenes'] = $this->obtenerImagenesPublicacion($id);

                // Normalize main image fields
                if (isset($publicacion['imagen'])) {
                    $publicacion['imagen'] = $this->normalizeImagePath($publicacion['imagen']);
                }
                if (isset($publicacion['imagenes']) && is_array($publicacion['imagenes'])) {
                    foreach ($publicacion['imagenes'] as &$img) {
                        if (isset($img['ruta_imagen'])) {
                            $img['ruta_imagen'] = $this->normalizeImagePath($img['ruta_imagen']);
                        }
                    }
                }
            }
            
            return $publicacion;
        } catch (PDOException $e) {
            error_log("Error al obtener publicación por ID: " . $e->getMessage());
            return null;
        }
    }

    public function obtenerImagenesPublicacion($publicacion_id) {
        try {
            $sql = "SELECT * FROM publicacion_imagen 
                    WHERE publicacion_id = ? 
                    ORDER BY es_principal DESC, orden ASC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$publicacion_id]);
            $imagenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Normalize paths
            foreach ($imagenes as &$img) {
                if (isset($img['ruta_imagen'])) {
                    $img['ruta_imagen'] = $this->normalizeImagePath($img['ruta_imagen']);
                }
            }

            return $imagenes;
        } catch (PDOException $e) {
            error_log("Error al obtener imágenes: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Normalize an image path stored in DB to a public-accessible path.
     * It handles legacy paths like 'imagenes/xxx.png' and paths under 'uploads/publicaciones/...'.
     * If the file doesn't exist, returns the default placeholder 'imagenes/trabajador.jpg'.
     */
    private function normalizeImagePath($ruta) {
        $default = 'imagenes/trabajador.jpg';

        if (!$ruta || trim($ruta) === '') {
            return $default;
        }

        // If it's already an absolute-ish public path (starts without ../) return after checking existence
        $ruta = trim($ruta);

        // If ruta already starts with '/' remove leading slash for consistency
        if (strpos($ruta, '/') === 0) {
            $ruta = ltrim($ruta, '/');
        }

        // Candidate filesystem paths to check
        $candidates = [];

        // If ruta appears to be under 'uploads', check public/uploads first
        if (stripos($ruta, 'uploads/') === 0) {
            $candidates[] = __DIR__ . '/../../public/' . $ruta;
        }

        // Legacy 'imagenes/...' stored in DB; check public/imagenes
        if (stripos($ruta, 'imagenes/') === 0) {
            $candidates[] = __DIR__ . '/../../public/' . $ruta;
        }

        // Generic: if ruta is a bare filename, check public/uploads/publicaciones and public/imagenes
        $basename = basename($ruta);
        $candidates[] = __DIR__ . '/../../public/uploads/publicaciones/' . $basename;
        $candidates[] = __DIR__ . '/../../public/imagenes/' . $basename;

        foreach ($candidates as $path) {
            if (file_exists($path) && is_file($path)) {
                // Build the public URL path relative to DocumentRoot (public/)
                $publicPath = str_replace(realpath(__DIR__ . '/../../public') . '/', '', realpath($path));
                // If path couldn't be resolved via realpath, fallback to using basename
                if (!$publicPath) {
                    return 'uploads/publicaciones/' . $basename;
                }
                return $publicPath;
            }
        }

        // Not found — return default
        return $default;
    }
}
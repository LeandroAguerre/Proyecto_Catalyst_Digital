-- ============================================
-- TABLA: reserva
-- Sistema de reservas con rango de fecha/hora
-- ============================================
CREATE TABLE IF NOT EXISTS reserva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Participantes
    cliente_id INT NOT NULL COMMENT 'Usuario que hace la reserva (tipo 1)',
    proveedor_id INT NOT NULL COMMENT 'Usuario que recibe la reserva (tipo 2)',
    publicacion_id INT DEFAULT NULL COMMENT 'Publicación específica reservada',
    
    -- Rango de fecha y hora
    -- Ejemplo: Jueves 2025-10-16 11:00:00 hasta Viernes 2025-10-17 16:00:00
    fecha_hora_inicio DATETIME NOT NULL,
    fecha_hora_fin DATETIME NOT NULL,
    
    -- Estado de la reserva
    -- 'pendiente': Cliente envió solicitud, esperando respuesta del proveedor
    -- 'confirmada': Proveedor aceptó la reserva
    -- 'cancelada': Cancelada por cliente o proveedor
    -- 'completada': Servicio ya fue realizado
    -- 'rechazada': Proveedor rechazó la solicitud
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada', 'rechazada') DEFAULT 'pendiente',
    
    -- Información de cancelación
    cancelada_por INT DEFAULT NULL COMMENT 'ID del usuario que canceló',
    motivo_cancelacion TEXT DEFAULT NULL,
    fecha_cancelacion DATETIME DEFAULT NULL,
    
    -- Información de confirmación
    confirmada_por INT DEFAULT NULL COMMENT 'ID del proveedor que confirmó',
    fecha_confirmacion DATETIME DEFAULT NULL,
    
    -- Información de rechazo
    rechazada_por INT DEFAULT NULL COMMENT 'ID del proveedor que rechazó',
    motivo_rechazo TEXT DEFAULT NULL,
    fecha_rechazo DATETIME DEFAULT NULL,
    
    -- Mensajes
    notas_cliente TEXT DEFAULT NULL COMMENT 'Mensaje del cliente al reservar',
    respuesta_proveedor TEXT DEFAULT NULL COMMENT 'Respuesta del proveedor',
    
    -- Timestamps
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para búsquedas rápidas
    INDEX idx_cliente (cliente_id),
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_publicacion (publicacion_id),
    INDEX idx_fecha_inicio (fecha_hora_inicio),
    INDEX idx_fecha_fin (fecha_hora_fin),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: disponibilidad_proveedor
-- Horarios de trabajo del proveedor
-- ============================================
CREATE TABLE IF NOT EXISTS disponibilidad_proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    
    -- Día de la semana
    -- 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    dia_semana TINYINT NOT NULL,
    
    -- Horarios
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    
    -- Activo o no
    activo BOOLEAN DEFAULT TRUE,
    
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_dia_semana (dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: bloqueo_fecha
-- Fechas bloqueadas por el proveedor
-- ============================================
CREATE TABLE IF NOT EXISTS bloqueo_fecha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    
    -- Rango de bloqueo
    fecha_hora_inicio DATETIME NOT NULL,
    fecha_hora_fin DATETIME NOT NULL,
    
    motivo VARCHAR(255) DEFAULT NULL,
    
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_fechas (fecha_hora_inicio, fecha_hora_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS DE EJEMPLO (opcional para testing)
-- ============================================

-- Ejemplo: Disponibilidad de un proveedor
-- Proveedor ID=2 trabaja Lunes a Viernes de 9:00 a 18:00
/*
INSERT INTO disponibilidad_proveedor (proveedor_id, dia_semana, hora_inicio, hora_fin) VALUES
(2, 1, '09:00:00', '18:00:00'),
(2, 2, '09:00:00', '18:00:00'),
(2, 3, '09:00:00', '18:00:00'),
(2, 4, '09:00:00', '18:00:00'),
(2, 5, '09:00:00', '18:00:00');
*/

-- Ejemplo: Reserva del jueves 11:00 hasta viernes 16:00
/*
INSERT INTO reserva (cliente_id, proveedor_id, publicacion_id, fecha_hora_inicio, fecha_hora_fin, notas_cliente) 
VALUES (1, 2, 3, '2025-10-16 11:00:00', '2025-10-17 16:00:00', 'Necesito instalar una tubería nueva');
*/

-- Ejemplo: Bloqueo de fecha (vacaciones)
/*
INSERT INTO bloqueo_fecha (proveedor_id, fecha_hora_inicio, fecha_hora_fin, motivo)
VALUES (2, '2025-12-20 00:00:00', '2025-12-31 23:59:59', 'Vacaciones de fin de año');
*/

-- ============================================
-- AGREGAR CLAVES FORÁNEAS (para después)
-- ============================================
/*
ALTER TABLE reserva 
    ADD CONSTRAINT fk_reserva_cliente 
    FOREIGN KEY (cliente_id) REFERENCES usuario(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT fk_reserva_proveedor 
    FOREIGN KEY (proveedor_id) REFERENCES usuario(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT fk_reserva_publicacion 
    FOREIGN KEY (publicacion_id) REFERENCES publicacion(id) ON DELETE SET NULL;

ALTER TABLE disponibilidad_proveedor
    ADD CONSTRAINT fk_disponibilidad_proveedor
    FOREIGN KEY (proveedor_id) REFERENCES usuario(id) ON DELETE CASCADE;

ALTER TABLE bloqueo_fecha
    ADD CONSTRAINT fk_bloqueo_proveedor
    FOREIGN KEY (proveedor_id) REFERENCES usuario(id) ON DELETE CASCADE;
*/
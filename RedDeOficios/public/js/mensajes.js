// mensajes.js - Sistema de mensajería entre usuarios
// =====================================================

// Variables globales
let usuarioActual = null;
let conversacionActual = null;
let intervaloActualizacion = null;

// Configuración
const API_BASE = ''; // Sin prefijo ya que public/ es la raíz
const INTERVALO_POLLING = 5000; // 5 segundos

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log(' Iniciando sistema de mensajería...');
    
    // Verificar sesión
    usuarioActual = obtenerUsuarioSesion();
    
    if (!usuarioActual) {
        console.warn(' No hay sesión activa');
        mostrarError('Debes iniciar sesión para ver tus mensajes');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    console.log(' Usuario logueado:', usuarioActual);

    // Cargar conversaciones
    cargarConversaciones();

    // Configurar formulario de envío
    const formEnviar = document.getElementById('formEnviarMensaje');
    if (formEnviar) {
        formEnviar.addEventListener('submit', enviarMensaje);
    }

    // Polling para actualización automática
    iniciarPolling();

    // Actualizar badge inicial
    actualizarBadgeMensajes();

    // 🆕 Verificar si se debe abrir una conversación específica
    verificarConversacionPendiente();
});

// =====================================================
// GESTIÓN DE SESIÓN (Compatible con script.js)
// =====================================================

function obtenerUsuarioSesion() {
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) return null;
    
    return {
        id: parseInt(usuarioId),
        tipoUsuario: parseInt(sessionStorage.getItem('tipoUsuario')),
        nombreCompleto: sessionStorage.getItem('nombreCompleto'),
        correoElectronico: sessionStorage.getItem('correoElectronico')
    };
}

// =====================================================
// CARGAR CONVERSACIONES
// =====================================================

async function cargarConversaciones() {
    const listaConversaciones = document.getElementById('conversacionesList');
    
    try {
        listaConversaciones.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2">Cargando conversaciones...</p>
            </div>
        `;

        const response = await fetch(
            `${API_BASE}/mensaje?conversaciones=true&usuario_id=${usuarioActual.id}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        console.log(' Status conversaciones:', response.status);

        if (!response.ok) {
            throw new Error('Error al cargar conversaciones');
        }

        const conversaciones = await response.json();
        console.log(' Conversaciones obtenidas:', conversaciones);

        if (!Array.isArray(conversaciones) || conversaciones.length === 0) {
            listaConversaciones.innerHTML = `
                <div class="text-center p-4 text-muted">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-3">No tienes conversaciones aún</p>
                    <small>Los mensajes de tus reservas aparecerán aquí</small>
                </div>
            `;
            return;
        }

        // Renderizar lista de conversaciones
        listaConversaciones.innerHTML = conversaciones.map(conv => {
            const badge = conv.mensajes_no_leidos > 0 
                ? `<span class="badge bg-danger rounded-pill">${conv.mensajes_no_leidos}</span>` 
                : '';
            
            // Construir URL de imagen
            let imagenUrl = 'imagenes/trabajador.jpg'; // default
            
            if (conv.publicacion_imagen) {
                // Si tiene imagen principal o imagen normal
                if (conv.publicacion_imagen.startsWith('pub_')) {
                    imagenUrl = `uploads/publicaciones/${conv.publicacion_imagen}`;
                } else if (conv.publicacion_imagen.startsWith('imagenes/')) {
                    imagenUrl = conv.publicacion_imagen;
                } else {
                    imagenUrl = conv.publicacion_imagen;
                }
            }

            return `
                <div class="conversacion-item" 
                     data-publicacion-id="${conv.publicacion_id}"
                     data-otro-usuario-id="${conv.otro_usuario_id}"
                     data-otro-usuario-nombre="${escapeHtml(conv.otro_usuario_nombre || 'Usuario')}"
                     data-publicacion-titulo="${escapeHtml(conv.publicacion_titulo || 'Servicio')}"
                     data-publicacion-img="${imagenUrl}"
                     onclick="abrirConversacion(this)">
                    
                    <div class="d-flex align-items-center">
                        <img src="${imagenUrl}" 
                             class="me-3" 
                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                             onerror="this.src='imagenes/trabajador.jpg'">
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">${escapeHtml(conv.publicacion_titulo || 'Servicio')}</h6>
                                ${badge}
                            </div>
                            <small class="text-muted">${escapeHtml(conv.otro_usuario_nombre || 'Usuario')}</small>
                            <p class="mb-0 text-truncate" style="max-width: 200px;">
                                <small>${escapeHtml(conv.ultimo_mensaje || 'Sin mensajes')}</small>
                            </p>
                            <small class="text-muted">${formatearFecha(conv.fecha_ultimo_mensaje)}</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        console.log(' Conversaciones renderizadas');

    } catch (error) {
        console.error(' Error al cargar conversaciones:', error);
        listaConversaciones.innerHTML = `
            <div class="alert alert-danger m-3">
                <i class="bi bi-exclamation-triangle"></i>
                Error al cargar conversaciones
            </div>
        `;
    }
}

// =====================================================
// ABRIR CONVERSACIÓN
// =====================================================

function abrirConversacion(elemento) {
    console.log(' Abriendo conversación...');
    
    // Remover clase active de todas las conversaciones
    document.querySelectorAll('.conversacion-item').forEach(item => {
        item.classList.remove('active');
    });

    // Agregar clase active a la seleccionada
    elemento.classList.add('active');

    // Guardar datos de la conversación actual
    conversacionActual = {
        publicacionId: parseInt(elemento.dataset.publicacionId),
        otroUsuarioId: parseInt(elemento.dataset.otroUsuarioId),
        otroUsuarioNombre: elemento.dataset.otroUsuarioNombre,
        publicacionTitulo: elemento.dataset.publicacionTitulo,
        publicacionImg: elemento.dataset.publicacionImg
    };

    console.log(' Conversación actual:', conversacionActual);

    // Mostrar chat activo
    document.getElementById('noConversacion').style.display = 'none';
    const chatActivo = document.getElementById('chatActivo');
    chatActivo.style.display = 'flex';

    // Actualizar header del chat
    document.getElementById('chatPublicacionImg').src = conversacionActual.publicacionImg;
    document.getElementById('chatPublicacionImg').onerror = function() {
        this.src = 'imagenes/trabajador.jpg';
    };
    document.getElementById('chatPublicacionTitulo').textContent = conversacionActual.publicacionTitulo;
    document.getElementById('chatOtroUsuario').textContent = conversacionActual.otroUsuarioNombre;

    // Cargar mensajes
    cargarMensajes();
}

// =====================================================
// CARGAR MENSAJES
// =====================================================

async function cargarMensajes() {
    if (!conversacionActual) return;

    const chatMensajes = document.getElementById('chatMensajes');

    try {
        const response = await fetch(
            `${API_BASE}/mensaje?mensajes=true&usuario_id=${usuarioActual.id}&otro_usuario_id=${conversacionActual.otroUsuarioId}&publicacion_id=${conversacionActual.publicacionId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        console.log(' Status mensajes:', response.status);

        if (!response.ok) {
            throw new Error('Error al cargar mensajes');
        }

        const mensajes = await response.json();
        console.log(' Mensajes obtenidos:', mensajes.length);

        if (!Array.isArray(mensajes) || mensajes.length === 0) {
            chatMensajes.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-chat-square-text" style="font-size: 3rem;"></i>
                    <p class="mt-2">No hay mensajes aún</p>
                    <small>Envía el primer mensaje para iniciar la conversación</small>
                </div>
            `;
            return;
        }

        // Renderizar mensajes
        chatMensajes.innerHTML = mensajes.map(msg => {
            const esPropio = msg.emisor_id === usuarioActual.id;
            const claseMsg = esPropio ? 'propio' : 'otro';

            return `
                <div class="mensaje ${claseMsg}">
                    <div class="mensaje-bubble">
                        <div>${escapeHtml(msg.mensaje)}</div>
                        <div class="mensaje-fecha">${formatearFecha(msg.fecha_envio)}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll al final
        chatMensajes.scrollTop = chatMensajes.scrollHeight;

        // Actualizar badge de mensajes no leídos (la API ya marca como leídos)
        actualizarBadgeMensajes();

    } catch (error) {
        console.error(' Error al cargar mensajes:', error);
        chatMensajes.innerHTML = `
            <div class="alert alert-danger m-3">
                <i class="bi bi-exclamation-triangle"></i>
                Error al cargar mensajes
            </div>
        `;
    }
}

// =====================================================
// ENVIAR MENSAJE
// =====================================================

async function enviarMensaje(e) {
    e.preventDefault();

    if (!conversacionActual) {
        mostrarError('No hay conversación activa');
        return;
    }

    const inputMensaje = document.getElementById('inputMensaje');
    const mensaje = inputMensaje.value.trim();

    if (!mensaje) {
        return;
    }

    console.log(' Enviando mensaje...');

    // Deshabilitar input mientras se envía
    inputMensaje.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/mensaje?accion=enviar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                emisor_id: usuarioActual.id,
                receptor_id: conversacionActual.otroUsuarioId,
                publicacion_id: conversacionActual.publicacionId,
                mensaje: mensaje
            })
        });

        console.log(' Status envío:', response.status);

        const resultado = await response.json();
        console.log(' Resultado envío:', resultado);

        if (!response.ok || !resultado.success) {
            throw new Error(resultado.message || 'Error al enviar mensaje');
        }

        // Limpiar input
        inputMensaje.value = '';
        inputMensaje.disabled = false;
        inputMensaje.focus();

        console.log(' Mensaje enviado correctamente');

        // Recargar mensajes inmediatamente
        await cargarMensajes();

        // Actualizar lista de conversaciones en segundo plano
        cargarConversaciones().then(() => {
            // Reactivar la conversación actual
            const conversacionElemento = document.querySelector(
                `.conversacion-item[data-publicacion-id="${conversacionActual.publicacionId}"][data-otro-usuario-id="${conversacionActual.otroUsuarioId}"]`
            );
            if (conversacionElemento) {
                conversacionElemento.classList.add('active');
            }
        });

    } catch (error) {
        console.error(' Error al enviar mensaje:', error);
        mostrarError('Error al enviar mensaje. Por favor, intenta nuevamente.');
        inputMensaje.disabled = false;
    }
}

// =====================================================
// ELIMINAR CONVERSACIÓN
// =====================================================

async function eliminarConversacion() {
    if (!conversacionActual) {
        mostrarError('No hay conversación activa');
        return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.')) {
        return;
    }

    console.log(' Eliminando conversación...');

    try {
        const response = await fetch(`${API_BASE}/mensaje?accion=eliminar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: usuarioActual.id,
                otro_usuario_id: conversacionActual.otroUsuarioId,
                publicacion_id: conversacionActual.publicacionId
            })
        });

        console.log(' Status eliminación:', response.status);

        const resultado = await response.json();
        console.log(' Resultado eliminación:', resultado);

        if (!response.ok || !resultado.success) {
            throw new Error(resultado.message || 'Error al eliminar conversación');
        }

        // Cerrar chat
        document.getElementById('chatActivo').style.display = 'none';
        document.getElementById('noConversacion').style.display = 'flex';
        conversacionActual = null;

        console.log(' Conversación eliminada correctamente');

        // Recargar conversaciones
        await cargarConversaciones();

        mostrarExito('Conversación eliminada correctamente');

    } catch (error) {
        console.error(' Error al eliminar conversación:', error);
        mostrarError('Error al eliminar conversación. Por favor, intenta nuevamente.');
    }
}

// =====================================================
// ACTUALIZAR BADGE DE MENSAJES NO LEÍDOS
// =====================================================

async function actualizarBadgeMensajes() {
    try {
        const response = await fetch(
            `${API_BASE}/mensaje?no_leidos=true&usuario_id=${usuarioActual.id}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) return;

        const data = await response.json();
        const badge = document.getElementById('mensajesNoLeidos');
        
        if (badge) {
            if (data.total > 0) {
                badge.textContent = data.total;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error(' Error al actualizar badge:', error);
    }
}

// =====================================================
// POLLING PARA ACTUALIZACIÓN AUTOMÁTICA
// =====================================================

function iniciarPolling() {
    // Detener polling anterior si existe
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
    }

    console.log(' Iniciando polling cada', INTERVALO_POLLING / 1000, 'segundos');

    // Iniciar nuevo polling
    intervaloActualizacion = setInterval(async () => {
        // Solo actualizar mensajes si hay una conversación activa
        if (conversacionActual) {
            const chatMensajes = document.getElementById('chatMensajes');
            const scrollAntes = chatMensajes.scrollHeight - chatMensajes.scrollTop;
            
            await cargarMensajes();
            
            // Mantener scroll si estaba cerca del final (menos de 200px)
            if (scrollAntes < 200) {
                chatMensajes.scrollTop = chatMensajes.scrollHeight;
            }
        }
        
        // Siempre actualizar lista de conversaciones (silenciosamente)
        await cargarConversaciones();
        
    }, INTERVALO_POLLING);
}

// Detener polling cuando se sale de la página
window.addEventListener('beforeunload', () => {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
        console.log(' Polling detenido');
    }
});

// =====================================================
// UTILIDADES
// =====================================================

function formatearFecha(fecha) {
    if (!fecha) return '';
    
    const fechaMsg = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora - fechaMsg;
    
    // Menos de 1 minuto
    if (diferencia < 60000) {
        return 'Ahora';
    }
    
    // Menos de 1 hora
    if (diferencia < 3600000) {
        const minutos = Math.floor(diferencia / 60000);
        return `Hace ${minutos} min`;
    }
    
    // Menos de 24 horas
    if (diferencia < 86400000) {
        const horas = Math.floor(diferencia / 3600000);
        return `Hace ${horas}h`;
    }
    
    // Mismo año
    if (fechaMsg.getFullYear() === ahora.getFullYear()) {
        return fechaMsg.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short' 
        });
    }
    
    // Años anteriores
    return fechaMsg.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function mostrarError(mensaje) {
    console.error('', mensaje);
    if (typeof window.mostrarAlerta === 'function') {
        window.mostrarAlerta(mensaje, 'error');
    } else {
        alert('❌ ' + mensaje);
    }
}

function mostrarExito(mensaje) {
    console.log('', mensaje);
    if (typeof window.mostrarAlerta === 'function') {
        window.mostrarAlerta(mensaje, 'success');
    } else {
        alert('✅ ' + mensaje);
    }
}

// =====================================================
// EXPONER FUNCIONES GLOBALES
// =====================================================

// Hacer disponibles las funciones que se llaman desde HTML
window.abrirConversacion = abrirConversacion;
window.eliminarConversacion = eliminarConversacion;

console.log(' mensajes.js cargado correctamente');

// =====================================================
// 🆕 ABRIR CONVERSACIÓN AUTOMÁTICAMENTE (desde publicacion.html)
// =====================================================

async function verificarConversacionPendiente() {
    const datosConversacion = sessionStorage.getItem('abrirConversacion');
    
    if (!datosConversacion) return;
    
    try {
        const datos = JSON.parse(datosConversacion);
        console.log(' Conversación pendiente detectada:', datos);
        
        // Limpiar flag
        sessionStorage.removeItem('abrirConversacion');
        
        // Esperar a que carguen las conversaciones
        setTimeout(async () => {
            // Buscar si existe la conversación en la lista
            const conversacionElemento = document.querySelector(
                `.conversacion-item[data-publicacion-id="${datos.publicacionId}"][data-otro-usuario-id="${datos.otroUsuarioId}"]`
            );
            
            if (conversacionElemento) {
                // La conversación existe, abrirla
                console.log(' Conversación encontrada, abriendo...');
                abrirConversacion(conversacionElemento);
            } else {
                // La conversación no existe, necesitamos crearla
                console.log(' Conversación no existe, creando...');
                await crearConversacionInicial(datos.otroUsuarioId, datos.publicacionId, datos.publicacionTitulo);
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error al procesar conversación pendiente:', error);
    }
}

async function crearConversacionInicial(receptorId, publicacionId, publicacionTitulo) {
    console.log('Creando conversación inicial con:', { receptorId, publicacionId, publicacionTitulo });
    try {
        // Enviar un mensaje inicial para establecer la conversación
        const mensajeInicial = `Hola! Estoy interesado en tu servicio: "${publicacionTitulo}".`;
        
        const responseMsg = await fetch(`${API_BASE}/mensaje?accion=enviar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                emisor_id: usuarioActual.id,
                receptor_id: receptorId,
                publicacion_id: publicacionId,
                mensaje: mensajeInicial
            })
        });
        
        const resultado = await responseMsg.json();
        
        if (!resultado.success) {
            throw new Error(resultado.message || 'La API falló al crear la conversación');
        }
        
        console.log(' Conversación creada en el backend');
        
        // Recargar la lista de conversaciones para que incluya la nueva
        await cargarConversaciones();
        
        // Esperar un momento para que el DOM se actualice y luego abrir la nueva conversación
        setTimeout(() => {
            const nuevoElemento = document.querySelector(
                `.conversacion-item[data-publicacion-id="${publicacionId}"][data-otro-usuario-id="${receptorId}"]`
            );
            
            if (nuevoElemento) {
                console.log(' Abriendo la nueva conversación...');
                abrirConversacion(nuevoElemento);
            } else {
                console.error('No se encontró el elemento de la nueva conversación después de recargar.');
                mostrarError('No se pudo mostrar la nueva conversación. Refresca la página.');
            }
        }, 500);
        
    } catch (error) {
        console.error('Error al crear conversación inicial:', error);
        mostrarError('No se pudo iniciar la conversación. Por favor, intenta nuevamente.');
    }
}
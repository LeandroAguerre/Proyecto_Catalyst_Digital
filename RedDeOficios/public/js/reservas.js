console.log('reservas.js cargado');

// Función para obtener sesión actual
function obtenerSesion() {
  const usuarioId = sessionStorage.getItem('usuarioId');
  if (!usuarioId) return null;
  
  return {
    id: parseInt(usuarioId),
    tipoUsuario: parseInt(sessionStorage.getItem('tipoUsuario')),
    nombreCompleto: sessionStorage.getItem('nombreCompleto'),
    correoElectronico: sessionStorage.getItem('correoElectronico')
  };
}

// VALIDACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Validando acceso a reservas...');
  
  const sesion = obtenerSesion();
  
  if (!sesion) {
    console.log('❌ Usuario no autenticado');
    alert('Debes iniciar sesión para ver tus reservas');
    window.location.href = 'index.html';
    return;
  }
  
  console.log('✅ Usuario autorizado:', sesion);
  
  // Si es proveedor, mostrar el tab de reservas recibidas
  if (sesion.tipoUsuario === 2) {
    const tabContainer = document.getElementById('reservas-recibidas-tab-container');
    if (tabContainer) {
      tabContainer.style.display = 'block';
    }
  }
  
  // Cargar reservas
  cargarMisReservas();
  
  // Event listener para el tab de reservas recibidas
  const tabRecibidasBtn = document.getElementById('reservas-recibidas-tab');
  if (tabRecibidasBtn) {
    tabRecibidasBtn.addEventListener('shown.bs.tab', function() {
      cargarReservasRecibidas();
    });
  }
});

// Cargar mis reservas (como cliente)
async function cargarMisReservas() {
  const sesion = obtenerSesion();
  const loadingDiv = document.getElementById('loading-mis-reservas');
  const contenedor = document.getElementById('contenedor-mis-reservas');
  
  try {
    console.log('🔄 Cargando mis reservas...');
    
    const res = await fetch('/reserva?usuario_id=' + sesion.id + '&tipo=cliente', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) throw new Error('Error al cargar reservas');
    
    const reservas = await res.json();
    console.log('✅ Mis reservas:', reservas);
    
    loadingDiv.style.display = 'none';
    
    if (reservas.length === 0) {
      contenedor.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> No tienes reservas realizadas</div>';
      return;
    }
    
    mostrarReservas(reservas, contenedor, 'cliente');
    
  } catch (error) {
    console.error('Error:', error);
    loadingDiv.style.display = 'none';
    contenedor.innerHTML = '<div class="alert alert-danger">Error al cargar reservas</div>';
  }
}

// Cargar reservas recibidas (como proveedor)
async function cargarReservasRecibidas() {
  const sesion = obtenerSesion();
  const loadingDiv = document.getElementById('loading-reservas-recibidas');
  const contenedor = document.getElementById('contenedor-reservas-recibidas');
  
  // Si ya se cargó, no volver a cargar
  if (contenedor.innerHTML.trim() !== '') return;
  
  try {
    console.log('🔄 Cargando reservas recibidas...');
    
    const res = await fetch('/reserva?usuario_id=' + sesion.id + '&tipo=proveedor', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) throw new Error('Error al cargar reservas');
    
    const reservas = await res.json();
    console.log('✅ Reservas recibidas:', reservas);
    
    loadingDiv.style.display = 'none';
    
    if (reservas.length === 0) {
      contenedor.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> No tienes solicitudes de reserva</div>';
      return;
    }
    
    mostrarReservas(reservas, contenedor, 'proveedor');
    
  } catch (error) {
    console.error('Error:', error);
    loadingDiv.style.display = 'none';
    contenedor.innerHTML = '<div class="alert alert-danger">Error al cargar reservas</div>';
  }
}

// Mostrar reservas en tarjetas
function mostrarReservas(reservas, contenedor, tipo) {
  let html = '<div class="row">';
  
  reservas.forEach(function(reserva) {
    const inicio = new Date(reserva.fecha_hora_inicio);
    const fin = new Date(reserva.fecha_hora_fin);
    
    // Determinar color según estado
    let estadoClass = '';
    let estadoIcono = '';
    
    switch(reserva.estado) {
      case 'pendiente':
        estadoClass = 'bg-warning text-dark';
        estadoIcono = 'bi-clock-history';
        break;
      case 'confirmada':
        estadoClass = 'bg-success text-white';
        estadoIcono = 'bi-check-circle';
        break;
      case 'cancelada':
        estadoClass = 'bg-danger text-white';
        estadoIcono = 'bi-x-circle';
        break;
      case 'rechazada':
        estadoClass = 'bg-secondary text-white';
        estadoIcono = 'bi-x-octagon';
        break;
      case 'completada':
        estadoClass = 'bg-info text-white';
        estadoIcono = 'bi-check-all';
        break;
    }
    
    html += '<div class="col-md-6 col-lg-4 mb-3">';
    html += '<div class="card h-100">';
    
    // Imagen
    if (reserva.publicacion_imagen) {
      html += '<img src="' + reserva.publicacion_imagen + '" class="card-img-top" alt="Imagen" style="height: 200px; object-fit: cover;" onerror="this.src=\'imagenes/trabajador.jpg\'">';
    }
    
    html += '<div class="card-body">';
    html += '<h5 class="card-title">' + (reserva.publicacion_titulo || 'Servicio General') + '</h5>';
    
    // Mostrar cliente o proveedor según el tipo
    if (tipo === 'cliente') {
      html += '<p class="card-text"><strong><i class="bi bi-person"></i> Proveedor:</strong> ' + reserva.proveedor_nombre + '</p>';
    } else {
      html += '<p class="card-text"><strong><i class="bi bi-person"></i> Cliente:</strong> ' + reserva.cliente_nombre + '</p>';
    }
    
    html += '<p class="card-text"><strong><i class="bi bi-calendar"></i> Desde:</strong><br>' + inicio.toLocaleString('es-ES') + '</p>';
    html += '<p class="card-text"><strong><i class="bi bi-calendar"></i> Hasta:</strong><br>' + fin.toLocaleString('es-ES') + '</p>';
    
    // Estado
    html += '<div class="mb-2"><span class="badge ' + estadoClass + '"><i class="' + estadoIcono + '"></i> ' + reserva.estado.toUpperCase() + '</span></div>';
    
    // Notas del cliente
    if (reserva.notas_cliente) {
      html += '<p class="card-text"><small><strong>Notas:</strong> ' + reserva.notas_cliente + '</small></p>';
    }
    
    // Respuesta del proveedor
    if (reserva.respuesta_proveedor) {
      html += '<div class="alert alert-info p-2 mb-2"><small><strong>Respuesta proveedor:</strong> ' + reserva.respuesta_proveedor + '</small></div>';
    }
    
    // Motivo de cancelación/rechazo
    if (reserva.motivo_cancelacion) {
      html += '<div class="alert alert-danger p-2 mb-2"><small><strong>Motivo cancelación:</strong> ' + reserva.motivo_cancelacion + '</small></div>';
    }
    if (reserva.motivo_rechazo) {
      html += '<div class="alert alert-secondary p-2 mb-2"><small><strong>Motivo rechazo:</strong> ' + reserva.motivo_rechazo + '</small></div>';
    }
    
    html += '</div>';
    
    // 🆕 BOTONES DE ACCIÓN (INCLUYENDO CONTACTAR)
    html += '<div class="card-footer">';
    
    // 🆕 BOTÓN CONTACTAR (siempre visible para coordinar detalles)
    const otroUsuarioId = tipo === 'cliente' ? reserva.proveedor_id : reserva.cliente_id;
    const otroUsuarioNombre = tipo === 'cliente' ? reserva.proveedor_nombre : reserva.cliente_nombre;
    
    html += '<button class="btn btn-info btn-sm w-100 mb-2" onclick="contactarUsuario(' + reserva.publicacion_id + ', ' + otroUsuarioId + ', \'' + otroUsuarioNombre + '\', \'' + (reserva.publicacion_titulo || 'Servicio') + '\')">';
    html += '<i class="bi bi-chat-dots"></i> Contactar por Mensaje';
    html += '</button>';
    
    if (tipo === 'proveedor' && reserva.estado === 'pendiente') {
      // Botones para proveedor: Confirmar y Rechazar
      html += '<button class="btn btn-success btn-sm me-2" onclick="confirmarReserva(' + reserva.id + ')"><i class="bi bi-check-circle"></i> Confirmar</button>';
      html += '<button class="btn btn-secondary btn-sm" onclick="rechazarReserva(' + reserva.id + ')"><i class="bi bi-x-circle"></i> Rechazar</button>';
    }
    
    // Botón cancelar (disponible para ambos si está en estado pendiente o confirmada)
    if (reserva.estado === 'pendiente' || reserva.estado === 'confirmada') {
      // Verificar si se puede cancelar (24h antes)
      const ahora = new Date();
      const horasDiferencia = (inicio - ahora) / (1000 * 60 * 60);
      
      if (horasDiferencia >= 24) {
        html += '<button class="btn btn-danger btn-sm mt-2 w-100" onclick="cancelarReserva(' + reserva.id + ')"><i class="bi bi-trash"></i> Cancelar Reserva</button>';
      } else {
        html += '<small class="text-muted d-block mt-2">No se puede cancelar (menos de 24h)</small>';
      }
    }
    
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  contenedor.innerHTML = html;
}

// 🆕 FUNCIÓN PARA CONTACTAR AL USUARIO
function contactarUsuario(publicacionId, otroUsuarioId, otroUsuarioNombre, publicacionTitulo) {
  console.log('💬 Abriendo conversación con:', {
    publicacionId,
    otroUsuarioId,
    otroUsuarioNombre,
    publicacionTitulo
  });
  
  // Guardar datos en sessionStorage para mensajes.html
  sessionStorage.setItem('abrirConversacion', JSON.stringify({
    publicacionId: publicacionId,
    otroUsuarioId: otroUsuarioId,
    otroUsuarioNombre: otroUsuarioNombre,
    publicacionTitulo: publicacionTitulo
  }));
  
  // Redirigir a mensajes
  window.location.href = 'mensajes.html';
}

// Confirmar reserva (proveedor acepta)
async function confirmarReserva(reservaId) {
  const sesion = obtenerSesion();
  
  // Crear modal personalizado para pedir mensaje
  const modalHtml = `
    <div class="modal fade" id="modalConfirmarReserva" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title"><i class="bi bi-check-circle"></i> Confirmar Reserva</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Deseas confirmar esta reserva?</p>
            <label for="mensajeConfirmacion" class="form-label">Mensaje para el cliente (opcional):</label>
            <textarea id="mensajeConfirmacion" class="form-control" rows="3" placeholder="Ej: Perfecto, nos vemos en la fecha acordada..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-success" id="btnConfirmarReservaFinal">
              <i class="bi bi-check-circle"></i> Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Agregar modal al DOM si no existe
  if (!document.getElementById('modalConfirmarReserva')) {
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmarReserva'));
  modal.show();
  
  // Evento del botón confirmar
  document.getElementById('btnConfirmarReservaFinal').onclick = async function() {
    const respuesta = document.getElementById('mensajeConfirmacion').value;
    
    try {
      const res = await fetch('/reserva?accion=confirmar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          reserva_id: reservaId,
          proveedor_id: sesion.id,
          respuesta: respuesta || null
        })
      });
      
      const data = await res.json();
      
      modal.hide();
      
      if (data.success) {
        mostrarAlerta(data.message, 'success');
        // Recargar reservas
        setTimeout(() => {
          document.getElementById('contenedor-reservas-recibidas').innerHTML = '';
          cargarReservasRecibidas();
        }, 1500);
      } else {
        mostrarAlerta(data.message, 'error');
      }
      
    } catch (error) {
      console.error('Error:', error);
      modal.hide();
      mostrarAlerta('Error al confirmar la reserva', 'error');
    }
  };
}

// Rechazar reserva (proveedor rechaza)
async function rechazarReserva(reservaId) {
  const sesion = obtenerSesion();
  
  // Crear modal personalizado
  const modalHtml = `
    <div class="modal fade" id="modalRechazarReserva" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title"><i class="bi bi-x-circle"></i> Rechazar Reserva</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas rechazar esta reserva?</p>
            <label for="motivoRechazo" class="form-label">Motivo del rechazo*:</label>
            <textarea id="motivoRechazo" class="form-control" rows="3" placeholder="Ej: No estoy disponible en esa fecha..." required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-warning" id="btnRechazarReservaFinal">
              <i class="bi bi-x-circle"></i> Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  if (!document.getElementById('modalRechazarReserva')) {
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalRechazarReserva'));
  modal.show();
  
  document.getElementById('btnRechazarReservaFinal').onclick = async function() {
    const motivo = document.getElementById('motivoRechazo').value.trim();
    
    if (!motivo) {
      mostrarAlerta('Debes proporcionar un motivo para el rechazo', 'warning');
      return;
    }
    
    try {
      const res = await fetch('/reserva?accion=rechazar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          reserva_id: reservaId,
          proveedor_id: sesion.id,
          motivo: motivo
        })
      });
      
      const data = await res.json();
      
      modal.hide();
      
      if (data.success) {
        mostrarAlerta(data.message, 'success');
        setTimeout(() => {
          document.getElementById('contenedor-reservas-recibidas').innerHTML = '';
          cargarReservasRecibidas();
        }, 1500);
      } else {
        mostrarAlerta(data.message, 'error');
      }
      
    } catch (error) {
      console.error('Error:', error);
      modal.hide();
      mostrarAlerta('Error al rechazar la reserva', 'error');
    }
  };
}

// Cancelar reserva
async function cancelarReserva(reservaId) {
  const sesion = obtenerSesion();
  
  // Crear modal personalizado
  const modalHtml = `
    <div class="modal fade" id="modalCancelarReserva" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title"><i class="bi bi-trash"></i> Cancelar Reserva</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas cancelar esta reserva?</p>
            <label for="motivoCancelacion" class="form-label">Motivo de la cancelación (opcional):</label>
            <textarea id="motivoCancelacion" class="form-control" rows="3" placeholder="Ej: Surgió un imprevisto..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No cancelar</button>
            <button type="button" class="btn btn-danger" id="btnCancelarReservaFinal">
              <i class="bi bi-trash"></i> Sí, cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  if (!document.getElementById('modalCancelarReserva')) {
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalCancelarReserva'));
  modal.show();
  
  document.getElementById('btnCancelarReservaFinal').onclick = async function() {
    const motivo = document.getElementById('motivoCancelacion').value.trim();
    
    try {
      const res = await fetch('/reserva?accion=cancelar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          reserva_id: reservaId,
          usuario_id: sesion.id,
          motivo: motivo || null
        })
      });
      
      const data = await res.json();
      
      modal.hide();
      
      if (data.success) {
        mostrarAlerta(data.message, 'success');
        // Recargar ambas vistas
        setTimeout(() => {
          document.getElementById('contenedor-mis-reservas').innerHTML = '';
          document.getElementById('contenedor-reservas-recibidas').innerHTML = '';
          cargarMisReservas();
          if (sesion.tipoUsuario === 2) {
            cargarReservasRecibidas();
          }
        }, 1500);
      } else {
        mostrarAlerta(data.message, 'error');
      }
      
    } catch (error) {
      console.error('Error:', error);
      modal.hide();
      mostrarAlerta('Error al cancelar la reserva', 'error');
    }
  };
}

// Función para mostrar alertas con modal (helper)
function mostrarAlerta(mensaje, tipo = 'info') {
  if (typeof window.mostrarAlerta === 'function') {
    window.mostrarAlerta(mensaje, tipo);
  } else {
    alert(mensaje);
  }
}
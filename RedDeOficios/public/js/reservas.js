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
    
    // Botones de acción
    html += '<div class="card-footer">';
    
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

// Confirmar reserva (proveedor acepta)
async function confirmarReserva(reservaId) {
  const sesion = obtenerSesion();
  
  const respuesta = prompt('Mensaje de confirmación (opcional):');
  if (respuesta === null) return; // Usuario canceló
  
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
    
    if (data.success) {
      alert('✅ ' + data.message);
      // Recargar reservas
      document.getElementById('contenedor-reservas-recibidas').innerHTML = '';
      cargarReservasRecibidas();
    } else {
      alert('❌ ' + data.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al confirmar la reserva');
  }
}

// Rechazar reserva (proveedor rechaza)
async function rechazarReserva(reservaId) {
  const sesion = obtenerSesion();
  
  const motivo = prompt('Motivo del rechazo:');
  if (!motivo) {
    alert('Debes proporcionar un motivo');
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
    
    if (data.success) {
      alert('✅ ' + data.message);
      // Recargar reservas
      document.getElementById('contenedor-reservas-recibidas').innerHTML = '';
      cargarReservasRecibidas();
    } else {
      alert('❌ ' + data.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al rechazar la reserva');
  }
}

// Cancelar reserva
async function cancelarReserva(reservaId) {
  const sesion = obtenerSesion();
  
  if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
    return;
  }
  
  const motivo = prompt('Motivo de la cancelación (opcional):');
  if (motivo === null) return; // Usuario canceló
  
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
    
    if (data.success) {
      alert('✅ ' + data.message);
      // Recargar ambas vistas
      document.getElementById('contenedor-mis-reservas').innerHTML = '';
      document.getElementById('contenedor-reservas-recibidas').innerHTML = '';
      cargarMisReservas();
      if (sesion.tipoUsuario === 2) {
        cargarReservasRecibidas();
      }
    } else {
      alert('❌ ' + data.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cancelar la reserva');
  }
}
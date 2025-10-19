console.log('publicacion.js cargado');

// Obtener el ID de la URL
function obtenerIdDeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Cargar datos de la publicación
async function cargarPublicacion() {
  const id = obtenerIdDeURL();
  
  console.log('📋 ID de publicación:', id);
  
  if (!id) {
    console.error('❌ No se proporcionó ID en la URL');
    mostrarError('No se especificó qué publicación mostrar');
    return;
  }

  try {
    console.log('🔄 Cargando publicación...');
    
    const res = await fetch('/publicacion?id=' + id, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('📨 Status respuesta:', res.status);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Publicación no encontrada');
      }
      throw new Error('Error al cargar la publicación');
    }

    const publicacion = await res.json();
    console.log('✅ Publicación cargada:', publicacion);

    // Rellenar datos en el HTML
    rellenarDatos(publicacion);

  } catch (error) {
    console.error('💥 Error:', error);
    mostrarError(error.message);
  }
}

// Rellenar datos en el HTML
function rellenarDatos(pub) {
  // Ocultar loading y mostrar contenido
  const loadingContainer = document.getElementById('loading-container');
  const publicacionContainer = document.getElementById('publicacion-container');
  
  if (loadingContainer) loadingContainer.style.display = 'none';
  if (publicacionContainer) publicacionContainer.style.display = 'block';

  // Título
  const titulo = document.getElementById('titulo-publicacion');
  if (titulo) titulo.textContent = pub.titulo || 'Sin título';

  // Tipo de servicio
  const tipoServicio = document.getElementById('tipo-servicio');
  if (tipoServicio) tipoServicio.textContent = pub.tipo_servicio || 'No especificado';

  // Ubicación
  const ubicacion = document.getElementById('ubicacion');
  if (ubicacion) ubicacion.textContent = pub.ubicacion || 'No especificada';

  // Teléfono
  const telefono = document.getElementById('telefono');
  if (telefono) {
    telefono.textContent = pub.telefono || 'No disponible';
    if (pub.telefono) {
      telefono.href = 'tel:' + pub.telefono;
    }
  }

  // Descripción
  const descripcion = document.getElementById('descripcion');
  if (descripcion) descripcion.textContent = pub.descripcion || 'Sin descripción';

  // Horario de trabajo
  const horarioTrabajo = document.getElementById('horario-trabajo');
  if (horarioTrabajo && pub.hora_inicio && pub.hora_fin) {
    horarioTrabajo.textContent = pub.hora_inicio.substring(0, 5) + ' a ' + pub.hora_fin.substring(0, 5);
  }

  // Horas mínimas
  const horasMinimas = document.getElementById('horas-minimas');
  if (horasMinimas && pub.horas_minimas) {
    const horas = parseFloat(pub.horas_minimas);
    if (horas === 0.5) {
      horasMinimas.textContent = '30 minutos';
    } else if (horas === 1) {
      horasMinimas.textContent = '1 hora';
    } else if (horas === 1.5) {
      horasMinimas.textContent = '1 hora y media';
    } else if (horas >= 8) {
      horasMinimas.textContent = 'Jornada completa (' + horas + ' horas)';
    } else {
      horasMinimas.textContent = horas + ' horas';
    }
  }

  // Nombre del proveedor
  const nombreProveedor = document.getElementById('nombre-proveedor');
  if (nombreProveedor) {
    nombreProveedor.textContent = pub.nombre_proveedor || 'Proveedor anónimo';
  }

  // Imagen principal
  const imagen = document.getElementById('imagen-publicacion');
  if (imagen) {
    const imagenPrincipal = pub.imagenes && pub.imagenes.length > 0 
      ? pub.imagenes.find(img => img.es_principal == 1) || pub.imagenes[0]
      : null;
    
    if (imagenPrincipal) {
      imagen.src = imagenPrincipal.ruta_imagen;
      imagen.alt = pub.titulo;
      imagen.onerror = function() {
        this.src = 'imagenes/trabajador.jpg';
      };
    } else {
      imagen.src = 'imagenes/trabajador.jpg';
      imagen.alt = 'Imagen no disponible';
    }
  }

  // Galería de imágenes
  const galeria = document.getElementById('galeria');
  if (galeria && pub.imagenes && pub.imagenes.length > 0) {
    galeria.innerHTML = '';
    pub.imagenes.forEach(function(img) {
      const col = document.createElement('div');
      col.className = 'col-md-4 col-6 mb-3';
      col.innerHTML = '<img src="' + img.ruta_imagen + '" class="img-fluid rounded shadow-sm" alt="Imagen de la publicación" onerror="this.src=\'imagenes/trabajador.jpg\'">';
      galeria.appendChild(col);
    });
  } else if (galeria) {
    galeria.innerHTML = '<div class="col-12"><p class="text-muted">No hay imágenes disponibles</p></div>';
  }

  // Fecha de creación
  const fechaCreacion = document.getElementById('fecha-creacion');
  if (fechaCreacion && pub.fecha_creacion) {
    const fecha = new Date(pub.fecha_creacion);
    fechaCreacion.textContent = 'Publicado el ' + fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Guardar IDs y datos ocultos para el modal
  const proveedorIdInput = document.getElementById('proveedor-id');
  if (proveedorIdInput) proveedorIdInput.value = pub.usuario_creador_id || '';

  const publicacionIdInput = document.getElementById('publicacion-id-hidden');
  if (publicacionIdInput) publicacionIdInput.value = pub.id || '';

  const horaInicioInput = document.getElementById('hora-inicio-proveedor');
  if (horaInicioInput) horaInicioInput.value = pub.hora_inicio || '09:00:00';

  const horaFinInput = document.getElementById('hora-fin-proveedor');
  if (horaFinInput) horaFinInput.value = pub.hora_fin || '18:00:00';

  const horasMinimasInput = document.getElementById('horas-minimas-proveedor');
  if (horasMinimasInput) horasMinimasInput.value = pub.horas_minimas || '1';

  // Verificar si el usuario logueado es el dueño de la publicación
  const sesionActual = obtenerSesion();
  const btnReservar = document.getElementById('btnReservar');
  
  if (sesionActual && btnReservar) {
    if (sesionActual.id === pub.usuario_creador_id) {
      // Es el dueño, ocultar botón y mostrar mensaje
      btnReservar.style.display = 'none';
      
      const mensajePropio = document.createElement('div');
      mensajePropio.className = 'alert alert-info mt-3';
      mensajePropio.innerHTML = '<i class="bi bi-info-circle"></i> Esta es tu publicación. No puedes reservar tus propios servicios.';
      btnReservar.parentElement.appendChild(mensajePropio);
    } else {
      btnReservar.style.display = 'inline-block';
    }
  }

  console.log('✅ Datos rellenados en el HTML');
}

// Función auxiliar para obtener sesión
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

// Mostrar mensaje de error
function mostrarError(mensaje) {
  const loadingContainer = document.getElementById('loading-container');
  const publicacionContainer = document.getElementById('publicacion-container');
  const errorContainer = document.getElementById('error-container');
  const errorMensaje = document.getElementById('error-mensaje');
  
  if (loadingContainer) loadingContainer.style.display = 'none';
  if (publicacionContainer) publicacionContainer.style.display = 'none';
  if (errorContainer) errorContainer.style.display = 'block';
  if (errorMensaje) errorMensaje.textContent = mensaje;
}

// Cargar al iniciar la página
document.addEventListener('DOMContentLoaded', cargarPublicacion);

// ========================================
// SISTEMA DE RESERVAS CON CALENDARIO
// ========================================

// Variables globales del calendario
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let fechasOcupadasProveedor = [];
let fechaInicioSeleccionada = null;
let fechaFinSeleccionada = null;

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

// Evento: Al abrir el modal de reserva
document.getElementById('modalReserva').addEventListener('show.bs.modal', function() {
  console.log('📅 Abriendo modal de reserva');
  
  // Verificar que el usuario esté logueado
  const sesion = obtenerSesion();
  if (!sesion) {
    alert('Debes iniciar sesión para hacer una reserva');
    const modal = bootstrap.Modal.getInstance(this);
    modal.hide();
    return;
  }

  // Resetear selección
  fechaInicioSeleccionada = null;
  fechaFinSeleccionada = null;
  document.getElementById('infoSeleccion').style.display = 'none';

  // Cargar calendario
  cargarCalendarioReservas();
});

// Controles de navegación del calendario
document.getElementById('mesAnterior').addEventListener('click', function() {
  mesActual--;
  if (mesActual < 0) {
    mesActual = 11;
    anioActual--;
  }
  cargarCalendarioReservas();
});

document.getElementById('mesSiguiente').addEventListener('click', function() {
  mesActual++;
  if (mesActual > 11) {
    mesActual = 0;
    anioActual++;
  }
  cargarCalendarioReservas();
});

// Cargar fechas ocupadas del proveedor y renderizar calendario
async function cargarCalendarioReservas() {
  const proveedorId = document.getElementById('proveedor-id').value;
  
  if (!proveedorId) {
    console.error('No hay ID de proveedor');
    return;
  }

  try {
    const res = await fetch('/reserva?fechas_ocupadas=true&proveedor_id=' + proveedorId + '&mes=' + (mesActual + 1) + '&anio=' + anioActual, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error('Error al cargar fechas ocupadas');

    fechasOcupadasProveedor = await res.json();
    console.log('📅 Fechas ocupadas cargadas:', fechasOcupadasProveedor);

    renderizarCalendario();

  } catch (error) {
    console.error('Error al cargar calendario:', error);
    document.getElementById('calendarioGrid').innerHTML = '<div class="alert alert-danger">Error al cargar el calendario</div>';
  }
}

// Renderizar el calendario
function renderizarCalendario() {
  const grid = document.getElementById('calendarioGrid');
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Actualizar título
  document.getElementById('mesAnioActual').textContent = nombresMeses[mesActual] + ' ' + anioActual;

  // Limpiar grid
  grid.innerHTML = '';

  // Agregar nombres de días
  nombresDias.forEach(function(dia) {
    const diaDiv = document.createElement('div');
    diaDiv.className = 'calendario-dia-nombre';
    diaDiv.textContent = dia;
    grid.appendChild(diaDiv);
  });

  // Calcular días del mes
  const primerDia = new Date(anioActual, mesActual, 1);
  const ultimoDia = new Date(anioActual, mesActual + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const primerDiaSemana = primerDia.getDay();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Días vacíos antes del primer día del mes
  for (let i = 0; i < primerDiaSemana; i++) {
    const diaVacio = document.createElement('div');
    diaVacio.className = 'calendario-dia dia-vacio';
    grid.appendChild(diaVacio);
  }

  // Días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaActual = new Date(anioActual, mesActual, dia);
    fechaActual.setHours(0, 0, 0, 0);

    const diaDiv = document.createElement('div');
    diaDiv.className = 'calendario-dia';
    diaDiv.textContent = dia;
    diaDiv.dataset.fecha = formatearFecha(fechaActual);

    // Determinar estado del día
    if (fechaActual < hoy) {
      diaDiv.classList.add('dia-pasado');
    } else if (esDiaOcupado(fechaActual)) {
      diaDiv.classList.add('dia-ocupado');
    } else {
      diaDiv.classList.add('dia-disponible');
      diaDiv.addEventListener('click', function() {
        seleccionarDia(fechaActual, diaDiv);
      });
    }

    // Marcar hoy
    if (fechaActual.getTime() === hoy.getTime()) {
      diaDiv.classList.add('dia-hoy');
    }

    // Marcar días seleccionados
    if (fechaInicioSeleccionada && fechaActual.getTime() === fechaInicioSeleccionada.getTime()) {
      diaDiv.classList.add('dia-seleccionado');
    }
    if (fechaFinSeleccionada && fechaActual.getTime() === fechaFinSeleccionada.getTime()) {
      diaDiv.classList.add('dia-seleccionado');
    }

    // Marcar rango de días seleccionados
    if (fechaInicioSeleccionada && fechaFinSeleccionada) {
      if (fechaActual > fechaInicioSeleccionada && fechaActual < fechaFinSeleccionada) {
        diaDiv.classList.add('dia-rango-seleccion');
      }
    }

    grid.appendChild(diaDiv);
  }
}

// Verificar si un día está ocupado
function esDiaOcupado(fecha) {
  return fechasOcupadasProveedor.some(function(reserva) {
    const inicio = new Date(reserva.fecha_hora_inicio);
    const fin = new Date(reserva.fecha_hora_fin);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);
    
    return fecha >= inicio && fecha <= fin;
  });
}

// Seleccionar un día en el calendario
function seleccionarDia(fecha, elemento) {
  console.log('📅 Día seleccionado:', fecha);

  // Si no hay fecha de inicio, establecerla
  if (!fechaInicioSeleccionada) {
    fechaInicioSeleccionada = fecha;
    fechaFinSeleccionada = null;
  } 
  // Si ya hay fecha de inicio pero no de fin
  else if (!fechaFinSeleccionada) {
    // Si la nueva fecha es anterior a la de inicio, intercambiarlas
    if (fecha < fechaInicioSeleccionada) {
      fechaFinSeleccionada = fechaInicioSeleccionada;
      fechaInicioSeleccionada = fecha;
    } else {
      fechaFinSeleccionada = fecha;
    }
  }
  // Si ya hay ambas fechas, resetear y empezar de nuevo
  else {
    fechaInicioSeleccionada = fecha;
    fechaFinSeleccionada = null;
  }

  // Actualizar campos del formulario
  if (fechaInicioSeleccionada) {
    document.getElementById('fechaInicio').value = formatearFecha(fechaInicioSeleccionada);
  }
  if (fechaFinSeleccionada) {
    document.getElementById('fechaFin').value = formatearFecha(fechaFinSeleccionada);
  } else {
    document.getElementById('fechaFin').value = '';
  }

  // Mostrar información de selección
  actualizarInfoSeleccion();

  // Re-renderizar calendario para actualizar estilos
  renderizarCalendario();
}

// Actualizar información de selección
function actualizarInfoSeleccion() {
  const infoDiv = document.getElementById('infoSeleccion');
  const textoDiv = document.getElementById('textoSeleccion');

  if (fechaInicioSeleccionada) {
    infoDiv.style.display = 'block';
    
    let texto = '<strong>Inicio:</strong> ' + fechaInicioSeleccionada.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (fechaFinSeleccionada) {
      texto += '<br><strong>Fin:</strong> ' + fechaFinSeleccionada.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const dias = Math.ceil((fechaFinSeleccionada - fechaInicioSeleccionada) / (1000 * 60 * 60 * 24)) + 1;
      texto += '<br><strong>Duración:</strong> ' + dias + ' día(s)';
    } else {
      texto += '<br><small class="text-muted">Selecciona la fecha de fin</small>';
    }

    textoDiv.innerHTML = texto;
  } else {
    infoDiv.style.display = 'none';
  }
}

// Formatear fecha a YYYY-MM-DD
function formatearFecha(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return año + '-' + mes + '-' + dia;
}

// Evento: Enviar formulario de reserva
document.getElementById('formReserva').addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log('📤 Enviando solicitud de reserva');

  const sesion = obtenerSesion();
  if (!sesion) {
    alert('Debes iniciar sesión');
    return;
  }

  const estadoReserva = document.getElementById('estadoReserva');
  const proveedorId = document.getElementById('proveedor-id').value;
  const publicacionId = document.getElementById('publicacion-id-hidden').value;
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const horaInicio = document.getElementById('horaInicio').value;
  const horaFin = document.getElementById('horaFin').value;
  const notasCliente = document.getElementById('notasCliente').value;

  // Obtener horarios del proveedor
  const horaInicioProveedor = document.getElementById('hora-inicio-proveedor').value || '09:00:00';
  const horaFinProveedor = document.getElementById('hora-fin-proveedor').value || '18:00:00';
  const horasMinimasProveedor = parseFloat(document.getElementById('horas-minimas-proveedor').value || 1);

  // Validaciones básicas
  if (!fechaInicio || !fechaFin || !horaInicio || !horaFin) {
    estadoReserva.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> Debes seleccionar fechas y horas de inicio y fin</div>';
    return;
  }

  const fechaHoraInicio = fechaInicio + ' ' + horaInicio + ':00';
  const fechaHoraFin = fechaFin + ' ' + horaFin + ':00';

  const inicio = new Date(fechaHoraInicio.replace(' ', 'T'));
  const fin = new Date(fechaHoraFin.replace(' ', 'T'));

  if (fin <= inicio) {
    estadoReserva.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> La fecha/hora de fin debe ser posterior a la de inicio</div>';
    return;
  }

  // VALIDAR HORARIOS DEL PROVEEDOR
  const horaInicioSolo = horaInicio + ':00';
  const horaFinSolo = horaFin + ':00';
  
  if (horaInicioSolo < horaInicioProveedor || horaFinSolo > horaFinProveedor) {
    estadoReserva.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> El horario seleccionado está fuera del horario de trabajo del proveedor (' + horaInicioProveedor.substring(0,5) + ' a ' + horaFinProveedor.substring(0,5) + ')</div>';
    return;
  }

  // VALIDAR HORAS MÍNIMAS
  const diferenciaMs = fin - inicio;
  const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
  
  if (diferenciaHoras < horasMinimasProveedor) {
    estadoReserva.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> La reserva debe ser de al menos ' + horasMinimasProveedor + ' hora(s). Actualmente: ' + diferenciaHoras.toFixed(2) + ' hora(s)</div>';
    return;
  }

  estadoReserva.innerHTML = '<div class="alert alert-info"><div class="spinner-border spinner-border-sm me-2"></div>Enviando solicitud...</div>';

  try {
    const res = await fetch('/reserva', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        cliente_id: sesion.id,
        proveedor_id: parseInt(proveedorId),
        publicacion_id: parseInt(publicacionId),
        fecha_hora_inicio: fechaHoraInicio,
        fecha_hora_fin: fechaHoraFin,
        notas_cliente: notasCliente || null
      })
    });

    const data = await res.json();
    console.log('📦 Respuesta reserva:', data);

    if (data.success) {
      estadoReserva.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle"></i> ' + data.message + '</div>';
      
      // Limpiar formulario y selección
      document.getElementById('formReserva').reset();
      fechaInicioSeleccionada = null;
      fechaFinSeleccionada = null;
      document.getElementById('infoSeleccion').style.display = 'none';
      
      // Recargar calendario
      setTimeout(function() {
        cargarCalendarioReservas();
      }, 1000);

    } else {
      estadoReserva.innerHTML = '<div class="alert alert-danger"><i class="bi bi-x-circle"></i> ' + data.message + '</div>';
    }

  } catch (error) {
    console.error('Error:', error);
    estadoReserva.innerHTML = '<div class="alert alert-danger"><i class="bi bi-x-circle"></i> Error de conexión con el servidor</div>';
  }
});
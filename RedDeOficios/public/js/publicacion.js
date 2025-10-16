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

  // Fechas de disponibilidad
  const fechaInicio = document.getElementById('fecha-inicio');
  if (fechaInicio && pub.fecha_inicio) {
    const fecha = new Date(pub.fecha_inicio);
    fechaInicio.textContent = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const fechaFin = document.getElementById('fecha-fin');
  if (fechaFin && pub.fecha_fin) {
    const fecha = new Date(pub.fecha_fin);
    fechaFin.textContent = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Nombre del proveedor
  const nombreProveedor = document.getElementById('nombre-proveedor');
  if (nombreProveedor) {
    nombreProveedor.textContent = pub.nombre_proveedor || 'Proveedor anónimo';
  }

  // Imagen
  const imagen = document.getElementById('imagen-publicacion');
  if (imagen) {
    if (pub.imagen) {
      imagen.src = pub.imagen;
      imagen.alt = pub.titulo;
      imagen.onerror = function() {
        this.src = 'imagenes/trabajador.jpg';
      };
    } else {
      imagen.src = 'imagenes/trabajador.jpg';
      imagen.alt = 'Imagen no disponible';
    }
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

  console.log('✅ Datos rellenados en el HTML');
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
  const container = document.querySelector('.container') || document.body;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger';
  errorDiv.style.margin = '20px';
  errorDiv.innerHTML = '<h4>❌ Error</h4><p>' + mensaje + '</p><a href="index.html" class="btn btn-primary">Volver al inicio</a>';
  
  container.innerHTML = '';
  container.appendChild(errorDiv);
}

// Cargar al iniciar la página
document.addEventListener('DOMContentLoaded', cargarPublicacion);
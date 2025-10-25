console.log('crear_publicacion.js cargado');

// Función para mostrar alertas con modal
function mostrarAlerta(mensaje, tipo = 'info', titulo = null) {
  const modal = new bootstrap.Modal(document.getElementById('modalAlerta'));
  const header = document.getElementById('modalAlertaHeader');
  const icono = document.getElementById('modalAlertaIcono');
  const tituloTexto = document.getElementById('modalAlertaTituloTexto');
  const mensajeEl = document.getElementById('modalAlertaMensaje');
  
  const configs = {
    'success': {
      headerClass: 'bg-success text-white',
      icono: 'bi-check-circle-fill',
      titulo: 'Éxito'
    },
    'error': {
      headerClass: 'bg-danger text-white',
      icono: 'bi-x-circle-fill',
      titulo: 'Error'
    },
    'warning': {
      headerClass: 'bg-warning text-dark',
      icono: 'bi-exclamation-triangle-fill',
      titulo: 'Advertencia'
    },
    'info': {
      headerClass: 'bg-info text-white',
      icono: 'bi-info-circle-fill',
      titulo: 'Información'
    }
  };
  
  const config = configs[tipo] || configs['info'];
  
  header.className = 'modal-header ' + config.headerClass;
  icono.className = 'bi ' + config.icono + ' me-2';
  tituloTexto.textContent = titulo || config.titulo;
  mensajeEl.textContent = mensaje;
  
  modal.show();
}

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
  console.log(' Validando permisos de acceso...');
  
  const sesion = obtenerSesion();
  
  if (!sesion) {
    console.log(' Usuario no autenticado');
    mostrarAlerta('Debes iniciar sesión para crear publicaciones', 'warning');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }
  
  if (sesion.tipoUsuario !== 2) {
    console.log(' Usuario no es proveedor');
    mostrarAlerta('Solo los proveedores pueden crear publicaciones', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }
  
  console.log(' Usuario autorizado:', sesion);
});

// Preview de imágenes
document.getElementById('inputImagenes').addEventListener('change', function(e) {
  const previewContainer = document.getElementById('previewImagenes');
  previewContainer.innerHTML = '';
  
  const files = e.target.files;
  
  // Filter out non-image files and collect valid ones
  const validFiles = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      validFiles.push(file);
    } else {
      mostrarAlerta(`El archivo '${file.name}' no es una imagen válida y será ignorado.`, 'warning');
    }
  }

  if (validFiles.length === 0 && files.length > 0) {
    // If all selected files were invalid, clear the input and return
    e.target.value = '';
    return;
  }

  if (validFiles.length > 5) {
    mostrarAlerta('Solo puedes subir un máximo de 5 imágenes válidas', 'warning');
    e.target.value = ''; // Clear the input
    previewContainer.innerHTML = ''; // Clear any previews that might have been there
    return;
  }
  
  Array.from(validFiles).forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const col = document.createElement('div');
      col.className = 'col-md-2 col-4 mb-3';
      
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${event.target.result}" class="card-img-top" alt="Preview">
        <div class="card-body p-2">
          <small class="text-muted">${index === 0 ? '★ Principal' : 'Imagen ' + (index + 1)}</small>
        </div>
      `;
      
      col.appendChild(card);
      previewContainer.appendChild(col);
    };
    
    reader.readAsDataURL(file);
  });
});

// MANEJO DEL FORMULARIO
document.getElementById('formPublicacion').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  console.log(' Enviando formulario de publicación...');

  const sesion = obtenerSesion();
  
  if (!sesion || sesion.tipoUsuario !== 2) {
    mostrarAlerta('Error de autenticación. Por favor inicia sesión nuevamente.', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }

  const formData = new FormData(e.target);
  
  // Agregar el ID del usuario creador
  formData.append('usuario_creador_id', sesion.id);

  // Validar horarios
  const horaInicio = formData.get('hora_inicio');
  const horaFin = formData.get('hora_fin');
  
  if (horaInicio >= horaFin) {
    mostrarAlerta('La hora de fin debe ser posterior a la hora de inicio', 'warning');
    return;
  }

  // Validar imágenes
  const imagenes = formData.getAll('imagenes[]');
  const imagenesValidas = imagenes.filter(img => img.size > 0);
  
  if (imagenesValidas.length === 0) {
    mostrarAlerta('Debes subir al menos una imagen', 'warning');
    return;
  }

  // Validar tamaño de imágenes (máximo 5MB cada una)
  for (let img of imagenesValidas) {
    if (img.size > 5 * 1024 * 1024) {
      mostrarAlerta('Cada imagen debe pesar menos de 5MB', 'warning');
      return;
    }
  }

  // Mostrar loading
  const btnSubmit = e.target.querySelector('button[type="submit"]');
  const btnText = btnSubmit.innerHTML;
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Publicando...';

  try {
    const response = await fetch('/publicacion', {
      method: 'POST',
      body: formData
    });

    const text = await response.text();
    console.log(' Respuesta del servidor (raw):', text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      mostrarAlerta('Error: la respuesta del servidor no es JSON válido.', 'error');
      console.error(' Error parseando JSON:', err);
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = btnText;
      return;
    }

    if (result.success) {
      mostrarAlerta(result.message, 'success');
      
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = btnText;
      setTimeout(() => {
        window.location.href = `publicacion.html?id=${result.publicacion_id}`;
      }, 2000);
    } else {
      mostrarAlerta(result.message, 'error');
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = btnText;
    }

  } catch (error) {
    console.error(' Error en la solicitud:', error);
    mostrarAlerta('Error de conexión con el servidor: ' + error.message, 'error');
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = btnText;
  }
});
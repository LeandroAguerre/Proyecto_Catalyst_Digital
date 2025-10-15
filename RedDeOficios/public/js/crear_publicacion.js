console.log('crear_publicacion.js cargado');

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
  console.log('🔍 Validando permisos de acceso...');
  
  const sesion = obtenerSesion();
  
  // Si no hay sesión, redirigir al inicio
  if (!sesion) {
    console.log('❌ Usuario no autenticado, redirigiendo...');
    alert('Debes iniciar sesión para crear publicaciones');
    window.location.href = 'index.html';
    return;
  }
  
  // Si no es proveedor (tipo 2), redirigir
  if (sesion.tipoUsuario !== 2) {
    console.log('❌ Usuario no es proveedor, redirigiendo...');
    alert('Solo los proveedores pueden crear publicaciones');
    window.location.href = 'index.html';
    return;
  }
  
  console.log('✅ Usuario autorizado:', sesion);
});

// MANEJO DEL FORMULARIO
document.getElementById('formPublicacion').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  console.log('📤 Enviando formulario de publicación...');

  const sesion = obtenerSesion();
  
  // Doble verificación de seguridad
  if (!sesion || sesion.tipoUsuario !== 2) {
    alert('Error de autenticación. Por favor inicia sesión nuevamente.');
    window.location.href = 'index.html';
    return;
  }

  const formData = new FormData(e.target);
  
  // Agregar el ID del usuario creador
  formData.append('usuario_creador_id', sesion.id);

  // Debug: Mostrar qué datos se están enviando
  console.log('📤 Datos a enviar:');
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  try {
    const response = await fetch('/publicacion', {
      method: 'POST',
      body: formData
    });

    console.log('📨 Status respuesta:', response.status);

    // Verificar respuesta
    const text = await response.text();
    console.log('📩 Respuesta del servidor (raw):', text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error('❌ Error parseando JSON:', err);
      alert('Error: la respuesta del servidor no es JSON válido.');
      return;
    }

    console.log('✅ Respuesta parseada:', result);

    alert(result.message);
    
    if (result.success) {
      console.log('✅ Publicación creada exitosamente');
      window.location.href = 'index.html';
    }

  } catch (error) {
    console.error('🚨 Error en la solicitud:', error);
    alert('Error de conexión con el servidor: ' + error.message);
  }
});
console.log('script.js cargado correctamente');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado, iniciando script');
  
  const estadoRegistro = document.getElementById('estadoRegistro');
  const estadoLogin = document.getElementById('estadoLogin');
  const username = document.getElementById('username');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const authButtons = document.querySelector('.auth-buttons');
  const formRegistro = document.getElementById('formRegistro');
  const formLogin = document.getElementById('formLogin');
  const btnSalir = document.getElementById('btnSalir');

  // Función para guardar sesión del usuario
  function guardarSesion(usuario) {
    console.log('💾 Guardando sesión:', usuario);
    sessionStorage.setItem('usuarioId', usuario.id);
    sessionStorage.setItem('tipoUsuario', usuario.tipoUsuario);
    sessionStorage.setItem('nombreCompleto', usuario.nombreCompleto);
    sessionStorage.setItem('correoElectronico', usuario.correoElectronico);
  }

  // Función para limpiar sesión
  function limpiarSesion() {
    console.log('🗑️ Limpiando sesión');
    sessionStorage.removeItem('usuarioId');
    sessionStorage.removeItem('tipoUsuario');
    sessionStorage.removeItem('nombreCompleto');
    sessionStorage.removeItem('correoElectronico');
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

  // Hacer disponible globalmente para mensajes.js
  window.obtenerSesion = obtenerSesion;

  // Función para actualizar visibilidad del botón Publicar
  function actualizarBotonPublicar(tipoUsuario) {
    let btnPublicar = document.getElementById('btnPublicar');
    
    // Si no existe, crearlo
    if (!btnPublicar) {
      const nav = document.querySelector('.navigation ul');
      if (nav) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="crear_publicacion.html" id="btnPublicar" class="btn nav-btn">Publicar</a>';
        nav.appendChild(li);
        btnPublicar = document.getElementById('btnPublicar');
      }
    }
    
    // Mostrar u ocultar según tipo de usuario
    if (btnPublicar) {
      if (tipoUsuario === 2) {
        btnPublicar.parentElement.style.display = 'list-item';
        console.log('✅ Botón Publicar visible (usuario proveedor)');
      } else {
        btnPublicar.parentElement.style.display = 'none';
        console.log('🚫 Botón Publicar oculto (usuario no es proveedor)');
      }
    }
  }

  // Función para actualizar visibilidad del botón Reservas
  function actualizarBotonReservas(estaLogueado) {
    let btnReservas = document.getElementById('btnReservas');
    
    // Si no existe, crearlo
    if (!btnReservas) {
      const nav = document.querySelector('.navigation ul');
      if (nav) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="reservas.html" id="btnReservas" class="btn nav-btn"><i class="bi bi-calendar-check"></i> Reservas</a>';
        nav.appendChild(li);
        btnReservas = document.getElementById('btnReservas');
      }
    }
    
    // Mostrar u ocultar según si está logueado
    if (btnReservas) {
      if (estaLogueado) {
        btnReservas.parentElement.style.display = 'list-item';
        console.log('✅ Botón Reservas visible (usuario logueado)');
      } else {
        btnReservas.parentElement.style.display = 'none';
        console.log('🚫 Botón Reservas oculto (usuario no logueado)');
      }
    }
  }

  // Función para actualizar visibilidad del botón Mensajes
  function actualizarBotonMensajes(estaLogueado) {
    let btnMensajes = document.getElementById('btnMensajes');
    
    // Si no existe, crearlo
    if (!btnMensajes) {
      const nav = document.querySelector('.navigation ul');
      if (nav) {
        const li = document.createElement('li');
        li.innerHTML = `
          <a href="mensajes.html" id="btnMensajes" class="btn nav-btn position-relative">
            <i class="bi bi-chat-dots"></i> Mensajes
            <span id="mensajesNoLeidos" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display: none;">
              0
            </span>
          </a>
        `;
        nav.appendChild(li);
        btnMensajes = document.getElementById('btnMensajes');
      }
    }
    
    // Mostrar u ocultar según si está logueado
    if (btnMensajes) {
      if (estaLogueado) {
        btnMensajes.parentElement.style.display = 'list-item';
        console.log('✅ Botón Mensajes visible (usuario logueado)');
        
        // Iniciar actualización del badge
        actualizarBadgeMensajesNoLeidos();
        
        // Actualizar cada 10 segundos
        if (!window.intervaloBadgeMensajes) {
          window.intervaloBadgeMensajes = setInterval(actualizarBadgeMensajesNoLeidos, 10000);
        }
      } else {
        btnMensajes.parentElement.style.display = 'none';
        console.log('🚫 Botón Mensajes oculto (usuario no logueado)');
        
        // Detener actualización del badge
        if (window.intervaloBadgeMensajes) {
          clearInterval(window.intervaloBadgeMensajes);
          window.intervaloBadgeMensajes = null;
        }
      }
    }
  }

  // Función para actualizar el badge de mensajes no leídos
  async function actualizarBadgeMensajesNoLeidos() {
    const sesion = obtenerSesion();
    if (!sesion) return;
    
    try {
      const response = await fetch(`/mensaje?no_leidos=true&usuario_id=${sesion.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
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
      console.error('Error al actualizar badge de mensajes:', error);
    }
  }

  // Función para mostrar usuario logueado
  function mostrarUsuarioLogueado(usuario) {
    console.log('👤 Mostrando usuario logueado:', usuario);
    if (authButtons) authButtons.style.display = 'none';
    if (username) username.textContent = usuario.nombreCompleto || usuario.correoElectronico;
    if (welcomeMessage) welcomeMessage.style.display = 'block';
    
    // Mostrar botón "Publicar" solo para proveedores (tipo 2)
    actualizarBotonPublicar(usuario.tipoUsuario);
    
    // Mostrar botón "Reservas" para todos los usuarios logueados
    actualizarBotonReservas(true);
    
    // Mostrar botón "Mensajes" para todos los usuarios logueados
    actualizarBotonMensajes(true);
  }

  // Función para mostrar estado de no logueado
  function mostrarUsuarioDeslogueado() {
    console.log('🚪 Mostrando estado deslogueado');
    if (authButtons) authButtons.style.display = '';
    if (welcomeMessage) welcomeMessage.style.display = 'none';
    if (username) username.textContent = '';
    limpiarSesion();
    
    // Ocultar botón publicar
    const btnPublicar = document.getElementById('btnPublicar');
    if (btnPublicar) {
      btnPublicar.parentElement.style.display = 'none';
    }
    
    // Ocultar botón reservas
    actualizarBotonReservas(false);
    
    // Ocultar botón mensajes
    actualizarBotonMensajes(false);
  }

  // Evento: Botón Salir
  if (btnSalir) {
    btnSalir.addEventListener('click', () => {
      console.log('🚪 Cerrando sesión...');
      mostrarUsuarioDeslogueado();
      
      // Recargar página para limpiar estado
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  }

  // Evento: Registro
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('🚀 Formulario de registro enviado');

      const tipoUsuario = document.getElementById('tipoUsuario').value;
      const nombreCompleto = document.getElementById('nombre').value.trim();
      const correoElectronico = document.getElementById('email').value.trim();
      const contrasena = document.getElementById('password').value.trim();
      const confirmPassword = document.getElementById('confirmPassword').value.trim();
      const rut = document.getElementById('RUT').value.trim();

      // VALIDACIONES MEJORADAS
      if (!tipoUsuario || !nombreCompleto || !correoElectronico || !contrasena || !confirmPassword) {
        if (typeof mostrarAlerta === 'function') {
          mostrarAlerta('Por favor complete todos los campos obligatorios', 'warning');
        } else {
          estadoRegistro.innerHTML = '<div class="alert alert-warning">⚠️ Por favor complete todos los campos obligatorios</div>';
        }
        return;
      }

      // Validar nombre (solo letras, espacios y acentos, mínimo 3 caracteres)
      const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
      if (!regexNombre.test(nombreCompleto)) {
        if (typeof mostrarAlerta === 'function') {
          mostrarAlerta('El nombre debe contener solo letras y espacios, con un mínimo de 3 caracteres. No se permiten números ni símbolos.', 'warning');
        } else {
          estadoRegistro.innerHTML = '<div class="alert alert-warning">⚠️ El nombre debe contener solo letras y espacios, con un mínimo de 3 caracteres</div>';
        }
        return;
      }

      if (contrasena !== confirmPassword) {
        if (typeof mostrarAlerta === 'function') {
          mostrarAlerta('Las contraseñas no coinciden', 'error');
        } else {
          estadoRegistro.innerHTML = '<div class="alert alert-danger">⚠️ Las contraseñas no coinciden</div>';
        }
        return;
      }

      if (contrasena.length < 6) {
        if (typeof mostrarAlerta === 'function') {
          mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'warning');
        } else {
          estadoRegistro.innerHTML = '<div class="alert alert-warning">⚠️ La contraseña debe tener al menos 6 caracteres</div>';
        }
        return;
      }

      estadoRegistro.innerHTML = '<div class="alert alert-info"><div class="d-flex align-items-center"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Registrando usuario...</div></div>';

      const payload = {
        tipoUsuario,
        nombreCompleto,
        correoElectronico,
        contrasena,
        rut: rut || null
      };

      try {
        const res = await fetch('/registro', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        console.log('📨 Respuesta registro:', res.status);

        const data = await res.json();
        console.log('📦 Data registro:', data);

        if (data.exito && data.usuario) {
          estadoRegistro.innerHTML = '<div class="alert alert-success">✅ ' + data.mensaje + '</div>';
          formRegistro.reset();
          
          // Guardar sesión inmediatamente
          guardarSesion(data.usuario);
          
          setTimeout(() => {
            estadoRegistro.innerHTML = '<div class="alert alert-success">✅ ¡Perfecto! Redirigiendo...</div>';
            
            setTimeout(() => {
              const registroModal = bootstrap.Modal.getInstance(document.getElementById('registroModal'));
              if (registroModal) registroModal.hide();
              
              // Recargar página para mostrar el estado logueado
              window.location.reload();
            }, 1000);
          }, 1000);
          
        } else {
          estadoRegistro.innerHTML = '<div class="alert alert-danger">❌ ' + data.mensaje + '</div>';
        }
        
      } catch (err) {
        console.error('💥 Error de conexión:', err);
        estadoRegistro.innerHTML = '<div class="alert alert-danger">❌ Error de conexión con el servidor</div>';
      }
    });
  }

  // Evento: Login manual
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('🔑 Formulario de login enviado');

      const correoElectronico = document.getElementById('loginEmail').value.trim();
      const contrasena = document.getElementById('loginPassword').value.trim();

      if (!correoElectronico || !contrasena) {
        estadoLogin.innerHTML = '<div class="alert alert-warning">⚠️ Por favor complete todos los campos</div>';
        return;
      }

      estadoLogin.innerHTML = '<div class="alert alert-info"><div class="d-flex align-items-center"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Validando credenciales...</div></div>';

      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ correoElectronico, contrasena })
        });

        const data = await res.json();
        console.log('📦 Data login:', data);

        if (data.exito && data.usuario) {
          guardarSesion(data.usuario);
          estadoLogin.innerHTML = '<div class="alert alert-success">✅ ¡Bienvenido de nuevo!</div>';
          
          // Actualizar UI
          mostrarUsuarioLogueado(data.usuario);
          
          // Cerrar modal después de 1 segundo
          setTimeout(() => {
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) loginModal.hide();
            
            // Recargar para actualizar botones
            window.location.reload();
          }, 1000);
          
        } else {
          estadoLogin.innerHTML = '<div class="alert alert-danger">❌ ' + data.mensaje + '</div>';
        }
      } catch (err) {
        console.error('💥 Error en login:', err);
        estadoLogin.innerHTML = '<div class="alert alert-danger">❌ Error de conexión con el servidor</div>';
      }
    });
  }

  // INICIALIZACIÓN: Verificar sesión guardada al cargar la página
  const sesionActual = obtenerSesion();
  if (sesionActual) {
    console.log('🔄 Sesión encontrada al cargar página:', sesionActual);
    mostrarUsuarioLogueado(sesionActual);
  } else {
    console.log('🔄 No hay sesión guardada');
    mostrarUsuarioDeslogueado();
  }

  console.log('✅ Script inicializado completamente');
});

// Función para cargar tarjetas (publicaciones)
async function cargarTarjetas() {
  try {
    console.log('🔄 Cargando publicaciones...');
    
    const res = await fetch('/publicacion', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('📨 Status respuesta publicaciones:', res.status);
    
    if (!res.ok) {
      throw new Error('HTTP error! status: ' + res.status);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('❌ Respuesta no es JSON:', text);
      throw new Error('La respuesta del servidor no es JSON válido');
    }

    const publicaciones = await res.json();
    console.log('✅ Publicaciones cargadas:', publicaciones);

    const contenedor2 = document.getElementById('grid-servicios');
    
    if (!contenedor2) {
      console.error('❌ No se encontró el elemento grid-servicios');
      return;
    }

    // Limpiar contenedor
    contenedor2.innerHTML = '';

    if (!publicaciones || publicaciones.length === 0) {
      contenedor2.innerHTML = '<p class="text-center">No hay publicaciones disponibles</p>';
      return;
    }

    // INTEGRACIÓN CON SISTEMA DE BÚSQUEDA
    if (typeof window.cargarPublicacionesParaBusqueda === 'function') {
      window.cargarPublicacionesParaBusqueda(publicaciones);
      console.log('✅ Publicaciones enviadas al sistema de búsqueda');
      // NO renderizar aquí, el buscador lo hará
      return;
    }

    // Solo si NO hay sistema de búsqueda, renderizar directamente
    publicaciones.forEach(function(pub) {
      const imagenUrl = pub.imagen_principal || pub.imagen || 'imagenes/trabajador.jpg';
      
      contenedor2.innerHTML += '<div class="service-card">' +
        '<img src="' + imagenUrl + '" alt="' + pub.titulo + '" width="150" onerror="this.src=\'imagenes/trabajador.jpg\'">' +
        '<h2>' + pub.titulo + '</h2>' +
        '<p>' + pub.tipo_servicio + '</p>' +
        '<p>' + pub.ubicacion + '</p>' +
        '<p class="estrella">' +
          '<i class="bi bi-star-fill"></i>' +
          '<i class="bi bi-star-fill"></i>' +
          '<i class="bi bi-star-fill"></i>' +
          '<i class="bi bi-star-fill"></i>' +
          '<i class="bi bi-star-fill"></i>' +
        '</p>' +
        '<a href="publicacion.html?id=' + pub.id + '" class="btn btn-primary btn-lg">Ver publicación</a>' +
      '</div>';
    });

  } catch (error) {
    console.error('💥 Error al cargar publicaciones:', error);
    const contenedor2 = document.getElementById('grid-servicios');
    if (contenedor2) {
      contenedor2.innerHTML = '<div class="alert alert-danger" role="alert">❌ Error al cargar publicaciones: ' + error.message + '</div>';
    }
  }
}

// Cargar al inicio
window.addEventListener('load', cargarTarjetas);
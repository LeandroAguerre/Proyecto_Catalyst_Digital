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

  // Función para mostrar usuario logueado
  function mostrarUsuarioLogueado(email) {
    console.log('👤 Mostrando usuario logueado:', email);
    if (authButtons) authButtons.style.display = 'none';
    if (username) username.textContent = email;
    if (welcomeMessage) welcomeMessage.style.display = 'block';
  }

  // Función para mostrar estado de no logueado
  function mostrarUsuarioDeslogueado() {
    console.log('🚪 Mostrando estado deslogueado');
    if (authButtons) {
      authButtons.style.display = ''; // Remover estilo inline, usar CSS
    }
    if (welcomeMessage) welcomeMessage.style.display = 'none';
    if (username) username.textContent = '';
    sessionStorage.removeItem('correoElectronico'); // Usar sessionStorage
  }

  // Función para hacer login automático (solo después de registro)
  async function loginAutomatico(email, password) {
    console.log('🔄 Realizando login automático después del registro...');
    
    try {
      const res = await fetch('/index.php?accion=login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          correoElectronico: email, 
          contrasena: password 
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exito) {
          console.log('✅ Login automático exitoso');
          sessionStorage.setItem('correoElectronico', email); // Usar sessionStorage
          return true;
        }
      }
    } catch (err) {
      console.log('❌ Error en login automático:', err);
    }
    
    return false;
  }

  // Evento: Botón Salir
  if (btnSalir) {
    btnSalir.addEventListener('click', () => {
      console.log('🚪 Cerrando sesión...');
      mostrarUsuarioDeslogueado();
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

      // Validaciones
      if (!tipoUsuario || !nombreCompleto || !correoElectronico || !contrasena || !confirmPassword) {
        estadoRegistro.innerHTML = `<div class="alert alert-warning">⚠️ Por favor complete todos los campos obligatorios</div>`;
        return;
      }

      if (contrasena !== confirmPassword) {
        estadoRegistro.innerHTML = `<div class="alert alert-danger">⚠️ Las contraseñas no coinciden</div>`;
        return;
      }

      if (contrasena.length < 6) {
        estadoRegistro.innerHTML = `<div class="alert alert-warning">⚠️ La contraseña debe tener al menos 6 caracteres</div>`;
        return;
      }

      // Mostrar indicador de carga
      estadoRegistro.innerHTML = `<div class="alert alert-info">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Registrando usuario...
        </div>
      </div>`;

      const payload = {
        tipoUsuario,
        nombreCompleto,
        correoElectronico,
        contrasena,
        rut: rut || null
      };

      try {
        const res = await fetch('/index.php?accion=registro', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        console.log('📨 Respuesta registro:', res.status);

        let data;
        const contentType = res.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const textResponse = await res.text();
          console.log('Respuesta como texto:', textResponse);
          try {
            data = JSON.parse(textResponse);
          } catch {
            data = { exito: false, mensaje: 'Error en el servidor' };
          }
        }

        console.log('📦 Data registro:', data);

        if (data.exito) {
          // Mostrar éxito
          estadoRegistro.innerHTML = `<div class="alert alert-success">✅ ${data.mensaje}</div>`;
          formRegistro.reset();
          
          // Login automático después de 1.5 segundos
          setTimeout(async () => {
            estadoRegistro.innerHTML = `<div class="alert alert-info">
              <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Iniciando sesión automáticamente...
              </div>
            </div>`;
            
            const loginExitoso = await loginAutomatico(correoElectronico, contrasena);
            
            if (loginExitoso) {
              estadoRegistro.innerHTML = `<div class="alert alert-success">✅ ¡Perfecto! Redirigiendo...</div>`;
              
              // Cerrar modal y recargar página después de 1 segundo
              setTimeout(() => {
                const registroModal = bootstrap.Modal.getInstance(document.getElementById('registroModal'));
                if (registroModal) registroModal.hide();
                
                // Recargar página para mostrar el estado logueado
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }, 1000);
            } else {
              estadoRegistro.innerHTML = `<div class="alert alert-warning">✅ Usuario registrado. Por favor inicia sesión manualmente.</div>`;
            }
          }, 1500);
          
        } else {
          estadoRegistro.innerHTML = `<div class="alert alert-danger">❌ ${data.mensaje}</div>`;
        }
        
      } catch (err) {
        console.error('💥 Error de conexión:', err);
        estadoRegistro.innerHTML = `<div class="alert alert-danger">❌ Error de conexión con el servidor</div>`;
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
        estadoLogin.innerHTML = `<div class="alert alert-warning">⚠️ Por favor complete todos los campos</div>`;
        return;
      }

      estadoLogin.innerHTML = `<div class="alert alert-info">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Validando credenciales...
        </div>
      </div>`;

      try {
        const res = await fetch('/index.php?accion=login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ correoElectronico, contrasena })
        });

        const data = await res.json();
        console.log('📦 Data login:', data);

        if (data.exito) {
          sessionStorage.setItem('correoElectronico', correoElectronico); // Usar sessionStorage
          estadoLogin.innerHTML = `<div class="alert alert-success">✅ ¡Bienvenido de nuevo!</div>`;
          
          // Actualizar UI
          mostrarUsuarioLogueado(correoElectronico);
          
          // Cerrar modal después de 1 segundo
          setTimeout(() => {
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) loginModal.hide();
          }, 1000);
          
        } else {
          estadoLogin.innerHTML = `<div class="alert alert-danger">❌ ${data.mensaje}</div>`;
        }
      } catch (err) {
        console.error('💥 Error en login:', err);
        estadoLogin.innerHTML = `<div class="alert alert-danger">❌ Error de conexión con el servidor</div>`;
      }
    });
  }

  // INICIALIZACIÓN: Verificar sesión guardada SOLO al cargar la página
  const correoGuardado = sessionStorage.getItem('correoElectronico'); // Usar sessionStorage
  if (correoGuardado) {
    console.log('🔄 Sesión encontrada al cargar página:', correoGuardado);
    mostrarUsuarioLogueado(correoGuardado);
  } else {
    console.log('🔄 No hay sesión guardada');
    mostrarUsuarioDeslogueado();
  }

  console.log('✅ Script inicializado completamente');
});
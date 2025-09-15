const container = document.getElementById('formularioContainer');

document.getElementById('btnRegistro').onclick = () => {
  container.innerHTML = `
    <form id="formRegistro" class="p-3 border rounded">
      <h3>Registro</h3>
      <input type="text" id="usuarioRegistro" class="form-control mb-2" placeholder="Usuario">
      <input type="password" id="passRegistro" class="form-control mb-2" placeholder="Contraseña">
      <button type="submit" class="btn btn-primary">Registrar</button>
    </form>
  `;

  document.getElementById('formRegistro').onsubmit = async (e) => {
  e.preventDefault();
  const usuario = usuarioRegistro.value.trim();
  const pass = passRegistro.value.trim();
  const estado = document.getElementById('estado');

  if (!usuario || !pass) {
    estado.textContent = '⚠️ Campos vacíos';
    return;
  }

  estado.textContent = '⏳ Enviando datos...';

  try {
    const res = await fetch('index.php?accion=registro', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usuario, pass})
    });
    const data = await res.json();
    estado.textContent = data.mensaje || '❌ Error inesperado';
  } catch (err) {
    estado.textContent = '❌ Error de conexión con el servidor';
  }
};

};

document.getElementById('btnLogin').onclick = () => {
  container.innerHTML = `
    <form id="formLogin" class="p-3 border rounded">
      <h3>Login</h3>
      <input type="text" id="usuarioLogin" class="form-control mb-2" placeholder="Usuario">
      <input type="password" id="passLogin" class="form-control mb-2" placeholder="Contraseña">
      <button type="submit" class="btn btn-success">Ingresar</button>
    </form>
  `;

  document.getElementById('formLogin').onsubmit = async (e) => {
  e.preventDefault();
  const usuario = usuarioLogin.value.trim();
  const pass = passLogin.value.trim();
  const estado = document.getElementById('estado');

  if (!usuario || !pass) {
    estado.textContent = '⚠️ Campos vacíos';
    return;
  }

  estado.textContent = '⏳ Validando credenciales...';

  try {
    const res = await fetch('index.php?accion=login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usuario, pass})
    });
    const data = await res.json();

    if (data.exito) {
      localStorage.setItem('usuario', usuario);
      estado.textContent = '✅ Login con éxito';
      container.innerHTML = `
        <a href="pergil.html" class="btn btn-info m-2">Perfil</a>
        <a href="publicacion.html" class="btn btn-secondary m-2">Publicación</a>
      `;
    } else {
      estado.textContent = data.mensaje || '❌ Credenciales inválidas';
    }
  } catch (err) {
    estado.textContent = '❌ Error de conexión con el servidor';
  }
};

};

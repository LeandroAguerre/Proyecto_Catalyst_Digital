console.log('buscar.js (v2.1) cargado');

document.addEventListener('DOMContentLoaded', function() {
  // --- ELEMENTOS DEL DOM ---
  const btnBuscar = document.getElementById('search-button');
  const btnLimpiar = document.getElementById('clear-filters-button');
  const gridServicios = document.getElementById('grid-servicios');

  const inputTexto = document.getElementById('search-text');
  const inputUbicacionOriginal = document.getElementById('search-location');
  const selectTipoServicio = document.getElementById('filter-tipo-servicio');
  const inputHoraInicio = document.getElementById('filter-hora-inicio');
  const inputHoraFin = document.getElementById('filter-hora-fin');

  // --- INICIALIZACIÓN ---
  if (!btnBuscar) {
    console.log('⚠️ No es la página de búsqueda, no se inicializa el script.');
    return;
  }

  // 1. Convertir input de ubicación en select de departamentos
  const selectDepartamento = document.createElement('select');
  selectDepartamento.className = inputUbicacionOriginal.className;
  selectDepartamento.id = 'search-location'; // Mantener el ID
  selectDepartamento.innerHTML = `
    <option value="">Todos los departamentos</option>
    <option value="Artigas">Artigas</option>
    <option value="Canelones">Canelones</option>
    <option value="Cerro Largo">Cerro Largo</option>
    <option value="Colonia">Colonia</option>
    <option value="Durazno">Durazno</option>
    <option value="Flores">Flores</option>
    <option value="Florida">Florida</option>
    <option value="Lavalleja">Lavalleja</option>
    <option value="Maldonado">Maldonado</option>
    <option value="Montevideo">Montevideo</option>
    <option value="Paysandú">Paysandú</option>
    <option value="Río Negro">Río Negro</option>
    <option value="Rivera">Rivera</option>
    <option value="Rocha">Rocha</option>
    <option value="Salto">Salto</option>
    <option value="San José">San José</option>
    <option value="Soriano">Soriano</option>
    <option value="Tacuarembó">Tacuarembó</option>
    <option value="Treinta y Tres">Treinta y Tres</option>
  `;
  inputUbicacionOriginal.parentNode.replaceChild(selectDepartamento, inputUbicacionOriginal);
  
  const inputUbicacion = document.getElementById('search-location');

  // 2. Mostrar mensaje inicial
  mostrarMensajeInicial();

  // --- EVENT LISTENERS ---
  btnBuscar.addEventListener('click', realizarBusqueda);
  btnLimpiar.addEventListener('click', limpiarBusqueda);
  
  inputTexto.addEventListener('keyup', e => e.key === 'Enter' && realizarBusqueda());
  
  console.log('✅ Sistema de búsqueda (v2.1) inicializado con dropdown.');

  // --- FUNCIONES PRINCIPALES ---

  async function realizarBusqueda() {
    console.log('🔍 Realizando búsqueda en el servidor...');
    
    gridServicios.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
        <p class="mt-3">Buscando servicios...</p>
      </div>
    `;

    const params = new URLSearchParams();
    if (inputTexto.value) params.append('q', inputTexto.value);
    if (inputUbicacion.value) params.append('ubicacion', inputUbicacion.value);
    if (selectTipoServicio.value) params.append('tipo_servicio', selectTipoServicio.value);
    if (inputHoraInicio.value) params.append('hora_inicio', inputHoraInicio.value);
    if (inputHoraFin.value) params.append('hora_fin', inputHoraFin.value);

    try {
      const url = `/publicacion?${params.toString()}`;
      console.log(`📨 Fetching: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      const publicaciones = await response.json();
      
      mostrarPublicaciones(publicaciones);

    } catch (error) {
      console.error('💥 Error en la búsqueda:', error);
      gridServicios.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill"></i>
            Ocurrió un error al realizar la búsqueda. Por favor, intenta nuevamente.
          </div>
        </div>
      `;
    }
  }

  function mostrarPublicaciones(publicaciones) {
    console.log(`📊 Mostrando ${publicaciones.length} publicaciones.`);
    gridServicios.innerHTML = '';

    if (publicaciones.length === 0) {
      gridServicios.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">
            <i class="bi bi-info-circle"></i> No se encontraron publicaciones con los criterios seleccionados.
          </div>
        </div>
      `;
      return;
    }

    publicaciones.forEach(pub => {
      const imagenUrl = pub.imagen_principal || pub.imagen || 'imagenes/trabajador.jpg';
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <img src="${imagenUrl}" alt="${pub.titulo}" width="150" onerror="this.src='imagenes/trabajador.jpg'">
        <h2>${pub.titulo}</h2>
        <p>${pub.tipo_servicio}</p>
        <p>${pub.ubicacion}</p>
        <a href="publicacion.html?id=${pub.id}" class="btn btn-primary btn-lg">Ver publicación</a>
      `;
      gridServicios.appendChild(card);
    });
  }

  function limpiarBusqueda() {
    console.log('🧹 Limpiando filtros y resultados...');
    inputTexto.value = '';
    inputUbicacion.value = '';
    selectTipoServicio.value = '';
    inputHoraInicio.value = '';
    inputHoraFin.value = '';
    
    mostrarMensajeInicial();
  }

  function mostrarMensajeInicial() {
    gridServicios.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search" style="font-size: 4rem; color: #ccc;"></i>
        <h4 class="mt-3 text-muted">Utiliza los filtros para buscar</h4>
        <p class="text-muted">Los resultados aparecerán aquí.</p>
      </div>
    `;
  }
});
console.log('buscar.js cargado');

// Variables globales
let todasLasPublicaciones = [];
let publicacionesFiltradas = [];

// Inicializar sistema de búsqueda
document.addEventListener('DOMContentLoaded', function() {
  const inputBusquedaIzq = document.querySelector('.search-left');
  const inputBusquedaDer = document.querySelector('.search-right');
  const btnBuscar = document.querySelector('.search-button');
  
  if (!inputBusquedaIzq || !inputBusquedaDer || !btnBuscar) {
    console.log('⚠️ Elementos de búsqueda no encontrados en esta página');
    return;
  }
  
  console.log('✅ Sistema de búsqueda inicializado');
  
  // Convertir input derecho en select (departamentos)
  const selectDepartamento = document.createElement('select');
  selectDepartamento.className = inputBusquedaDer.className;
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
  
  inputBusquedaDer.parentNode.replaceChild(selectDepartamento, inputBusquedaDer);
  
  // Actualizar placeholder del input izquierdo
  inputBusquedaIzq.placeholder = 'Buscar por servicio, nombre o descripción...';
  
  // Event listeners
  btnBuscar.addEventListener('click', realizarBusqueda);
  
  inputBusquedaIzq.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      realizarBusqueda();
    }
  });
  
  selectDepartamento.addEventListener('change', realizarBusqueda);
  
  // Buscar mientras escribe (debounce)
  let timeoutBusqueda;
  inputBusquedaIzq.addEventListener('input', function() {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(realizarBusqueda, 500);
  });
});

// Cargar todas las publicaciones (llamar desde script.js)
function cargarPublicacionesParaBusqueda(publicaciones) {
  todasLasPublicaciones = publicaciones;
  publicacionesFiltradas = publicaciones;
  console.log('📦 Publicaciones cargadas para búsqueda:', publicaciones.length);
  
  // Inicializar mostrando todas las publicaciones
  mostrarPublicacionesFiltradas();
}

// Realizar búsqueda
function realizarBusqueda() {
  const inputBusqueda = document.querySelector('.search-left');
  const selectDepartamento = document.querySelector('.search-right');
  
  if (!inputBusqueda || !selectDepartamento) {
    console.error('❌ Elementos de búsqueda no encontrados');
    return;
  }
  
  const textoBusqueda = inputBusqueda.value.toLowerCase().trim();
  const departamentoSeleccionado = selectDepartamento.value.trim();
  
  console.log('🔍 Buscando:', { 
    texto: textoBusqueda, 
    departamento: departamentoSeleccionado,
    totalPublicaciones: todasLasPublicaciones.length 
  });
  
  // Si no hay filtros, mostrar todo
  if (!textoBusqueda && !departamentoSeleccionado) {
    console.log('ℹ️ Sin filtros, mostrando todas las publicaciones');
    publicacionesFiltradas = todasLasPublicaciones;
    mostrarPublicacionesFiltradas();
    return;
  }
  
  // Filtrar publicaciones
  publicacionesFiltradas = todasLasPublicaciones.filter(function(pub) {
    let coincideTexto = true;
    let coincideDepartamento = true;
    
    // Filtro por texto (busca en título, tipo_servicio, descripción)
    if (textoBusqueda) {
      const titulo = (pub.titulo || '').toLowerCase();
      const tipoServicio = (pub.tipo_servicio || '').toLowerCase();
      const descripcion = (pub.descripcion || '').toLowerCase();
      
      // Buscar la frase completa o palabras individuales
      const terminosBusqueda = textoBusqueda.split(/\s+/).filter(t => t.length > 0);
      
      // Verificar si TODOS los términos están presentes en alguno de los campos
      coincideTexto = terminosBusqueda.every(function(termino) {
        return titulo.includes(termino) || 
               tipoServicio.includes(termino) || 
               descripcion.includes(termino);
      });
      
      console.log('🔎 Verificando:', pub.titulo, '- Coincide:', coincideTexto);
    }
    
    // Filtro por departamento
    if (departamentoSeleccionado) {
      const ubicacionPub = (pub.ubicacion || '').trim();
      const deptoSeleccionado = departamentoSeleccionado.trim();
      
      coincideDepartamento = ubicacionPub === deptoSeleccionado;
      
      console.log('📍 Verificando ubicación:', {
        publicacion: ubicacionPub,
        buscado: deptoSeleccionado,
        coincide: coincideDepartamento
      });
    }
    
    return coincideTexto && coincideDepartamento;
  });
  
  console.log('✅ Resultados encontrados:', publicacionesFiltradas.length);
  
  // Mostrar resultados
  mostrarPublicacionesFiltradas();
}

// Mostrar publicaciones filtradas
function mostrarPublicacionesFiltradas() {
  const contenedor = document.getElementById('grid-servicios');
  
  if (!contenedor) {
    console.error('❌ No se encontró el contenedor grid-servicios');
    return;
  }
  
  console.log('📊 Mostrando publicaciones:', publicacionesFiltradas.length);
  
  // Limpiar contenedor
  contenedor.innerHTML = '';
  
  // Verificar si hay filtros activos
  const inputBusqueda = document.querySelector('.search-left');
  const selectDepartamento = document.querySelector('.search-right');
  const hayFiltros = (inputBusqueda && inputBusqueda.value.trim()) || 
                     (selectDepartamento && selectDepartamento.value.trim());
  
  if (publicacionesFiltradas.length === 0 && hayFiltros) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> No se encontraron publicaciones con los criterios de búsqueda.
          <button class="btn btn-sm btn-outline-primary ms-3" onclick="limpiarBusqueda()">
            <i class="bi bi-x-circle"></i> Limpiar búsqueda
          </button>
        </div>
      </div>
    `;
    mostrarContadorResultados();
    return;
  }
  
  if (publicacionesFiltradas.length === 0 && !hayFiltros) {
    contenedor.innerHTML = '<p class="text-center">No hay publicaciones disponibles</p>';
    return;
  }
  
  // Mostrar publicaciones filtradas
  publicacionesFiltradas.forEach(function(pub) {
    const imagenUrl = pub.imagen_principal || pub.imagen || 'imagenes/trabajador.jpg';
    
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <img src="${imagenUrl}" alt="${pub.titulo}" width="150" onerror="this.src='imagenes/trabajador.jpg'">
      <h2>${pub.titulo}</h2>
      <p>${pub.tipo_servicio}</p>
      <p>${pub.ubicacion}</p>
      <p class="estrella">
        <i class="bi bi-star-fill"></i>
        <i class="bi bi-star-fill"></i>
        <i class="bi bi-star-fill"></i>
        <i class="bi bi-star-fill"></i>
        <i class="bi bi-star-fill"></i>
      </p>
      <a href="publicacion.html?id=${pub.id}" class="btn btn-primary btn-lg">Ver publicación</a>
    `;
    contenedor.appendChild(card);
  });
  
  // Mostrar contador de resultados
  mostrarContadorResultados();
}

// Mostrar contador de resultados
function mostrarContadorResultados() {
  let contadorEl = document.getElementById('contador-resultados');
  
  if (!contadorEl) {
    const tituloServicios = document.querySelector('h1');
    if (tituloServicios) {
      contadorEl = document.createElement('div');
      contadorEl.id = 'contador-resultados';
      contadorEl.className = 'mb-3';
      tituloServicios.parentNode.insertBefore(contadorEl, tituloServicios.nextSibling);
    }
  }
  
  if (contadorEl) {
    const inputBusqueda = document.querySelector('.search-left');
    const selectDepartamento = document.querySelector('.search-right');
    const hayFiltros = (inputBusqueda && inputBusqueda.value.trim()) || 
                       (selectDepartamento && selectDepartamento.value.trim());
    
    if (hayFiltros) {
      const textoBusqueda = inputBusqueda ? inputBusqueda.value.trim() : '';
      const departamento = selectDepartamento ? selectDepartamento.value.trim() : '';
      
      let criterios = [];
      if (textoBusqueda) criterios.push(`"${textoBusqueda}"`);
      if (departamento) criterios.push(departamento);
      
      contadorEl.innerHTML = `
        <div class="alert alert-success d-flex justify-content-between align-items-center">
          <div>
            <i class="bi bi-funnel-fill"></i> 
            <strong>${publicacionesFiltradas.length}</strong> resultado(s) de <strong>${todasLasPublicaciones.length}</strong> 
            con: ${criterios.join(' + ')}
          </div>
          <button class="btn btn-sm btn-outline-success" onclick="limpiarBusqueda()">
            <i class="bi bi-x-circle"></i> Limpiar filtros
          </button>
        </div>
      `;
    } else {
      contadorEl.innerHTML = '';
    }
  }
}

// Limpiar búsqueda
function limpiarBusqueda() {
  console.log('🧹 Limpiando búsqueda...');
  
  const inputBusqueda = document.querySelector('.search-left');
  const selectDepartamento = document.querySelector('.search-right');
  
  if (inputBusqueda) {
    inputBusqueda.value = '';
    console.log('✅ Input de búsqueda limpiado');
  }
  
  if (selectDepartamento) {
    selectDepartamento.value = '';
    console.log('✅ Select de departamento limpiado');
  }
  
  // Restaurar todas las publicaciones
  publicacionesFiltradas = todasLasPublicaciones;
  console.log('✅ Mostrando todas las publicaciones:', publicacionesFiltradas.length);
  
  // Mostrar todas las publicaciones
  mostrarPublicacionesFiltradas();
}

// Exponer funciones globalmente
window.cargarPublicacionesParaBusqueda = cargarPublicacionesParaBusqueda;
window.limpiarBusqueda = limpiarBusqueda;
window.realizarBusqueda = realizarBusqueda;
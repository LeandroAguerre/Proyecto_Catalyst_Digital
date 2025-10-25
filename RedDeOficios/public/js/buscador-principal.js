console.log('buscador-principal.js cargado');

// Variables globales
let todasLasPublicaciones = [];
let publicacionesFiltradas = [];
let paginaActual = 1;
const publicacionesPorPagina = 9;

// Inicializar sistema de búsqueda
document.addEventListener('DOMContentLoaded', function() {
  const inputBusquedaIzq = document.querySelector('.search-left');
  const inputBusquedaDer = document.querySelector('.search-right');
  const btnBuscar = document.querySelector('.search-button');
  
  if (!inputBusquedaIzq || !inputBusquedaDer || !btnBuscar) {
    console.log(' Elementos de búsqueda no encontrados en esta página');
    return;
  }
  
  console.log(' Sistema de búsqueda con paginación inicializado');
  
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

// Cargar publicaciones (desde script.js)
function cargarPublicacionesParaBusqueda(publicaciones) {
  // Ordenar por ID descendente (más recientes primero)
  todasLasPublicaciones = publicaciones.sort((a, b) => b.id - a.id);
  publicacionesFiltradas = todasLasPublicaciones;
  paginaActual = 1;
  
  console.log(' Publicaciones cargadas para búsqueda paginada:', publicaciones.length);
  
  mostrarPublicacionesPaginadas();
}

// Realizar búsqueda
function realizarBusqueda() {
  const inputBusqueda = document.querySelector('.search-left');
  const selectDepartamento = document.querySelector('.search-right');
  
  if (!inputBusqueda || !selectDepartamento) return;
  
  const textoBusqueda = inputBusqueda.value.toLowerCase().trim();
  const departamentoSeleccionado = selectDepartamento.value.trim();
  
  console.log(' Buscando:', { texto: textoBusqueda, departamento: departamentoSeleccionado });
  
  // Si no hay filtros, mostrar todo
  if (!textoBusqueda && !departamentoSeleccionado) {
    publicacionesFiltradas = todasLasPublicaciones;
    paginaActual = 1;
    mostrarPublicacionesPaginadas();
    return;
  }
  
  // Filtrar publicaciones
  publicacionesFiltradas = todasLasPublicaciones.filter(function(pub) {
    let coincideTexto = true;
    let coincideDepartamento = true;
    
    if (textoBusqueda) {
      const titulo = (pub.titulo || '').toLowerCase();
      const tipoServicio = (pub.tipo_servicio || '').toLowerCase();
      const descripcion = (pub.descripcion || '').toLowerCase();
      
      const terminosBusqueda = textoBusqueda.split(/\s+/).filter(t => t.length > 0);
      
      coincideTexto = terminosBusqueda.every(function(termino) {
        return titulo.includes(termino) || 
               tipoServicio.includes(termino) || 
               descripcion.includes(termino);
      });
    }
    
    if (departamentoSeleccionado) {
      const ubicacionPub = (pub.ubicacion || '').trim();
      coincideDepartamento = ubicacionPub === departamentoSeleccionado;
    }
    
    return coincideTexto && coincideDepartamento;
  });
  
  console.log(' Resultados encontrados:', publicacionesFiltradas.length);
  
  paginaActual = 1; // Reiniciar a la primera página
  mostrarPublicacionesPaginadas();
}

// Mostrar publicaciones paginadas
function mostrarPublicacionesPaginadas() {
  const contenedor = document.getElementById('grid-servicios');
  
  if (!contenedor) {
    console.error(' No se encontró el contenedor grid-servicios');
    return;
  }
  
  contenedor.innerHTML = '';
  
  // Calcular índices
  const totalPaginas = Math.ceil(publicacionesFiltradas.length / publicacionesPorPagina);
  const inicio = (paginaActual - 1) * publicacionesPorPagina;
  const fin = inicio + publicacionesPorPagina;
  const publicacionesPagina = publicacionesFiltradas.slice(inicio, fin);
  
  console.log(' Página actual:', paginaActual, 'de', totalPaginas);
  console.log(' Mostrando publicaciones:', inicio, '-', fin, 'de', publicacionesFiltradas.length);
  
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
    renderizarPaginacion();
    return;
  }
  
  if (publicacionesPagina.length === 0) {
    contenedor.innerHTML = '<p class="text-center">No hay publicaciones disponibles</p>';
    return;
  }
  
  // Mostrar publicaciones de la página actual
  publicacionesPagina.forEach(function(pub) {
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
    contenedor.appendChild(card);
  });
  
  // Renderizar paginación
  renderizarPaginacion();
}

// Renderizar controles de paginación
function renderizarPaginacion() {
  let paginacionEl = document.getElementById('paginacion');
  
  if (!paginacionEl) {
    const contenedor = document.getElementById('grid-servicios');
    if (contenedor && contenedor.parentElement) {
      paginacionEl = document.createElement('nav');
      paginacionEl.id = 'paginacion';
      paginacionEl.className = 'mt-4 mb-4';
      paginacionEl.setAttribute('aria-label', 'Navegación de páginas');
      contenedor.parentElement.insertBefore(paginacionEl, contenedor.nextSibling);
    }
  }
  
  if (!paginacionEl) return;
  
  const totalPaginas = Math.ceil(publicacionesFiltradas.length / publicacionesPorPagina);
  
  // Si solo hay una página o menos, no mostrar paginación
  if (totalPaginas <= 1) {
    paginacionEl.innerHTML = '';
    return;
  }
  
  let html = '<ul class="pagination justify-content-center">';
  
  // Botón Anterior
  html += `
    <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">
        <i class="bi bi-chevron-left"></i> Anterior
      </a>
    </li>
  `;
  
  // Números de página
  const maxPaginasVisibles = 5;
  let inicioPaginas = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
  let finPaginas = Math.min(totalPaginas, inicioPaginas + maxPaginasVisibles - 1);
  
  if (finPaginas - inicioPaginas < maxPaginasVisibles - 1) {
    inicioPaginas = Math.max(1, finPaginas - maxPaginasVisibles + 1);
  }
  
  // Primera página
  if (inicioPaginas > 1) {
    html += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="cambiarPagina(1); return false;">1</a>
      </li>
    `;
    if (inicioPaginas > 2) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }
  
  // Páginas intermedias
  for (let i = inicioPaginas; i <= finPaginas; i++) {
    html += `
      <li class="page-item ${i === paginaActual ? 'active' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
      </li>
    `;
  }
  
  // Última página
  if (finPaginas < totalPaginas) {
    if (finPaginas < totalPaginas - 1) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
    html += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas}); return false;">${totalPaginas}</a>
      </li>
    `;
  }
  
  // Botón Siguiente
  html += `
    <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">
        Siguiente <i class="bi bi-chevron-right"></i>
      </a>
    </li>
  `;
  
  html += '</ul>';
  paginacionEl.innerHTML = html;
}

// Cambiar de página
function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(publicacionesFiltradas.length / publicacionesPorPagina);
  
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
  
  paginaActual = nuevaPagina;
  mostrarPublicacionesPaginadas();
  
  // Scroll suave al inicio de las publicaciones
  const contenedor = document.getElementById('grid-servicios');
  if (contenedor) {
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Limpiar búsqueda
function limpiarBusqueda() {
  const inputBusqueda = document.querySelector('.search-left');
  const selectDepartamento = document.querySelector('.search-right');
  
  if (inputBusqueda) inputBusqueda.value = '';
  if (selectDepartamento) selectDepartamento.value = '';
  
  publicacionesFiltradas = todasLasPublicaciones;
  paginaActual = 1;
  mostrarPublicacionesPaginadas();
}

// Exponer funciones globalmente
window.cargarPublicacionesParaBusqueda = cargarPublicacionesParaBusqueda;
window.cambiarPagina = cambiarPagina;
window.limpiarBusqueda = limpiarBusqueda;
/* =========================================================
   galeria.js · Galería dinámica
   - Carga el listado de imágenes desde data/galeria.json (fetch / AJAX)
   - Genera las miniaturas en el DOM
   - Filtra por categoría sin recargar la página
   - Visor (lightbox) con <dialog>, flechas y teclado
   ========================================================= */
'use strict';

(function () {
  const RUTA_JSON = '../data/galeria.json';
  const RUTA_IMAGENES = '../images/galeria/';

  // Copia de seguridad por si el JSON no puede leerse
  // (por ejemplo, al abrir el archivo con doble clic en file://)
  const RESPALDO = [
    { archivo: 'taza.svg', titulo: 'Taza recién servida', categoria: 'barra' },
    { archivo: 'granos.svg', titulo: 'Grano recién tostado', categoria: 'tueste' },
    { archivo: 'bolsa.svg', titulo: 'Nuestras bolsas compostables', categoria: 'producto' },
    { archivo: 'moka.svg', titulo: 'Cafetera moka clásica', categoria: 'producto' },
    { archivo: 'latte.svg', titulo: 'Latte art en la barra', categoria: 'barra' },
    { archivo: 'cafeto.svg', titulo: 'Cerezas de café maduras', categoria: 'origen' },
    { archivo: 'tostadora.svg', titulo: 'Tostadora de tambor', categoria: 'tueste' },
    { archivo: 'molinillo.svg', titulo: 'Molinillo manual', categoria: 'producto' },
    { archivo: 'v60.svg', titulo: 'Método de goteo V60', categoria: 'barra' }
  ];

  // Referencias al DOM
  const galeria = document.getElementById('galeria');
  const filtros = document.querySelectorAll('.filtro');
  const visor = document.getElementById('visor');
  const visorImagen = document.getElementById('visor-imagen');
  const visorTexto = document.getElementById('visor-texto');

  let imagenes = [];      // Todas las imágenes
  let visibles = [];      // Imágenes que pasan el filtro actual
  let indiceActual = 0;   // Imagen abierta en el visor

  /** Pinta las miniaturas de la lista recibida. */
  function pintarGaleria(lista) {
    galeria.innerHTML = '';

    lista.forEach((img, indice) => {
      const figura = document.createElement('figure');
      figura.className = 'galeria__item';
      figura.style.animationDelay = (indice * 60) + 'ms';

      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'galeria__boton';
      boton.setAttribute('aria-label', 'Ampliar: ' + img.titulo);
      boton.addEventListener('click', () => abrirVisor(indice));

      const imagen = document.createElement('img');
      imagen.src = RUTA_IMAGENES + img.archivo;
      imagen.alt = img.titulo;
      imagen.width = 800;
      imagen.height = 600;
      imagen.loading = 'lazy';

      const pie = document.createElement('figcaption');
      pie.textContent = img.titulo;

      boton.append(imagen);
      figura.append(boton, pie);
      galeria.append(figura);
    });
  }

  /** Aplica un filtro de categoría y actualiza los botones. */
  function filtrar(categoria) {
    visibles = categoria === 'todas'
      ? imagenes.slice()
      : imagenes.filter((img) => img.categoria === categoria);

    filtros.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === categoria)));
    pintarGaleria(visibles);
  }

  // ---------- Visor ----------
  function mostrarEnVisor(indice) {
    // Navegación circular
    indiceActual = (indice + visibles.length) % visibles.length;
    const img = visibles[indiceActual];
    visorImagen.src = RUTA_IMAGENES + img.archivo;
    visorImagen.alt = img.titulo;
    visorTexto.textContent = img.titulo + ' (' + (indiceActual + 1) + ' de ' + visibles.length + ')';
  }

  function abrirVisor(indice) {
    mostrarEnVisor(indice);
    visor.showModal();
  }

  document.getElementById('visor-cerrar').addEventListener('click', () => visor.close());
  document.getElementById('visor-anterior').addEventListener('click', () => mostrarEnVisor(indiceActual - 1));
  document.getElementById('visor-siguiente').addEventListener('click', () => mostrarEnVisor(indiceActual + 1));

  // Cerrar al pulsar fuera de la imagen (sobre el fondo)
  visor.addEventListener('click', (e) => {
    if (e.target === visor) visor.close();
  });

  // Teclado: flechas para navegar (Esc lo gestiona <dialog>)
  document.addEventListener('keydown', (e) => {
    if (!visor.open) return;
    if (e.key === 'ArrowLeft') mostrarEnVisor(indiceActual - 1);
    if (e.key === 'ArrowRight') mostrarEnVisor(indiceActual + 1);
  });

  // ---------- Filtros ----------
  filtros.forEach((boton) => {
    boton.addEventListener('click', () => filtrar(boton.dataset.filtro));
  });

  // ---------- Carga inicial por AJAX (fetch) ----------
  fetch(RUTA_JSON)
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      return respuesta.json();
    })
    .then((datos) => {
      imagenes = datos.imagenes;
    })
    .catch(() => {
      imagenes = RESPALDO;
    })
    .finally(() => filtrar('todas'));
})();

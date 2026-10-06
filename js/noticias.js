/* =========================================================
   noticias.js · Carga de noticias por AJAX
   Lee el archivo externo data/noticias.json con XMLHttpRequest
   y pinta una tarjeta por cada noticia en la portada.
   ========================================================= */
'use strict';

(function () {
  const RUTA_JSON = 'data/noticias.json';
  const contenedor = document.getElementById('lista-noticias');

  if (!contenedor) return;

  /**
   * Convierte una fecha ISO (AAAA-MM-DD) a formato legible en español.
   * @param {string} iso
   * @returns {string}
   */
  function formatearFecha(iso) {
    const fecha = new Date(iso + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /**
   * Crea el elemento <article> de una noticia.
   * Se usa textContent para evitar inyectar HTML desde el JSON.
   * @param {{fecha:string,titulo:string,resumen:string,categoria:string}} noticia
   * @returns {HTMLElement}
   */
  function crearTarjeta(noticia) {
    const articulo = document.createElement('article');
    articulo.className = 'tarjeta';

    const cuerpo = document.createElement('div');
    cuerpo.className = 'tarjeta__cuerpo';

    const meta = document.createElement('div');
    meta.className = 'noticia__meta';

    const fecha = document.createElement('time');
    fecha.dateTime = noticia.fecha;
    fecha.textContent = formatearFecha(noticia.fecha);

    const categoria = document.createElement('span');
    categoria.className = 'noticia__categoria';
    categoria.textContent = noticia.categoria;

    meta.append(fecha, categoria);

    const titulo = document.createElement('h3');
    titulo.textContent = noticia.titulo;

    const resumen = document.createElement('p');
    resumen.textContent = noticia.resumen;

    cuerpo.append(meta, titulo, resumen);
    articulo.append(cuerpo);
    return articulo;
  }

  /** Muestra un mensaje de error dentro del contenedor. */
  function mostrarError(texto) {
    contenedor.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'estado-carga estado-carga--error';
    p.textContent = texto;
    contenedor.append(p);
  }

  // ---------- Petición AJAX ----------
  const xhr = new XMLHttpRequest();
  xhr.open('GET', RUTA_JSON, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    if (xhr.status !== 200 || !xhr.response) {
      mostrarError('No se han podido cargar las noticias (error ' + xhr.status + ').');
      return;
    }

    // Ordena de más reciente a más antigua y pinta las tarjetas
    const noticias = xhr.response.noticias
      .slice()
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    contenedor.innerHTML = '';
    noticias.forEach((noticia) => contenedor.append(crearTarjeta(noticia)));
  };

  xhr.onerror = function () {
    // Suele ocurrir al abrir el HTML con doble clic (protocolo file://)
    mostrarError('No se han podido cargar las noticias. Abre el sitio desde un servidor local (por ejemplo, Live Server).');
  };

  xhr.send();
})();

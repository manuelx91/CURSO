/* =========================================================
   contacto.js · Mapa dinámico con ruta hasta el cliente
   - Leaflet + teselas de OpenStreetMap
   - Marcador con la ubicación del negocio
   - Ruta calculada con Leaflet Routing Machine (servidor OSRM)
   - Origen del cliente: geolocalización, dirección escrita
     (geocodificada con Nominatim) o clic en el mapa
   ========================================================= */
'use strict';

(function () {
  const info = document.getElementById('ruta-info');

  // Si las librerías no han cargado (sin conexión), avisamos y salimos
  if (typeof L === 'undefined' || !L.Routing) {
    info.textContent = 'No se ha podido cargar el mapa. Comprueba tu conexión a internet.';
    return;
  }

  // ---------- Ubicación del negocio ----------
  const NEGOCIO = L.latLng(40.4436, -3.7027);

  // ---------- Creación del mapa ----------
  const mapa = L.map('mapa').setView(NEGOCIO, 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mapa);

  // Icono personalizado con los colores de la marca
  const iconoNegocio = L.divIcon({
    className: '',
    html: '<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:#C8693A;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.35)"></div>',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });

  L.marker(NEGOCIO, { icon: iconoNegocio, title: 'Grano Norte' })
    .addTo(mapa)
    .bindPopup('<strong>Grano Norte</strong><br>Calle de Ponzano, 42<br>28003 Madrid')
    .openPopup();

  // ---------- Control de rutas ----------
  const ruta = L.Routing.control({
    waypoints: [],
    router: L.Routing.osrmv1({ language: 'es', profile: 'driving' }),
    language: 'es',
    routeWhileDragging: false,
    addWaypoints: false,
    show: true,
    collapsible: true,
    lineOptions: { styles: [{ color: '#4A2C1F', opacity: 0.85, weight: 6 }] },
    // El negocio usa su propio marcador; el cliente, el marcador por defecto
    createMarker: (i, punto) => (i === 0 ? L.marker(punto.latLng, { title: 'Tu ubicación' }) : null)
  }).addTo(mapa);

  // Muestra distancia y duración cuando se calcula la ruta
  ruta.on('routesfound', (e) => {
    const resumen = e.routes[0].summary;
    const km = (resumen.totalDistance / 1000).toFixed(1).replace('.', ',');
    const minutos = Math.round(resumen.totalTime / 60);
    info.textContent = 'Ruta en coche: ' + km + ' km · unos ' + minutos + ' minutos.';
  });

  ruta.on('routingerror', () => {
    info.textContent = 'No se ha podido calcular la ruta. Inténtalo de nuevo en unos segundos.';
  });

  /** Traza la ruta desde el punto del cliente hasta el negocio. */
  function trazarRuta(origen) {
    info.textContent = 'Calculando ruta…';
    ruta.setWaypoints([L.latLng(origen), NEGOCIO]);
  }

  // ---------- Opción 1: geolocalización del navegador ----------
  document.getElementById('ruta-ubicacion').addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      info.textContent = 'Tu navegador no permite la geolocalización. Escribe tu dirección.';
      return;
    }
    info.textContent = 'Buscando tu ubicación…';
    navigator.geolocation.getCurrentPosition(
      (pos) => trazarRuta([pos.coords.latitude, pos.coords.longitude]),
      () => { info.textContent = 'No hemos podido obtener tu ubicación. Escribe tu dirección o pulsa en el mapa.'; },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  // ---------- Opción 2: dirección escrita (Nominatim, AJAX con fetch) ----------
  document.getElementById('ruta-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = document.getElementById('ruta-origen').value.trim();
    if (!texto) {
      info.textContent = 'Escribe una dirección para calcular la ruta.';
      return;
    }
    info.textContent = 'Buscando la dirección…';

    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&q=' +
      encodeURIComponent(texto);

    fetch(url, { headers: { 'Accept-Language': 'es' } })
      .then((r) => r.json())
      .then((resultados) => {
        if (!resultados.length) {
          info.textContent = 'No encontramos esa dirección. Prueba a añadir la ciudad.';
          return;
        }
        trazarRuta([parseFloat(resultados[0].lat), parseFloat(resultados[0].lon)]);
      })
      .catch(() => { info.textContent = 'Error al buscar la dirección. Inténtalo más tarde.'; });
  });

  // ---------- Opción 3: clic en el mapa ----------
  mapa.on('click', (e) => trazarRuta(e.latlng));
})();

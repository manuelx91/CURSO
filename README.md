# Grano Norte · Trabajo final JavaScript Avanzado

Sitio web de un tostadero de café ficticio, hecho con HTML5, CSS3, JavaScript y AJAX.

## Cómo abrirlo

Las noticias y la galería se cargan por AJAX desde archivos JSON, así que el sitio debe abrirse desde un servidor local, no con doble clic (`file://`):

- **Visual Studio Code:** clic derecho en `index.html` y luego **Open with Live Server**.
- **Python:** ejecuta `python -m http.server` en esta carpeta y abre `http://localhost:8000`.

La página de contacto necesita conexión a internet para cargar el mapa (Leaflet + OpenStreetMap).

## Estructura

```
├── index.html            Portada (6 secciones; las noticias se cargan por AJAX)
├── views/
│   ├── galeria.html      Galería dinámica con filtros y visor
│   ├── presupuesto.html  Formulario con validación y cálculo en vivo
│   ├── contacto.html     Mapa con ruta hasta el cliente
│   └── aviso-legal.html  Aviso legal y política de privacidad
├── css/estilos.css       Estilos (paleta: café, crema y terracota)
├── js/
│   ├── main.js           Menú móvil, barra fija y año del footer
│   ├── noticias.js       AJAX con XMLHttpRequest → data/noticias.json
│   ├── galeria.js        AJAX con fetch → data/galeria.json, filtros y lightbox
│   ├── presupuesto.js    Validación con expresiones regulares y cálculo del presupuesto
│   └── contacto.js       Leaflet, Leaflet Routing Machine (OSRM) y Nominatim
├── data/                 noticias.json y galeria.json
└── images/               Logotipo, ilustraciones de la galería e iconos de redes sociales
```

## Requisitos cubiertos

| Requisito | Dónde |
|---|---|
| Portada con ≥ 4 secciones y noticias desde un archivo externo (JSON) | `index.html`, `js/noticias.js` |
| Galería dinámica con JavaScript | `views/galeria.html`, `js/galeria.js` |
| Validación: nombre (letras, ≤ 15), apellidos (letras, ≤ 40), teléfono (números, 9), correo | `js/presupuesto.js` |
| Producto (`select`), plazo (`input number`) con descuento, extras (`checkbox`) | `views/presupuesto.html` |
| Presupuesto en `<output>` actualizado sin botones ni recargar la página | `js/presupuesto.js` |
| Aceptación de condiciones y botones de enviar y borrar | `views/presupuesto.html` |
| Mapa con la ubicación del negocio y la ruta hasta el cliente | `views/contacto.html`, `js/contacto.js` |
| Logotipo, barra de navegación fija con la página activa resaltada y footer con redes, dirección y aviso legal | Todas las páginas |

**Descuentos por plazo:** de 7 a 14 días, 5 %; de 15 a 29 días, 10 %; 30 días o más, 15 %.


## Enlaces

- **Repositorio:** https://github.com/manuelx91/CURSO
- **Sitio web en GitHub Pages:** https://manuelx91.github.io/CURSO/

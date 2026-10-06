/* =========================================================
   main.js · Comportamiento común a todas las páginas
   - Menú hamburguesa en móvil
   - Sombra en la barra de navegación al hacer scroll
   - Año actual en el pie de página
   ========================================================= */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Menú desplegable en móvil ----------
  const boton = document.querySelector('.menu-boton');
  const menu = document.getElementById('menu');

  if (boton && menu) {
    boton.addEventListener('click', () => {
      const abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('menu--abierto', !abierto);
    });

    // Cierra el menú al pulsar un enlace (útil en móvil)
    menu.querySelectorAll('a').forEach((enlace) => {
      enlace.addEventListener('click', () => {
        boton.setAttribute('aria-expanded', 'false');
        menu.classList.remove('menu--abierto');
      });
    });
  }

  // ---------- Sombra de la cabecera al desplazarse ----------
  const cabecera = document.getElementById('cabecera');
  const actualizarCabecera = () => {
    cabecera.classList.toggle('cabecera--scroll', window.scrollY > 10);
  };
  window.addEventListener('scroll', actualizarCabecera, { passive: true });
  actualizarCabecera();

  // ---------- Año actual en el footer ----------
  document.querySelectorAll('.anio-actual').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});

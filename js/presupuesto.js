/* =========================================================
   presupuesto.js · Validación del formulario y cálculo en vivo
   Parte 1: validación de datos de contacto con expresiones regulares
   Parte 2: cálculo del presupuesto (producto + extras − descuento)
            que se actualiza con cada cambio, sin botones ni recargas
   ========================================================= */
'use strict';

(function () {
  const form = document.getElementById('form-presupuesto');
  if (!form) return;

  // ---------- Referencias a los campos ----------
  const campos = {
    nombre: document.getElementById('nombre'),
    apellidos: document.getElementById('apellidos'),
    telefono: document.getElementById('telefono'),
    email: document.getElementById('email')
  };
  const producto = document.getElementById('producto');
  const plazo = document.getElementById('plazo');
  const extras = form.querySelectorAll('input[name="extras"]');
  const condiciones = document.getElementById('condiciones');
  const total = document.getElementById('total');
  const mensaje = document.getElementById('mensaje-form');

  // Formateador de moneda en euros (formato español)
  const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

  /* =======================================================
     PARTE 1 · VALIDACIÓN DE DATOS DE CONTACTO
     ======================================================= */

  // Reglas: expresión regular + mensaje de error para cada campo.
  // \p{L} = cualquier letra Unicode (incluye tildes y ñ). Se permiten
  // espacios simples entre palabras para nombres y apellidos compuestos.
  const reglas = {
    nombre: {
      regex: /^(?=.{1,15}$)\p{L}+(?: \p{L}+)*$/u,
      error: 'Solo letras, máximo 15 caracteres.'
    },
    apellidos: {
      regex: /^(?=.{1,40}$)\p{L}+(?: \p{L}+)*$/u,
      error: 'Solo letras, máximo 40 caracteres.'
    },
    telefono: {
      regex: /^[0-9]{9}$/,
      error: 'Solo números, 9 dígitos.'
    },
    email: {
      regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      error: 'Introduce un correo válido, por ejemplo nombre_apellido@dominio.com.'
    }
  };

  /** Marca un campo como correcto o erróneo y muestra el mensaje. */
  function marcarCampo(input, valido, texto) {
    const contenedor = input.closest('.campo') || input.parentElement;
    const error = document.getElementById('error-' + input.id);
    contenedor.classList.toggle('campo--error', !valido);
    contenedor.classList.toggle('campo--ok', valido);
    input.setAttribute('aria-invalid', String(!valido));
    if (error) error.textContent = valido ? '' : texto;
  }

  /** Valida un campo de contacto. Devuelve true si es correcto. */
  function validarCampo(nombreCampo) {
    const input = campos[nombreCampo];
    const valor = input.value.trim();

    if (valor === '') {
      marcarCampo(input, false, 'Este campo es obligatorio.');
      return false;
    }
    const ok = reglas[nombreCampo].regex.test(valor);
    marcarCampo(input, ok, reglas[nombreCampo].error);
    return ok;
  }

  // Validación en vivo: al salir del campo y mientras se corrige
  Object.keys(campos).forEach((clave) => {
    const input = campos[clave];
    input.addEventListener('blur', () => validarCampo(clave));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validarCampo(clave);
    });
  });

  // El teléfono no admite caracteres que no sean números
  campos.telefono.addEventListener('input', () => {
    campos.telefono.value = campos.telefono.value.replace(/\D/g, '').slice(0, 9);
  });

  /* =======================================================
     PARTE 2 · CÁLCULO DEL PRESUPUESTO
     ======================================================= */

  /** Devuelve el % de descuento según los días de entrega. */
  function calcularDescuento(dias) {
    if (dias >= 30) return 15;
    if (dias >= 15) return 10;
    if (dias >= 7) return 5;
    return 0;
  }

  /** Recalcula el presupuesto y lo muestra en el <output>. */
  function actualizarPresupuesto() {
    const precioProducto = Number(producto.selectedOptions[0].dataset.precio) || 0;

    let precioExtras = 0;
    extras.forEach((check) => {
      if (check.checked) precioExtras += Number(check.dataset.precio);
    });

    const dias = parseInt(plazo.value, 10);
    const descuento = Number.isNaN(dias) ? 0 : calcularDescuento(dias);

    const subtotal = precioProducto + precioExtras;
    const final = subtotal * (1 - descuento / 100);

    // Desglose
    document.getElementById('resumen-producto').textContent = euros.format(precioProducto);
    document.getElementById('resumen-extras').textContent = euros.format(precioExtras);
    document.getElementById('resumen-descuento').textContent =
      descuento + ' %' + (descuento ? ' (−' + euros.format(subtotal - final) + ')' : '');

    total.value = euros.format(final);
  }

  /** Comprueba producto y plazo. */
  function validarPresupuesto() {
    const okProducto = producto.value !== '';
    marcarCampo(producto, okProducto, 'Elige un producto.');

    const dias = Number(plazo.value);
    const okPlazo = Number.isInteger(dias) && dias >= 1 && dias <= 90;
    marcarCampo(plazo, okPlazo, 'Indica un plazo entre 1 y 90 días.');

    return okProducto && okPlazo;
  }

  // Cualquier cambio en producto, plazo o extras recalcula al momento
  [producto, plazo, ...extras].forEach((el) => {
    el.addEventListener('input', actualizarPresupuesto);
    el.addEventListener('change', actualizarPresupuesto);
  });

  /* =======================================================
     PARTE 3 · ENVÍO Y RESETEO
     ======================================================= */
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // Se validan todos los campos (sin cortocircuito, para marcar todos los errores)
    const contactoOk = Object.keys(campos)
      .map(validarCampo)
      .every(Boolean);
    const presupuestoOk = validarPresupuesto();

    const condicionesOk = condiciones.checked;
    document.getElementById('error-condiciones').textContent =
      condicionesOk ? '' : 'Debes aceptar la política de privacidad.';

    mensaje.hidden = false;

    if (contactoOk && presupuestoOk && condicionesOk) {
      mensaje.className = 'mensaje mensaje--ok';
      mensaje.textContent = 'Gracias, ' + campos.nombre.value.trim() +
        '. Hemos recibido tu solicitud por ' + total.value +
        '. Te escribiremos a ' + campos.email.value.trim() + ' en menos de 24 horas.';
      // En un proyecto real aquí se enviarían los datos al servidor (fetch POST)
    } else {
      mensaje.className = 'mensaje mensaje--error';
      mensaje.textContent = 'Revisa los campos marcados en rojo antes de enviar.';
      const primerError = form.querySelector('[aria-invalid="true"]') || condiciones;
      primerError.focus();
    }
  });

  form.addEventListener('reset', () => {
    // Esperamos a que el navegador restablezca los valores
    setTimeout(() => {
      form.querySelectorAll('.campo--error, .campo--ok').forEach((c) => c.classList.remove('campo--error', 'campo--ok'));
      form.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
      form.querySelectorAll('.campo__error').forEach((p) => { p.textContent = ''; });
      mensaje.hidden = true;
      actualizarPresupuesto();
    }, 0);
  });

  // Cálculo inicial
  actualizarPresupuesto();
})();

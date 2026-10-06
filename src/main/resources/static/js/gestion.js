(function () {
    'use strict';

    var tabsEl = document.getElementById('tabs');
    var panelesEl = document.getElementById('paneles');

    function el(tag, clase, texto) {
        var e = document.createElement(tag);
        if (clase) { e.className = clase; }
        if (texto !== undefined) { e.textContent = texto; }
        return e;
    }

    function fecha(v) {
        if (Array.isArray(v)) {
            return v[0] + '-' + String(v[1]).padStart(2, '0') + '-' + String(v[2]).padStart(2, '0');
        }
        return v || '';
    }

    function limpios(lista) {
        return (lista || []).filter(function (x) { return x; });
    }

    function nombreCompleto(d) { return d.nombre + ' ' + d.apellido; }

    // ------------------------------------------------------------------
    // Configuración de cada recurso: ruta de la API, campos del formulario y columnas de la tabla
    // ------------------------------------------------------------------
    var entrenadores = {
        clave: 'entrenadores', titulo: 'Entrenadores', singular: 'entrenador', ruta: '/api/entrenadores',
        campos: [
            { n: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
            { n: 'apellido', etiqueta: 'Apellido', tipo: 'text' },
            { n: 'edad', etiqueta: 'Edad', tipo: 'number' },
            { n: 'nacionalidad', etiqueta: 'Nacionalidad', tipo: 'text' }
        ],
        columnas: [
            ['Nombre', nombreCompleto],
            ['Edad', function (d) { return d.edad; }],
            ['Nacionalidad', function (d) { return d.nacionalidad; }]
        ]
    };
    var asociaciones = {
        clave: 'asociaciones', titulo: 'Asociaciones', singular: 'asociación', ruta: '/api/asociaciones',
        campos: [
            { n: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
            { n: 'pais', etiqueta: 'País', tipo: 'text' },
            { n: 'presidente', etiqueta: 'Presidente', tipo: 'text' }
        ],
        columnas: [
            ['Nombre', function (d) { return d.nombre; }],
            ['País', function (d) { return d.pais; }],
            ['Presidente', function (d) { return d.presidente; }]
        ]
    };
    var jugadores = {
        clave: 'jugadores', titulo: 'Jugadores', singular: 'jugador', ruta: '/api/jugadores',
        campos: [
            { n: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
            { n: 'apellido', etiqueta: 'Apellido', tipo: 'text' },
            { n: 'numero', etiqueta: 'Número de camiseta', tipo: 'number' },
            { n: 'posicion', etiqueta: 'Posición', tipo: 'text' }
        ],
        columnas: [
            ['Nombre', nombreCompleto],
            ['Número', function (d) { return d.numero; }],
            ['Posición', function (d) { return d.posicion; }]
        ]
    };
    var competiciones = {
        clave: 'competiciones', titulo: 'Competiciones', singular: 'competición', ruta: '/api/competiciones',
        campos: [
            { n: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
            { n: 'montoPremio', etiqueta: 'Monto del premio', tipo: 'number' },
            { n: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'date' },
            { n: 'fechaFin', etiqueta: 'Fecha de fin', tipo: 'date' }
        ],
        columnas: [
            ['Nombre', function (d) { return d.nombre; }],
            ['Premio', function (d) { return d.montoPremio; }],
            ['Inicio', function (d) { return fecha(d.fechaInicio); }],
            ['Fin', function (d) { return fecha(d.fechaFin); }]
        ]
    };
    var clubes = {
        clave: 'clubes', titulo: 'Clubes', singular: 'club', ruta: '/api/clubes',
        campos: [
            { n: 'nombre', etiqueta: 'Nombre del club', tipo: 'text' },
            { n: 'entrenador', etiqueta: 'Entrenador (uno a uno)', tipo: 'ref', fuente: entrenadores, texto: nombreCompleto, obligatorio: true },
            { n: 'asociacion', etiqueta: 'Asociación (muchos a uno)', tipo: 'ref', fuente: asociaciones,
              texto: function (d) { return d.nombre; }, obligatorio: true },
            { n: 'jugadores', etiqueta: 'Jugadores (uno a muchos)', tipo: 'refs', fuente: jugadores,
              texto: function (d) { return '#' + d.numero + ' ' + nombreCompleto(d); } },
            { n: 'competiciones', etiqueta: 'Competiciones (muchos a muchos)', tipo: 'refs', fuente: competiciones,
              texto: function (d) { return d.nombre; } }
        ],
        columnas: [
            ['Nombre', function (d) { return d.nombre; }],
            ['Entrenador', function (d) { return d.entrenador ? nombreCompleto(d.entrenador) : '(referencia rota)'; }],
            ['Asociación', function (d) { return d.asociacion ? d.asociacion.nombre : '(referencia rota)'; }],
            ['Jugadores', function (d) { return limpios(d.jugadores).map(nombreCompleto).join(', ') || '—'; }],
            ['Competiciones', function (d) {
                return limpios(d.competiciones).map(function (c) { return c.nombre; }).join(', ') || '—';
            }]
        ]
    };

    var recursos = [entrenadores, asociaciones, jugadores, competiciones, clubes];

    // ------------------------------------------------------------------
    // Llamadas a la API
    // ------------------------------------------------------------------
    async function pedir(metodo, url, body) {
        var opciones = { method: metodo, headers: {} };
        if (body !== undefined) {
            opciones.headers['Content-Type'] = 'application/json';
            opciones.body = JSON.stringify(body);
        }
        var resp = await fetch(url, opciones);
        var texto = await resp.text();
        var datos = null;
        try { datos = texto ? JSON.parse(texto) : null; } catch (e) { datos = null; }
        return { ok: resp.ok, status: resp.status, datos: datos };
    }

    function mensajeError(r) {
        if (r.datos && r.datos.message) { return r.datos.message; }
        return 'Error ' + r.status;
    }

    // ------------------------------------------------------------------
    // Construcción de cada pestaña
    // ------------------------------------------------------------------
    function avisar(r, tipo, texto) {
        r.avisoEl.textContent = '';
        if (!texto) { return; }
        var a = el('div', 'alert alert-' + tipo + ' py-2', texto);
        r.avisoEl.appendChild(a);
    }

    function crearPanel(r, activo) {
        r.inputs = {};
        r.editId = null;

        // pestaña
        var li = el('li', 'nav-item');
        var btn = el('button', 'nav-link' + (activo ? ' active' : ''), r.titulo);
        btn.type = 'button';
        btn.setAttribute('data-bs-toggle', 'tab');
        btn.setAttribute('data-bs-target', '#panel-' + r.clave);
        btn.addEventListener('shown.bs.tab', function () { cargar(r); });
        li.appendChild(btn);
        tabsEl.appendChild(li);

        // panel
        var panel = el('div', 'tab-pane fade' + (activo ? ' show active' : ''));
        panel.id = 'panel-' + r.clave;
        r.avisoEl = el('div');
        panel.appendChild(r.avisoEl);

        var fila = el('div', 'row g-3');
        var colForm = el('div', 'col-12 col-lg-4');
        var colTabla = el('div', 'col-12 col-lg-8');

        // formulario
        var card = el('div', 'card');
        r.tituloForm = el('div', 'card-header fw-semibold', 'Nuevo ' + r.singular);
        card.appendChild(r.tituloForm);
        var form = el('form', 'card-body');
        form.noValidate = false;
        r.form = form;

        r.campos.forEach(function (c) {
            var grupo = el('div', 'mb-3');
            var etiqueta = el('label', 'form-label', c.etiqueta);
            var input;
            if (c.tipo === 'ref') {
                input = el('select', 'form-select');
            } else if (c.tipo === 'refs') {
                input = el('select', 'form-select');
                input.multiple = true;
                input.size = 5;
            } else {
                input = el('input', 'form-control');
                input.type = c.tipo;
                if (c.tipo === 'number') { input.min = '0'; }
            }
            if (c.tipo === 'text' || c.tipo === 'number' || c.tipo === 'date' || c.obligatorio) {
                input.required = true;
            }
            etiqueta.htmlFor = 'f-' + r.clave + '-' + c.n;
            input.id = 'f-' + r.clave + '-' + c.n;
            r.inputs[c.n] = input;
            grupo.appendChild(etiqueta);
            grupo.appendChild(input);
            if (c.tipo === 'refs') {
                grupo.appendChild(el('div', 'form-text', 'Mantén Ctrl (o Cmd) y haz clic para elegir varios. Es opcional.'));
            }
            form.appendChild(grupo);
        });

        var acciones = el('div', 'd-flex gap-2');
        r.btnGuardar = el('button', 'btn btn-success', 'Guardar');
        r.btnGuardar.type = 'submit';
        r.btnCancelar = el('button', 'btn btn-outline-secondary d-none', 'Cancelar edición');
        r.btnCancelar.type = 'button';
        r.btnCancelar.addEventListener('click', function () { limpiarForm(r); });
        acciones.appendChild(r.btnGuardar);
        acciones.appendChild(r.btnCancelar);
        form.appendChild(acciones);
        form.addEventListener('submit', function (ev) { ev.preventDefault(); guardar(r); });
        card.appendChild(form);
        colForm.appendChild(card);

        // tabla
        var cardT = el('div', 'card');
        cardT.appendChild(el('div', 'card-header fw-semibold', 'Registros de ' + r.titulo.toLowerCase()));
        var cuerpo = el('div', 'table-responsive');
        r.tablaEl = el('div');
        cuerpo.appendChild(r.tablaEl);
        cardT.appendChild(cuerpo);
        colTabla.appendChild(cardT);

        fila.appendChild(colForm);
        fila.appendChild(colTabla);
        panel.appendChild(fila);
        panelesEl.appendChild(panel);
    }

    function limpiarForm(r) {
        r.form.reset();
        r.editId = null;
        r.tituloForm.textContent = 'Nuevo ' + r.singular;
        r.btnGuardar.textContent = 'Guardar';
        r.btnCancelar.classList.add('d-none');
    }

    // ------------------------------------------------------------------
    // Carga de datos y opciones de los select
    // ------------------------------------------------------------------
    async function cargarOpciones(r) {
        for (var i = 0; i < r.campos.length; i++) {
            var c = r.campos[i];
            if (c.tipo !== 'ref' && c.tipo !== 'refs') { continue; }
            var resp = await pedir('GET', c.fuente.ruta);
            var select = r.inputs[c.n];
            var seleccionados = Array.prototype.filter.call(select.options, function (o) { return o.selected; })
                .map(function (o) { return o.value; });
            select.textContent = '';
            if (c.tipo === 'ref') {
                var vacio = el('option', undefined, '— Selecciona —');
                vacio.value = '';
                select.appendChild(vacio);
            }
            (resp.datos || []).forEach(function (d) {
                var o = el('option', undefined, c.texto(d));
                o.value = d.id;
                o.selected = seleccionados.indexOf(String(d.id)) !== -1;
                select.appendChild(o);
            });
        }
    }

    async function cargar(r) {
        try {
            await cargarOpciones(r);
            var resp = await pedir('GET', r.ruta);
            if (!resp.ok) { avisar(r, 'danger', mensajeError(resp)); return; }
            r.datos = resp.datos || [];
            pintarTabla(r);
        } catch (e) {
            avisar(r, 'danger', 'No se pudo conectar con la API: ' + e.message);
        }
    }

    function pintarTabla(r) {
        r.tablaEl.textContent = '';
        if (!r.datos.length) {
            r.tablaEl.appendChild(el('p', 'text-muted p-3 mb-0', 'Aún no hay registros. Usa el formulario para crear el primero.'));
            return;
        }
        var tabla = el('table', 'table table-striped table-hover align-middle mb-0');
        var thead = el('thead', 'table-dark');
        var trh = el('tr');
        r.columnas.forEach(function (col) { trh.appendChild(el('th', undefined, col[0])); });
        trh.appendChild(el('th', 'text-end', 'Acciones'));
        thead.appendChild(trh);
        tabla.appendChild(thead);

        var tbody = el('tbody');
        r.datos.forEach(function (d) {
            var tr = el('tr');
            r.columnas.forEach(function (col) { tr.appendChild(el('td', undefined, String(col[1](d)))); });
            var td = el('td', 'text-end text-nowrap');
            var bEditar = el('button', 'btn btn-sm btn-outline-primary me-1', 'Editar');
            bEditar.type = 'button';
            bEditar.addEventListener('click', function () { editar(r, d); });
            var bBorrar = el('button', 'btn btn-sm btn-outline-danger', 'Eliminar');
            bBorrar.type = 'button';
            bBorrar.addEventListener('click', function () { eliminar(r, d); });
            td.appendChild(bEditar);
            td.appendChild(bBorrar);
            tr.appendChild(td);
            tbody.appendChild(tr);
        });
        tabla.appendChild(tbody);
        r.tablaEl.appendChild(tabla);
    }

    // ------------------------------------------------------------------
    // Crear / editar / eliminar
    // ------------------------------------------------------------------
    function construirCuerpo(r) {
        var cuerpo = {};
        r.campos.forEach(function (c) {
            var input = r.inputs[c.n];
            if (c.tipo === 'number') {
                cuerpo[c.n] = Number(input.value);
            } else if (c.tipo === 'ref') {
                cuerpo[c.n] = input.value ? { id: Number(input.value) } : null;
            } else if (c.tipo === 'refs') {
                cuerpo[c.n] = Array.prototype.filter.call(input.options, function (o) { return o.selected; })
                    .map(function (o) { return { id: Number(o.value) }; });
            } else {
                cuerpo[c.n] = input.value;
            }
        });
        return cuerpo;
    }

    async function guardar(r) {
        if (!r.form.reportValidity()) { return; }
        var editando = r.editId !== null;
        var url = editando ? r.ruta + '/' + r.editId : r.ruta;
        try {
            var resp = await pedir(editando ? 'PUT' : 'POST', url, construirCuerpo(r));
            if (!resp.ok) { avisar(r, 'danger', mensajeError(resp)); return; }
            avisar(r, 'success', editando ? 'Cambios guardados.' : 'Registro creado correctamente.');
            limpiarForm(r);
            await cargar(r);
        } catch (e) {
            avisar(r, 'danger', 'No se pudo conectar con la API: ' + e.message);
        }
    }

    function editar(r, d) {
        r.editId = d.id;
        r.campos.forEach(function (c) {
            var input = r.inputs[c.n];
            if (c.tipo === 'date') {
                input.value = fecha(d[c.n]);
            } else if (c.tipo === 'ref') {
                input.value = d[c.n] ? d[c.n].id : '';
            } else if (c.tipo === 'refs') {
                var ids = limpios(d[c.n]).map(function (x) { return String(x.id); });
                Array.prototype.forEach.call(input.options, function (o) { o.selected = ids.indexOf(o.value) !== -1; });
            } else {
                input.value = d[c.n];
            }
        });
        r.tituloForm.textContent = 'Editando ' + r.singular;
        r.btnGuardar.textContent = 'Guardar cambios';
        r.btnCancelar.classList.remove('d-none');
        avisar(r, 'info', 'Modifica los campos y pulsa "Guardar cambios" (se envía un PUT).');
    }

    async function eliminar(r, d) {
        var extra = r.clave === 'clubes' ? ' También se eliminarán sus jugadores.' : '';
        if (!window.confirm('¿Eliminar este ' + r.singular + '?' + extra)) { return; }
        try {
            var resp = await pedir('DELETE', r.ruta + '/' + d.id);
            if (!resp.ok) { avisar(r, 'danger', mensajeError(resp)); return; }
            avisar(r, 'success', 'Registro eliminado.');
            if (r.editId === d.id) { limpiarForm(r); }
            await cargar(r);
        } catch (e) {
            avisar(r, 'danger', 'No se pudo conectar con la API: ' + e.message);
        }
    }

    // ------------------------------------------------------------------
    // Inicio
    // ------------------------------------------------------------------
    recursos.forEach(function (r, i) { crearPanel(r, i === 0); });
    cargar(recursos[0]);
})();

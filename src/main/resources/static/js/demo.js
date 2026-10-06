(function () {
    'use strict';

    var ids = {};                       // ids que va devolviendo Mongo
    var logEl = document.getElementById('log');
    var pasosEl = document.getElementById('pasos');
    var primerRegistro = true;

    function el(tag, clase, texto) {
        var e = document.createElement(tag);
        if (clase) { e.className = clase; }
        if (texto !== undefined) { e.textContent = texto; }
        return e;
    }

    function pintarLog(metodo, url, body, estado, datos, esperado) {
        if (primerRegistro) { logEl.textContent = ''; primerRegistro = false; }
        var ok = (esperado === undefined) || (estado === esperado);
        var card = el('div', 'card mb-2');
        var head = el('div', 'card-header d-flex justify-content-between align-items-center');
        head.appendChild(el('span', 'fw-bold', metodo + ' ' + url));
        var texto = String(estado) + (esperado !== undefined ? ' (esperado ' + esperado + ')' : '');
        head.appendChild(el('span', 'badge ' + (ok ? 'bg-success' : 'bg-danger'), texto));
        card.appendChild(head);
        var cuerpo = el('div', 'card-body py-2');
        if (body !== undefined) {
            cuerpo.appendChild(el('div', 'small text-muted', 'Cuerpo enviado:'));
            cuerpo.appendChild(el('pre', 'bg-light border rounded p-2 small', JSON.stringify(body, null, 2)));
        }
        cuerpo.appendChild(el('div', 'small text-muted', 'Respuesta:'));
        var resp = (datos === null || datos === undefined || datos === '') ? '(sin cuerpo)' :
            (typeof datos === 'string' ? datos : JSON.stringify(datos, null, 2));
        cuerpo.appendChild(el('pre', 'bg-light border rounded p-2 small mb-0', resp));
        card.appendChild(cuerpo);
        logEl.insertBefore(card, logEl.firstChild);
    }

    function aviso(texto) {
        if (primerRegistro) { logEl.textContent = ''; primerRegistro = false; }
        logEl.insertBefore(el('div', 'alert alert-warning py-2', texto), logEl.firstChild);
    }

    async function llamar(metodo, url, body, esperado) {
        var opciones = { method: metodo, headers: {} };
        if (body !== undefined) {
            opciones.headers['Content-Type'] = 'application/json';
            opciones.body = JSON.stringify(body);
        }
        var resp = await fetch(url, opciones);
        var texto = await resp.text();
        var datos = null;
        try { datos = texto ? JSON.parse(texto) : null; } catch (e) { datos = texto; }
        pintarLog(metodo, url, body, resp.status, datos, esperado);
        return { status: resp.status, datos: datos };
    }

    function faltan(claves) {
        var f = claves.filter(function (k) { return !ids[k]; });
        if (f.length) {
            aviso('Primero ejecuta los pasos que crean: ' + f.join(', ') + '.');
            return true;
        }
        return false;
    }

    function cuerpoClub(nombre) {
        return {
            nombre: nombre,
            entrenador: { id: ids.entrenador },
            asociacion: { id: ids.asociacion },
            jugadores: [{ id: ids.jugador }],
            competiciones: [{ id: ids.competicion }]
        };
    }

    var pasos = [
        {
            titulo: '1. Crear un entrenador',
            detalle: 'POST /api/entrenadores',
            accion: async function () {
                var r = await llamar('POST', '/api/entrenadores',
                    { nombre: 'Alberto', apellido: 'Gamero', edad: 60, nacionalidad: 'Colombiana' }, 201);
                if (r.status === 201) { ids.entrenador = r.datos.id; }
                return r.status === 201;
            }
        },
        {
            titulo: '2. Crear una asociación',
            detalle: 'POST /api/asociaciones',
            accion: async function () {
                var r = await llamar('POST', '/api/asociaciones',
                    { nombre: 'Federación Colombiana de Fútbol', pais: 'Colombia', presidente: 'Ramón Jesurún' }, 201);
                if (r.status === 201) { ids.asociacion = r.datos.id; }
                return r.status === 201;
            }
        },
        {
            titulo: '3. Crear un jugador',
            detalle: 'POST /api/jugadores',
            accion: async function () {
                var r = await llamar('POST', '/api/jugadores',
                    { nombre: 'Radamel', apellido: 'Falcao', numero: 9, posicion: 'Delantero' }, 201);
                if (r.status === 201) { ids.jugador = r.datos.id; }
                return r.status === 201;
            }
        },
        {
            titulo: '4. Crear una competición',
            detalle: 'POST /api/competiciones',
            accion: async function () {
                var r = await llamar('POST', '/api/competiciones',
                    { nombre: 'Copa Libertadores', montoPremio: 15000000, fechaInicio: '2026-02-01', fechaFin: '2026-11-28' }, 201);
                if (r.status === 201) { ids.competicion = r.datos.id; }
                return r.status === 201;
            }
        },
        {
            titulo: '5. Crear el club con sus 4 relaciones',
            detalle: 'POST /api/clubes (envía solo los ids)',
            accion: async function () {
                if (faltan(['entrenador', 'asociacion', 'jugador', 'competicion'])) { return false; }
                var r = await llamar('POST', '/api/clubes', cuerpoClub('Millonarios'), 201);
                if (r.status === 201) { ids.club = r.datos.id; }
                return r.status === 201;
            }
        },
        {
            titulo: '6. Listar los clubes',
            detalle: 'GET /api/clubes (relaciones completas)',
            accion: async function () {
                var r = await llamar('GET', '/api/clubes', undefined, 200);
                return r.status === 200;
            }
        },
        {
            titulo: '7. Obtener el club por id',
            detalle: 'GET /api/clubes/{id}',
            accion: async function () {
                if (faltan(['club'])) { return false; }
                var r = await llamar('GET', '/api/clubes/' + ids.club, undefined, 200);
                return r.status === 200;
            }
        },
        {
            titulo: '8. Actualizar el club (cambiar el nombre)',
            detalle: 'PUT /api/clubes/{id}',
            accion: async function () {
                if (faltan(['club', 'entrenador', 'asociacion', 'jugador', 'competicion'])) { return false; }
                var r = await llamar('PUT', '/api/clubes/' + ids.club, cuerpoClub('Millonarios FC (editado)'), 200);
                return r.status === 200;
            }
        },
        {
            titulo: '9. Error esperado: entrenador inexistente',
            detalle: 'POST /api/clubes con un id falso → 400',
            accion: async function () {
                var cuerpo = {
                    nombre: 'Club inválido',
                    entrenador: { id: 999999 },
                    asociacion: { id: ids.asociacion || 999999 },
                    jugadores: [],
                    competiciones: []
                };
                var r = await llamar('POST', '/api/clubes', cuerpo, 400);
                return r.status === 400;
            }
        },
        {
            titulo: '10. Eliminar el club',
            detalle: 'DELETE /api/clubes/{id} → 204',
            accion: async function () {
                if (faltan(['club'])) { return false; }
                var r = await llamar('DELETE', '/api/clubes/' + ids.club, undefined, 204);
                if (r.status === 204) { ids.clubEliminado = true; delete ids.club; }
                return r.status === 204;
            }
        },
        {
            titulo: '11. Comprobar el cascade (el jugador ya no existe)',
            detalle: 'GET /api/jugadores/{id} → 404',
            accion: async function () {
                if (faltan(['jugador'])) { return false; }
                var r = await llamar('GET', '/api/jugadores/' + ids.jugador, undefined, 404);
                return r.status === 404;
            }
        },
        {
            titulo: '12. Limpiar los datos de la demo',
            detalle: 'DELETE entrenador, asociación y competición',
            accion: async function () {
                var ok = true;
                var borrar = [['entrenadores', 'entrenador'], ['asociaciones', 'asociacion'], ['competiciones', 'competicion']];
                for (var i = 0; i < borrar.length; i++) {
                    var id = ids[borrar[i][1]];
                    if (id) {
                        var r = await llamar('DELETE', '/api/' + borrar[i][0] + '/' + id, undefined, 204);
                        if (r.status !== 204) { ok = false; }
                    }
                }
                ids = {};
                return ok;
            }
        }
    ];

    var botones = [];
    var estados = [];

    pasos.forEach(function (paso, i) {
        var card = el('div', 'card');
        var body = el('div', 'card-body py-2 d-flex justify-content-between align-items-center gap-2');
        var texto = el('div');
        texto.appendChild(el('div', 'fw-semibold', paso.titulo));
        texto.appendChild(el('code', 'small', paso.detalle));
        var der = el('div', 'd-flex align-items-center gap-2');
        var estado = el('span', 'badge bg-secondary', 'pendiente');
        var btn = el('button', 'btn btn-sm btn-outline-primary', 'Ejecutar');
        btn.type = 'button';
        btn.addEventListener('click', function () { ejecutar(i); });
        der.appendChild(estado);
        der.appendChild(btn);
        body.appendChild(texto);
        body.appendChild(der);
        card.appendChild(body);
        pasosEl.appendChild(card);
        botones.push(btn);
        estados.push(estado);
    });

    async function ejecutar(i) {
        botones[i].disabled = true;
        var ok = false;
        try {
            ok = await pasos[i].accion();
        } catch (e) {
            aviso('Error de red o de servidor en "' + pasos[i].titulo + '": ' + e.message);
        }
        estados[i].textContent = ok ? 'correcto' : 'falló';
        estados[i].className = 'badge ' + (ok ? 'bg-success' : 'bg-danger');
        botones[i].disabled = false;
        return ok;
    }

    document.getElementById('btnTodo').addEventListener('click', async function () {
        for (var i = 0; i < pasos.length; i++) {
            var ok = await ejecutar(i);
            if (!ok) { break; }
        }
    });

    document.getElementById('btnLimpiarLog').addEventListener('click', function () {
        logEl.textContent = '';
        logEl.appendChild(el('p', 'text-muted', 'Registro limpio.'));
        primerRegistro = true;
    });
})();

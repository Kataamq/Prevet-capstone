// Calendario de citas con FullCalendar: vistas por día, semana y mes.
(function () {
    var el = document.getElementById('calendario');
    if (!el || !window.FullCalendar) return;

    var filtroVet = document.getElementById('filtroVet');
    var panel = document.getElementById('panelCita');
    var fondo = document.getElementById('panelFondo');
    var contenido = document.getElementById('panelContenido');

    var calendario = new FullCalendar.Calendar(el, {
        locale: 'es',
        initialView: el.dataset.vista || 'timeGridWeek',
        initialDate: el.dataset.fecha || undefined,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth'
        },
        buttonText: { today: 'Hoy', day: 'Día', week: 'Semana', month: 'Mes' },
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        slotDuration: '00:30:00',
        allDaySlot: false,
        nowIndicator: true,
        weekends: true,
        height: 'auto',
        dayMaxEvents: 4,

        // Las citas se piden al servidor según el rango visible y el filtro.
        events: function (info, ok, error) {
            var url = el.dataset.eventos +
                '?start=' + info.startStr.slice(0, 10) +
                '&end=' + info.endStr.slice(0, 10) +
                '&veterinario=' + encodeURIComponent(filtroVet.value);
            fetch(url, { credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(ok)
                .catch(error);
        },

        eventDidMount: function (info) {
            var p = info.event.extendedProps;
            info.el.title = info.event.title + '\n' + p.cliente + ' · ' + p.profesional + '\n' + p.estado;
        },

        // Mientras llegan las citas desde la base de datos, se avisa.
        loading: function (cargando) {
            document.getElementById('calCargando').hidden = !cargando;
        },

        eventClick: function (info) {
            abrirPanel(info.event.id);
        },

        // Guarda en la dirección la vista y la fecha, para volver al mismo
        // lugar después de atender, cancelar o reagendar.
        datesSet: function () { guardarEnDireccion(); }
    });
    calendario.render();

    function guardarEnDireccion() {
        if (!calendario) return;
        var params = new URLSearchParams(window.location.search);
        params.set('vista', calendario.view.type);
        params.set('fecha', calendario.getDate().toISOString().slice(0, 10));
        if (filtroVet.value) params.set('veterinario', filtroVet.value);
        else params.delete('veterinario');
        history.replaceState(null, '', '?' + params.toString());
    }

    filtroVet.addEventListener('change', function () {
        calendario.refetchEvents();
        guardarEnDireccion();
    });

    // ---------- Panel lateral con el detalle ----------
    function abrirPanel(id) {
        contenido.innerHTML = '<p class="ayuda">Cargando…</p>';
        panel.classList.add('abierto');
        panel.setAttribute('aria-hidden', 'false');
        fondo.hidden = false;

        fetch('/citas/' + id + '/detalle/', { credentials: 'same-origin' })
            .then(function (r) { return r.text(); })
            .then(function (html) {
                contenido.innerHTML = html;
                // Después de actuar, se vuelve a esta misma vista del calendario.
                contenido.querySelectorAll('.volver-aqui').forEach(function (input) {
                    input.value = window.location.pathname + window.location.search;
                });
            });
    }

    function cerrarPanel() {
        panel.classList.remove('abierto');
        panel.setAttribute('aria-hidden', 'true');
        fondo.hidden = true;
    }

    document.getElementById('panelCerrar').addEventListener('click', cerrarPanel);
    fondo.addEventListener('click', cerrarPanel);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') cerrarPanel();
    });
})();

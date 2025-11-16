
const API = 'backend'; 

/* ---------- navegación de pantallas  ---------- */
function mostrarLogin() {
    ocultarTodo();
    document.getElementById("pantalla-login").style.display = "flex";
}

function mostrarRegistro() {
    ocultarTodo();
    document.getElementById("pantalla-registro").style.display = "flex";
}

function volverInicio() {
    ocultarTodo();
    document.getElementById("pantalla-bienvenida").style.display = "block";
}

function mostrarFormularioAlimento() {
    ocultarTodo();
    document.getElementById("pantalla-alimento").style.display = "flex";
}

function volverDashboard() {
    ocultarTodo();
    document.getElementById("pantalla-dashboard").style.display = "block";
    cargarAlimentos();
}

function ocultarTodo() {
    const pantallas = [
        "pantalla-bienvenida",
        "pantalla-login",
        "pantalla-registro",
        "pantalla-dashboard",
        "pantalla-alimento",
        "formulario-edicion"
    ];
    pantallas.forEach(id => document.getElementById(id).style.display = "none");
}

/* ---------- Autenticación ---------- */
async function iniciarSesion(event) {
    event.preventDefault();
    const correo = document.getElementById("login-correo").value;
    const password = document.getElementById("login-pass").value;
    try {
        const res = await fetch(`${API}/login.php`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error de login');
        alert(data.message);
        ocultarTodo();
        document.getElementById("pantalla-dashboard").style.display = "block";
        cargarAlimentos();

        // Mostrar contador de visitas
if (data.visitas) {
    const panelVisitas = document.getElementById("panel-visitas");
    panelVisitas.innerHTML = `
        <p>Total de visitas: ${data.visitas.total}</p>
        <p>Visitas en esta sesión: ${data.visitas.sesion}</p>
    `;
    panelVisitas.style.display = "block";
}

// Depuración: sirve mostrar lo que devolvió el servidor sobre cookies
if (data.debug) {
    console.log("DEBUG login.php:", data.debug);
}

// Depuración: sirve mostrar cookies visibles desde JS
console.log("document.cookie (cliente) ->", document.cookie);

    } catch (err) {
        alert(err.message);
    }
}

async function registrarUsuario(event) {
    event.preventDefault();
    const nombre = document.getElementById("reg-nombre").value;
    const correo = document.getElementById("reg-correo").value;
    const password = document.getElementById("reg-pass").value;

    try {
        const res = await fetch(`${API}/register.php`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error de registro');
        alert(data.message);
        ocultarTodo();
        document.getElementById("pantalla-dashboard").style.display = "block";
        cargarAlimentos();
    } catch (err) {
        alert(err.message);
    }
}

async function cerrarSesion() {
    try {
        const res = await fetch(`${API}/logout.php`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await res.json();
        alert(data.message || 'Sesión cerrada');
        volverInicio();
    } catch (err) {
        console.error(err);
        volverInicio();
    }
}

/* ---------- CRUD alimentos ---------- */

async function guardarAlimento(event) {
    event.preventDefault();
    const nombre = document.getElementById("nombre-alimento").value;
    const fecha = document.getElementById("fecha").value;

    if (!nombre || !fecha) {
        alert("Por favor completa todos los campos 🍎");
        return;
    }

    try {
        const res = await fetch(`${API}/add_alimento.php`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, fecha })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al guardar');
        alert(data.message);
        document.getElementById("nombre-alimento").value = "";
        document.getElementById("fecha").value = "";
        volverDashboard();
    } catch (err) {
        alert(err.message);
    }
}

async function cargarAlimentos() {
    const listaAlimentos = document.getElementById('listaAlimentos');
    listaAlimentos.innerHTML = "";

    try {
        const res = await fetch(`${API}/get_alimentos.php`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al obtener alimentos');

        const alimentos = data.alimentos || [];
        if (alimentos.length === 0) {
            listaAlimentos.innerHTML = "<li>No hay alimentos registrados.</li>";
            return;
        }

        const hoy = new Date().toISOString().split("T")[0];

        alimentos.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `🍽 ${item.nombre} | | Vence: ${item.fecha}`;
            li.style.backgroundColor = (item.fecha < hoy) ? "#f8d7da" : "#d4edda";
            li.className = "list-group-item d-flex justify-content-between align-items-center mb-3";

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "✏";
            btnEditar.className = "btn btn-sm btn-warning ms-2";
            btnEditar.onclick = () => editarAlimento(item.id);

            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "❌";
            btnEliminar.className = "btn btn-sm btn-danger ms-2";
            btnEliminar.onclick = () => eliminarAlimento(item.id);

            li.appendChild(btnEditar);
            li.appendChild(btnEliminar);
            listaAlimentos.appendChild(li);
        });

    } catch (err) {
        console.error(err);
        listaAlimentos.innerHTML = "<li>Error cargando alimentos.</li>";
    }
}

async function eliminarAlimento(id) {
    if (!confirm("¿Eliminar este alimento?")) return;
    try {
        const res = await fetch(`${API}/delete_alimento.php`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al eliminar');
        alert(data.message);
        cargarAlimentos();
    } catch (err) {
        alert(err.message);
    }
}

/* === EDICIÓN === */
let alimentoEditandoId = null;

async function editarAlimento(id) {
    // Permite obtener datos actuales del alimento
    try {
        const res = await fetch(`${API}/get_alimentos.php`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        const found = (data.alimentos || []).find(a => a.id == id);
        if (!found) throw new Error('Alimento no encontrado');

        alimentoEditandoId = id;
        ocultarTodo();
        document.getElementById("formulario-edicion").style.display = "flex";
        document.getElementById("editar-nombre").value = found.nombre;
        document.getElementById("editar-fecha").value = found.fecha;

    } catch (err) {
        alert(err.message);
    }
}

async function guardarCambios(event) {
    event.preventDefault();
    const nombre = document.getElementById("editar-nombre").value;
    const fecha = document.getElementById("editar-fecha").value;

    if (!nombre || !fecha) {
        alert("Por favor completa todos los campos 🍏");
        return;
    }

    try {
        const res = await fetch(`${API}/update_alimento.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ id: alimentoEditandoId, nombre, fecha })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al actualizar');
        alert(data.message);
        volverDashboard();
    } catch (err) {
        alert(err.message);
    }
}

async function eliminarActual() {
    if (!confirm("¿Eliminar este alimento?")) return;
    try {
        const res = await fetch(`${API}/delete_alimento.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ id: alimentoEditandoId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al eliminar');
        alert(data.message);
        volverDashboard();
    } catch (err) {
        alert(err.message);
    }
}

/* ---------- Tema ---------- */
function cambiarTema() {
    const body = document.body;
    body.classList.toggle('bg-light');
    body.classList.toggle('bg-dark');

    if (body.classList.contains("bg-dark")) {
        localStorage.setItem("modoOscuro", "true");
    } else {
        localStorage.setItem("modoOscuro", "false");
    }
}

/* ---------- Inicio ---------- */
document.addEventListener("DOMContentLoaded", async () => {
    // Restaurar tema
    if (localStorage.getItem("modoOscuro") === "true") {
        document.body.classList.remove('bg-light');
        document.body.classList.add('bg-dark');
    }

    // Validar si hay sesión activa
    try {
        const res = await fetch(`${API}/get_user.php`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.logged) {
            ocultarTodo();
            document.getElementById("pantalla-dashboard").style.display = "block";
            cargarAlimentos();
        } else {
            volverInicio();
        }
    } catch (err) {
        console.error(err);
        volverInicio();
    }
});

// ===========================
// 📌 Manejo de pantallas
// ===========================
function mostrarLogin() {
    ocultarTodo();
    document.getElementById("pantalla-login").style.display = "block";
}

function mostrarRegistro() {
    ocultarTodo();
    document.getElementById("pantalla-registro").style.display = "block";
}

function volverInicio() {
    ocultarTodo();
    document.getElementById("pantalla-bienvenida").style.display = "block";
}

function mostrarFormularioAlimento() {
    ocultarTodo();
    document.getElementById("pantalla-alimento").style.display = "block";
}

function volverDashboard() {
    ocultarTodo();
    document.getElementById("pantalla-dashboard").style.display = "block";
    mostrarAlimentos();
}

function ocultarTodo() {
    const pantallas = [
        "pantalla-bienvenida",
        "pantalla-login",
        "pantalla-registro",
        "pantalla-dashboard",
        "pantalla-alimento",
        "formulario-edicion",
    ];
    pantallas.forEach(id => document.getElementById(id).style.display = "none");
}

// ===========================
// 👤 Simulación de auth
// ===========================
function iniciarSesion(event) {
    event.preventDefault();
    alert("Inicio de sesión exitoso ✅");
    volverDashboard();
}

function registrarUsuario(event) {
    event.preventDefault();
    alert("Usuario registrado correctamente 📝");
    volverInicio();
}

// ===========================
// 🧺 Gestión de alimentos (LocalStorage)
// ===========================
function guardarAlimento(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre-alimento").value;
    const fecha = document.getElementById("fecha-vencimiento").value;

    if (!nombre || !fecha) {
        alert("Por favor completa todos los campos 🍎");
        return;
    }

    let alimentos = JSON.parse(localStorage.getItem("alimentos")) || [];
    alimentos.push({ nombre, fecha });
    localStorage.setItem("alimentos", JSON.stringify(alimentos));

    document.getElementById("nombre-alimento").value = "";
    document.getElementById("fecha-vencimiento").value = "";

    alert("✅ Alimento guardado correctamente");
    volverDashboard();
}

// ===========================
// 🧠 Spoonacular API
// ===========================
const API_KEY = "571784a94d9146bebd64765d0d1adeb3";
const API_URL = "https://api.spoonacular.com/recipes/complexSearch";

async function buscarRecetas(nombreAlimento) {
    try {
        const response = await fetch(`${API_URL}?apiKey=${API_KEY}&query=${encodeURIComponent(nombreAlimento)}&number=2`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error API:", error);
        return [];
    }
}

async function consultarRecetas(nombre, index) {
    const contenedor = document.getElementById(`recetas-${index}`);
    contenedor.innerHTML = "⏳ Buscando recetas...";

    const recetas = await buscarRecetas(nombre);

    if (!recetas.length) {
        contenedor.innerHTML = `🔎 No se encontraron recetas para ${nombre}`;
        return;
    }

    let html = "";
    recetas.forEach(r => {
        html += `
        <div style="background:#fffbea; padding:6px; border-radius:5px; margin-top:5px;">
            🍳 <strong>${r.title}</strong><br>
            <img src="${r.image}" width="120" style="border-radius:8px; margin-top:5px;">
        </div>`;
    });

    contenedor.innerHTML = html;
}

// ===========================
// 📋 Mostrar alimentos
// ===========================
async function mostrarAlimentos() {
    const lista = document.getElementById("listaAlimentos");
    lista.innerHTML = "";

    const alimentos = JSON.parse(localStorage.getItem("alimentos")) || [];

    if (!alimentos.length) {
        lista.innerHTML = "<li>No hay alimentos registrados.</li>";
        return;
    }

    const hoy = new Date().toISOString().split("T")[0];

    for (let i = 0; i < alimentos.length; i++) {
        const item = alimentos[i];

        const li = document.createElement("li");
        li.style.padding = "10px";
        li.style.borderRadius = "6px";
        li.style.marginTop = "10px";
        li.style.backgroundColor = (item.fecha < hoy) ? "#f8d7da" : "#d4edda";

        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>🍽 <strong>${item.nombre}</strong> - Vence: ${item.fecha}</span>
                <span>
                    <button onclick="editarAlimento(${i})">✏ Editar</button>
                    <button onclick="eliminarAlimento(${i})">🗑 Eliminar</button>
                    <button onclick="consultarRecetas('${item.nombre}', ${i})">🍳 Ver recetas</button>
                </span>
            </div>
            <div id="recetas-${i}" style="margin-top:6px;"></div>
        `;

        lista.appendChild(li);
    }
}

// ===========================
// 🗑 Editar / Eliminar alimentos
// ===========================
let alimentoEditando = null;

function eliminarAlimento(index) {
    let alimentos = JSON.parse(localStorage.getItem("alimentos")) || [];
    alimentos.splice(index, 1);
    localStorage.setItem("alimentos", JSON.stringify(alimentos));
    mostrarAlimentos();
}

function editarAlimento(index) {
    ocultarTodo();
    document.getElementById("formulario-edicion").style.display = "block";

    const alimentos = JSON.parse(localStorage.getItem("alimentos")) || [];
    alimentoEditando = index;

    document.getElementById("editar-nombre").value = alimentos[index].nombre;
    document.getElementById("editar-fecha").value = alimentos[index].fecha;
}

function guardarCambios(event) {
    event.preventDefault();

    const nombre = document.getElementById("editar-nombre").value;
    const fecha = document.getElementById("editar-fecha").value;

    if (!nombre || !fecha) {
        alert("Por favor completa los campos 🍏");
        return;
    }

    let alimentos = JSON.parse(localStorage.getItem("alimentos")) || [];
    alimentos[alimentoEditando] = { nombre, fecha };
    localStorage.setItem("alimentos", JSON.stringify(alimentos));

    alert("✅ Cambios guardados correctamente");
    volverDashboard();
}

// ===========================
// 🌙 Modo oscuro
// ===========================
function cambiarTema() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("modoOscuro", document.body.classList.contains("dark-mode"));
}

// ===========================
// 🚪 Cerrar sesión
// ===========================
function cerrarSesion() {
    alert("Has cerrado sesión 👋");
    volverInicio();
}

document.addEventListener("DOMContentLoaded", mostrarAlimentos);
